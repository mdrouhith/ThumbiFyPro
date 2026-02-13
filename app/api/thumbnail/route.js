const buildPrompt = ({ prompt, title, subtitle, ratio, style, mood, brandColor, accentColor }) => {
    const heading = title ? `Main headline: ${title}.` : "";
    const sub = subtitle ? `Subtitle: ${subtitle}.` : "";
    return [
        "Create a professional YouTube thumbnail.",
        `Aspect ratio ${ratio}.`,
        `Visual style: ${style}.`,
        `Mood: ${mood}.`,
        `Brand palette: ${brandColor} and ${accentColor}.`,
        heading,
        sub,
        `Creative direction: ${prompt}.`,
    ]
        .filter(Boolean)
        .join(" ");
};

export async function POST(request) {
    const body = await request.json().catch(() => null);

    if (!body?.prompt) {
        return Response.json({ error: "Prompt is required." }, { status: 400 });
    }

    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleApiUrl = process.env.GOOGLE_IMAGE_API_URL;
    const mode = process.env.GOOGLE_IMAGE_API_MODE || "imagen";
    const provider = body?.provider || (mode === "openrouter" ? "openrouter" : "google");

    if (provider === "openrouter") {
        const orKey = process.env.OPENROUTER_API_KEY;
        const orModel = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-image-preview";
        if (!orKey) {
            return Response.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 400 });
        }

        const fullPrompt = buildPrompt(body);
        const aspectMap = {
            "1:1": "1:1",
            "2:3": "2:3",
            "3:2": "3:2",
            "3:4": "3:4",
            "4:3": "4:3",
            "4:5": "4:5",
            "5:4": "5:4",
            "9:16": "9:16",
            "16:9": "16:9",
            "21:9": "21:9",
        };
        const aspect_ratio = aspectMap[body?.ratio] || "16:9";
        const image_size = body?.imageSize || "1K";

        const messages = [
            {
                role: "user",
                content: [
                    { type: "text", text: fullPrompt },
                    ...(body?.inspirationImage
                        ? [
                              {
                                  type: "image_url",
                                  image_url: { url: body.inspirationImage },
                                  imageUrl: { url: body.inspirationImage },
                              },
                          ]
                        : []),
                ],
            },
        ];

        const orResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${orKey}`,
            },
            body: JSON.stringify({
                model: body?.openrouterModel || orModel,
                modalities: (body?.openrouterModel || orModel).includes("gemini") ? ["image", "text"] : ["image"],
                image_config: {
                    aspect_ratio,
                    image_size,
                    ...(body?.enhance && body?.inspirationImage ? {
                         super_resolution_references: [{
                             url: body.inspirationImage,
                             weight: 1.0
                         }]
                    } : {})
                },
                messages,
                stream: false,
            }),
        });
        const orData = await orResp.json().catch(() => ({}));
        if (!orResp.ok) {
            const errorMessage = orData?.error?.message || (typeof orData?.error === "string" ? orData?.error : JSON.stringify(orData?.error)) || "OpenRouter request failed.";
            return Response.json({ error: errorMessage }, { status: orResp.status });
        }

        let dataUrl = orData?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
                      orData?.choices?.[0]?.message?.images?.[0]?.imageUrl?.url ||
                      null;

        if (!dataUrl && body?.enhance && orData?.choices?.[0]?.message?.images?.[0]?.url) {
             dataUrl = orData?.choices?.[0]?.message?.images?.[0]?.url;
        }
        if (!dataUrl) {
            const content = orData?.choices?.[0]?.message?.content;
            if (Array.isArray(content)) {
                for (const part of content) {
                    const maybeUrl =
                        part?.image_url?.url ||
                        part?.imageUrl?.url ||
                        (typeof part === "object" && typeof part?.text === "string" && part.text.includes("data:image"))
                            ? part?.text
                            : null;
                    if (typeof maybeUrl === "string" && maybeUrl.startsWith("data:image")) {
                        dataUrl = maybeUrl;
                        break;
                    }
                }
            } else if (typeof content === "string" && content.startsWith("data:image")) {
                dataUrl = content;
            }
        }

        if (!dataUrl) {
            return Response.json({
                error: "Model did not return an image. Ensure the model supports image output and include modalities/image_config.",
                debug: orData,
            }, { status: 502 });
        }

        return Response.json({
            imageUrl: dataUrl,
            usedPrompt: fullPrompt,
            provider: "openrouter",
        });
    }

    if (!googleApiKey || !googleApiUrl) {
        return Response.json(
            { error: "Google API is not configured. Set GOOGLE_API_KEY and GOOGLE_IMAGE_API_URL." },
            { status: 400 }
        );
    }

    const fullPrompt = buildPrompt(body);
    const payload =
        mode === "vertex"
            ? {
                  instances: [{ prompt: fullPrompt }],
                  parameters: { aspectRatio: body.ratio, numberOfImages: 1 },
              }
            : {
                  prompt: { text: fullPrompt },
                  imageGenerationConfig: {
                      numberOfImages: 1,
                      aspectRatio: body.ratio,
                  },
              };

    const url = googleApiUrl.includes("?") ? `${googleApiUrl}&key=${googleApiKey}` : `${googleApiUrl}?key=${googleApiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        return Response.json({ error: data?.error?.message || "Google API request failed." }, { status: response.status });
    }

    const imageBase64 =
        data?.generatedImages?.[0]?.image?.imageBytes ||
        data?.predictions?.[0]?.bytesBase64Encoded ||
        data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ||
        data?.images?.[0]?.data ||
        data?.data?.[0]?.b64_json;

    if (!imageBase64) {
        return Response.json({ error: "No image returned from Google API." }, { status: 502 });
    }

    return Response.json({
        imageUrl: `data:image/png;base64,${imageBase64}`,
        usedPrompt: fullPrompt,
    });
}

export async function GET() {
    const apiKey = process.env.GOOGLE_API_KEY;
    const apiUrl = process.env.GOOGLE_IMAGE_API_URL;
    return Response.json({
        ok: true,
        route: "thumbnail",
        envConfigured: Boolean(apiKey && apiUrl),
    });
}
