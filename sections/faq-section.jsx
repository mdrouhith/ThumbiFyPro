import SectionTitle from '@/components/section-title';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { motion } from "framer-motion";

export default function FaqSection() {
    const [isOpen, setIsOpen] = useState(false);
    const data = [
        {
            question: 'Can I use my own brand colors and logo?',
            answer: "Yes. You can set brand and accent colors, and drop in your logo URL for consistent branding.",
        },
        {
            question: 'Which image models are supported?',
            answer: 'Google Imagen and OpenRouter image-capable models like Sourceful and Flux are supported.',
        },
        {
            question: 'Do you support different aspect ratios?',
            answer: 'Yes. Common ratios like 16:9, 9:16, 1:1, and 4:5 are built in.',
        },
        {
            question: 'How do HD / 4K downloads work?',
            answer: 'Choose a resolution in the studio before exporting. Higher resolution uses higher compute.',
        },
        {
            question: 'Is image enhancement available?',
            answer: 'Enhance uses OpenRouter image models (like Sourceful) to sharpen and upscale outputs.',
        },
        {
            question: 'Can my team use one workspace?',
            answer: 'Team workspaces and brand kits are available on the Studio plan.',
        },
    ];

    return (
        <section className='mt-32' id="faq">
            <SectionTitle title="Frequently asked questions" description="Everything you need to know before publishing your next thumbnail." />
            <div className='mx-auto mt-12 space-y-4 w-full max-w-xl'>
                {data.map((item, index) => (
                    <motion.div key={index} className='flex flex-col glass rounded-md'
                        initial={{ y: 150, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: `${index * 0.15}`, type: "spring", stiffness: 320, damping: 70, mass: 1 }}
                    >
                        <h3 className='flex cursor-pointer hover:bg-white/10 transition items-start justify-between gap-4 p-4 font-medium' onClick={() => setIsOpen(isOpen === index ? null : index)}>
                            {item.question}
                            <ChevronDownIcon className={`size-5 transition-all shrink-0 duration-400 ${isOpen === index ? 'rotate-180' : ''}`} />
                        </h3>
                        <p className={`px-4 text-sm/6 transition-all duration-400 overflow-hidden ${isOpen === index ? 'pt-2 pb-4 max-h-80' : 'max-h-0'}`}>{item.answer}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
