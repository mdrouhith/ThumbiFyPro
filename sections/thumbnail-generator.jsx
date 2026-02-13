import { motion } from "framer-motion";
import SectionTitle from "@/components/section-title";
import { useMemo, useState } from "react";
import { CheckIcon, ZapIcon, DownloadIcon, Wand2Icon } from "lucide-react";

const ratios = [
    { value: "16:9", label: "YouTube 16:9", className: "aspect-video" },
    { value: "1:1", label: "Square 1:1", className: "aspect-square" },
    { value: "4:5", label: "Portrait 4:5", className: "aspect-[4/5]" },
    { value: "9:16", label: "Shorts 9:16", className: "aspect-[9/16]" },
];

const styles = ["Cinematic", "Minimal", "Vibrant", "Neon", "Editorial", "3D"];
const moods = ["Bold", "Clean", "Playful", "Luxury", "Techy", "Energetic"];
const resolutions = [
    { label: "HD (720p)", scale: 1 },
    { label: "Full HD (1080p)", scale: 1.5 },
    { label: "4K (UHD)", scale: 3 },
];

export default function ThumbnailGenerator() {
    const [prompt, setPrompt] = useState("");
    const [title, setTitle] = useState("How to Grow on YouTube");
    const [subtitle, setSubtitle] = useState("Pro tips that actually work");
    const [ratio, setRatio] = useState("16:9");
    const [style, setStyle] = useState("Cinematic");
    const [mood, setMood] = useState("Bold");
    const [brandColor, setBrandColor] = useState("#6D28D9");
    const [accentColor, setAccentColor] = useState("#22D3EE");
    const [logoUrl, setLogoUrl] = useState("");
    const [provider, setProvider] = useState("google");
    const [inspirationImage, setInspirationImage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUpscaling, setIsUpscaling] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [resolution, setResolution] = useState("HD (720p)");

    const ratioClass = useMemo(() => ratios.find((item) => item.value === ratio)?.className || "aspect-video", [ratio]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result?.toString() || "";
            setInspirationImage(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleDownload = async () => {
        if (!result?.imageUrl) return;
        try {
            const link = document.createElement("a");
            link.href = result.imageUrl;
            link.download = `thumbnail-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    const handleUpscale = async () => {
        if (!result?.imageUrl || provider !== "openrouter") {
             if(provider !== "openrouter") alert("Upscaling requires OpenRouter (Sourceful) provider.");
             return;
        }
        setIsUpscaling(true);
        
        try {
            const response = await fetch("/api/thumbnail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: "High quality version of this image",
                    provider,
                    ratio,
                    inspirationImage: result.imageUrl,
                    enhance: true,
                    imageSize: "4K"
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                 alert(data?.error || "Upscale failed");
            } else if (data?.imageUrl) {
                 setResult({ ...result, imageUrl: data.imageUrl });
                 setResolution("4K (UHD)");
            }
        } catch (e) {
            console.error(e);
            alert("Upscale request failed");
        } finally {
            setIsUpscaling(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a clear prompt for the thumbnail.");
            return;
        }
        if (provider === "openrouter" && inspirationImage && inspirationImage.startsWith("data:")) {
            const approxBytes = Math.ceil((inspirationImage.length * 3) / 4);
            if (approxBytes > 4_500_000) {
                setError("Image too large for OpenRouter (limit ~4.5MB). Use a hosted image URL instead of uploading.");
                return;
            }
        }

        setIsLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch("/api/thumbnail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    provider,
                    title,
                    subtitle,
                    ratio,
                    style,
                    mood,
                    brandColor,
                    accentColor,
                    logoUrl,
                    inspirationImage,
                    imageSize: resolution === "4K (UHD)" ? "4K" : "1K"
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data?.error || "Failed to generate thumbnail.");
                setIsLoading(false);
                return;
            }

            setResult(data);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="mt-32" id="studio">
            <SectionTitle
                title="AI Thumbnail Studio"
                description="Build stunning thumbnails with layout controls, brand colors, and instant exports."
            />

            <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr]">
                <motion.div
                    className="glass rounded-2xl p-6 md:p-8 space-y-6"
                    initial={{ y: 80, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 70, mass: 1 }}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.2em] text-gray-200">Thumbnail Studio</p>
                            <h3 className="mt-2 text-2xl font-semibold">Professional creative controls</h3>
                        </div>
                        <div className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs glass">
                            <ZapIcon className="size-4" />
                            {provider === "openrouter" ? "OpenRouter Ready" : "Google AI Ready"}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <label className="space-y-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Prompt</span>
                            <textarea
                                value={prompt}
                                onChange={(event) => setPrompt(event.target.value)}
                                placeholder="Explain the idea, subject, and vibe. Example: Futuristic creator studio with neon lighting, bold typography, and a confident host."
                                className="w-full min-h-28 rounded-xl glass px-4 py-3 text-sm text-white outline-none placeholder:text-gray-300"
                            />
                        </label>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Provider</span>
                                <select
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                    className="w-full rounded-xl glass px-4 py-3 text-sm text-white outline-none"
                                >
                                    <option value="google" className="text-black">Google Imagen</option>
                                    <option value="openrouter" className="text-black">OpenRouter (Sourceful/Gemini)</option>
                                </select>
                            </label>
                            <label className="space-y-2 md:col-span-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Inspiration Image (optional)</span>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full rounded-xl glass px-4 py-2 text-sm text-white outline-none"
                                    />
                                </div>
                                {inspirationImage && (
                                    <p className="mt-1 text-xs text-gray-300">Image attached</p>
                                )}
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Resolution</span>
                                <select
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    className="w-full rounded-xl glass px-4 py-3 text-sm text-white outline-none"
                                >
                                    {resolutions.map((res) => (
                                        <option key={res.label} value={res.label} className="text-black">
                                            {res.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Headline</span>
                                <input
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    className="w-full rounded-xl glass px-4 py-3 text-sm text-white outline-none"
                                />
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Subtitle</span>
                                <input
                                    value={subtitle}
                                    onChange={(event) => setSubtitle(event.target.value)}
                                    className="w-full rounded-xl glass px-4 py-3 text-sm text-white outline-none"
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Ratio</span>
                                <select
                                    value={ratio}
                                    onChange={(event) => setRatio(event.target.value)}
                                    className="w-full rounded-xl glass px-4 py-3 text-sm text-white outline-none"
                                >
                                    {ratios.map((item) => (
                                        <option key={item.value} value={item.value} className="text-black">
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Style</span>
                                <select
                                    value={style}
                                    onChange={(event) => setStyle(event.target.value)}
                                    className="w-full rounded-xl glass px-4 py-3 text-sm text-white outline-none"
                                >
                                    {styles.map((item) => (
                                        <option key={item} value={item} className="text-black">
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Mood</span>
                                <select
                                    value={mood}
                                    onChange={(event) => setMood(event.target.value)}
                                    className="w-full rounded-xl glass px-4 py-3 text-sm text-white outline-none"
                                >
                                    {moods.map((item) => (
                                        <option key={item} value={item} className="text-black">
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Brand Color</span>
                                <div className="flex items-center gap-3 rounded-xl glass px-4 py-2.5">
                                    <input
                                        type="color"
                                        value={brandColor}
                                        onChange={(event) => setBrandColor(event.target.value)}
                                        className="h-8 w-10 rounded-md border-0 bg-transparent"
                                    />
                                    <input
                                        value={brandColor}
                                        onChange={(event) => setBrandColor(event.target.value)}
                                        className="w-full bg-transparent text-sm text-white outline-none"
                                    />
                                </div>
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Accent Color</span>
                                <div className="flex items-center gap-3 rounded-xl glass px-4 py-2.5">
                                    <input
                                        type="color"
                                        value={accentColor}
                                        onChange={(event) => setAccentColor(event.target.value)}
                                        className="h-8 w-10 rounded-md border-0 bg-transparent"
                                    />
                                    <input
                                        value={accentColor}
                                        onChange={(event) => setAccentColor(event.target.value)}
                                        className="w-full bg-transparent text-sm text-white outline-none"
                                    />
                                </div>
                            </label>
                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.2em] text-gray-200">Logo URL</span>
                                <input
                                    value={logoUrl}
                                    onChange={(event) => setLogoUrl(event.target.value)}
                                    placeholder="https://brand.com/logo.png"
                                    className="w-full rounded-xl glass px-4 py-3 text-sm text-white outline-none"
                                />
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                            {typeof error === "string" ? error : JSON.stringify(error)}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap gap-2 text-xs text-gray-100">
                            {["Auto layout", "Smart typography", "High contrast", "Brand-safe palette"].map((item) => (
                                <span key={item} className="flex items-center gap-2 rounded-full glass px-3 py-1.5">
                                    <CheckIcon className="size-3.5" />
                                    {item}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="btn glass flex items-center justify-center gap-2 py-3 disabled:opacity-60"
                        >
                            <ZapIcon className="size-4" />
                            {isLoading ? "Generating..." : "Generate Thumbnail"}
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    className="glass rounded-2xl p-6 md:p-8 flex flex-col gap-6"
                    initial={{ y: 80, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 240, damping: 70, mass: 1, delay: 0.1 }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-gray-200">Preview</p>
                            <h4 className="mt-2 text-xl font-semibold">Live thumbnail mockup</h4>
                        </div>
                        <div className="flex gap-2">
                            {result?.imageUrl && (
                                <>
                                    <button
                                        onClick={handleUpscale}
                                        disabled={isUpscaling}
                                        className="flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs hover:bg-white/20 transition disabled:opacity-50"
                                        title="Enhance image quality"
                                    >
                                        <Wand2Icon className="size-3.5" />
                                        {isUpscaling ? "Enhancing..." : "Enhance"}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs hover:bg-white/20 transition"
                                    >
                                        <DownloadIcon className="size-3.5" />
                                        Download
                                    </button>
                                </>
                            )}
                            {!result?.imageUrl && <div className="rounded-full glass px-4 py-1.5 text-xs">HD Export</div>}
                        </div>
                    </div>

                    <div
                        className={`relative w-full overflow-hidden rounded-2xl border border-white/10 ${ratioClass}`}
                        style={{
                            backgroundImage: `linear-gradient(135deg, ${brandColor}55, ${accentColor}55)`,
                        }}
                    >
                        {result?.imageUrl ? (
                            <img src={result.imageUrl} alt="Generated thumbnail" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-gray-200">
                                {isLoading ? "Crafting your thumbnail..." : "Your generated thumbnail will appear here"}
                            </div>
                        )}

                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                            <div className="space-y-2 max-w-xs">
                                <h3 className="text-2xl font-semibold leading-tight">{title || "Your Title Goes Here"}</h3>
                                <p className="text-sm text-gray-100">{subtitle || "Short supporting subtitle"}</p>
                            </div>
                        </div>
                        {logoUrl && (
                            <div className="absolute right-4 top-4 rounded-full bg-white/90 p-2">
                                <img src={logoUrl} alt="Brand logo" className="h-7 w-7 rounded-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 text-sm text-gray-100">
                        <div className="flex items-center justify-between">
                            <span>Output</span>
                            <span className="font-medium text-white">{resolution}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Ratio</span>
                            <span className="font-medium text-white">{ratio}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Style</span>
                            <span className="font-medium text-white">{style}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
