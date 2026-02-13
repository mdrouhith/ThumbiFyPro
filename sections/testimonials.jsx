import SectionTitle from "@/components/section-title";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Testimonials() {

    const ref = useRef([]);
    const data = [
        {
            review: 'We ship 10x faster now. The thumbnails look like a pro design team made them.',
            name: 'Rafid Hasan',
            about: 'YouTube Creator',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
        },
        {
            review: 'The AI layout + headline balance is insane. CTR went up in two weeks.',
            name: 'Sadia Karim',
            about: 'Growth Marketer',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
        },
        {
            review: 'We maintain brand consistency across every client channel with one studio.',
            name: 'Nafis Rahman',
            about: 'Creative Director',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60',
        },
        {
            review: 'The export quality is crisp even at 4K. It looks like a paid design tool.',
            name: 'Ishrat Jahan',
            about: 'Video Editor',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60',
        },
        {
            review: "Best thumbnail generator we've used—fast, clean, and super reliable.",
            name: 'Tanvir Ahmed',
            about: 'Agency Owner',
            rating: 5,
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop',
        },
        {
            review: 'Perfect balance of automation and control. Our team loves it.',
            name: 'Ayesha Noor',
            about: 'Content Lead',
            rating: 5,
            image: 'https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/userImage/userImage1.png',
        },
    ];
    return (
        <section className="mt-32 flex flex-col items-center" id="reviews">
            <SectionTitle
                title="Loved by creators and marketing teams"
                description="Real results from people who publish every day."
            />
            <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {data.map((item, index) => (
                    <motion.div key={index} className='w-full max-w-88 space-y-5 rounded-lg glass p-5 hover:-translate-y-1'
                        initial={{ y: 150, opacity: 0 }}
                        ref={(el) => (ref.current[index] = el)}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: `${index * 0.15}`, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                        onAnimationComplete={() => {
                            const card = ref.current[index];
                            if (card) {
                                card.classList.add("transition", "duration-300");
                            }
                        }}
                    >
                        <div className='flex items-center justify-between'>
                            <p className="font-medium">{item.about}</p>
                            <img className='size-10 rounded-full' src={item.image} alt={item.name} />
                        </div>
                        <p className='line-clamp-3'>“{item.review}”</p>
                        <p className='text-gray-300'>
                            - {item.name}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
