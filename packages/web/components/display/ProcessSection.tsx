import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProcessStepProps {
    number: number;
    title: string;
    description: string;
    outcomeSubtitle: string;
    index: number;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ number, title, description, outcomeSubtitle, index }) => {
    return (
        <motion.div
            whileHover="hover"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.8,
                ease: "backInOut",
                delay: index * 0.1
            }}
            variants={{
                hover: {
                    scale: 1.02,
                },
            }}
            className="group relative flex flex-col p-8 rounded-[2.5rem] bg-white border border-orange-100/50 shadow-sm hover:shadow-2xl hover:shadow-orange-200/20 transition-all duration-500 overflow-hidden"
        >
            <Background />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 font-bold text-xl border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-sm">
                            {number}
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-orange-600 transition-colors">
                            {title}
                        </h3>
                    </div>
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest pt-1 px-3 py-1 rounded-full bg-orange-50/50 border border-orange-100/50">
                        STEP {number}
                    </span>
                </div>

                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 flex-grow group-hover:text-gray-700 transition-colors">
                    {description}
                </p>

                <div className="pt-6 border-t border-orange-50/50 mt-auto">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-orange-400 transition-colors">
                        EXPECTED OUTCOME
                    </p>
                    <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-gray-800 transition-colors">
                        {outcomeSubtitle}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

const Background = () => {
    return (
        <motion.svg
            width="320"
            height="384"
            viewBox="0 0 320 384"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            variants={{
                hover: {
                    scale: 1.2,
                },
            }}
            transition={{
                duration: 1,
                ease: "backInOut",
            }}
        >
            <motion.circle
                variants={{
                    hover: {
                        scaleY: 0.6,
                        y: -30,
                    },
                }}
                transition={{
                    duration: 1,
                    ease: "backInOut",
                    delay: 0.1,
                }}
                cx="160.5"
                cy="114.5"
                r="101.5"
                fill="#fff7ed" // orange-50
            />
            <motion.ellipse
                variants={{
                    hover: {
                        scaleY: 2.5,
                        y: -40,
                    },
                }}
                transition={{
                    duration: 1,
                    ease: "backInOut",
                    delay: 0.1,
                }}
                cx="160.5"
                cy="265.5"
                rx="101.5"
                ry="43.5"
                fill="#fff7ed" // orange-50
            />
        </motion.svg>
    );
};

export const ProcessSection: React.FC = () => {
    const steps = [
        {
            number: 1,
            title: "Pick a project",
            description: "Your mentor assigns a scoped, real brief instead of a tutorial so you always know the user, the constraints, and what success looks like.",
            outcome: "Shared definition of done with clear acceptance tests."
        },
        {
            number: 2,
            title: "Build & struggle",
            description: "You write production-grade code, break things, and get targeted guidance only when you need it. Every blocker turns into a design conversation.",
            outcome: "Working feature slices that ship every sprint."
        },
        {
            number: 3,
            title: "Ship & iterate",
            description: "Deploy, demo, gather feedback, and refactor. Mentors review like product owners so you internalize trade-offs, not just fixes.",
            outcome: "A release note-worthy project with measurable impact."
        }
    ];

    return (
        <div className="py-20 space-y-12">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">PROCESS</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">
                    How it works
                </h2>
                <p className="text-gray-500 font-medium tracking-tight text-lg max-w-2xl leading-relaxed">
                    A tight three-step cadence keeps you shipping: scope with your mentor, build relentlessly, then iterate based on real feedback.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                    <ProcessStep
                        key={step.number}
                        number={step.number}
                        title={step.title}
                        description={step.description}
                        outcomeSubtitle={step.outcome}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
};
