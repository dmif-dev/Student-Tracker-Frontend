import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MessageSquare, Users, Zap } from "lucide-react";

interface MentorshipCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
}

const MentorshipCard: React.FC<MentorshipCardProps> = ({ title, description, icon, index }) => {
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
            className="group relative p-8 rounded-[2.5rem] bg-white border border-orange-100/50 shadow-sm hover:shadow-2xl hover:shadow-orange-200/20 transition-all duration-500 overflow-hidden h-full flex flex-col"
        >
            <Background />

            <div className="relative z-10 flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-sm">
                        {icon}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-orange-50/50 text-[10px] font-black text-orange-400 uppercase tracking-widest border border-orange-100/50">
                        MENTORSHIP
                    </span>
                </div>

                <div className="space-y-3 pt-4">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-orange-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed group-hover:text-gray-700 transition-colors">
                        {description}
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

export const MentorshipModel: React.FC = () => {
    const models = [
        {
            title: "Weekly Interaction",
            description: "1-hour structured session with hands-on product/technology mentor to review progress and set goals.",
            icon: <Users className="w-6 h-6" />
        },
        {
            title: "Continuous Support",
            description: "Dedicated online channel for ongoing interaction and clarification. Never stay stuck for long.",
            icon: <MessageSquare className="w-6 h-6" />
        },
        {
            title: "Industry Experience",
            description: "Mentors with deep hands-on product development experience from world-class companies.",
            icon: <Zap className="w-6 h-6" />
        }
    ];

    return (
        <div className="py-20 space-y-12">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">PROGRAM STRUCTURE</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">
                    Mentorship Model
                </h2>
                <p className="text-gray-500 font-medium tracking-tight text-lg max-w-2xl leading-relaxed">
                    Designed for maximum impact through direct industry exposure and consistent feedback loops.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {models.map((model, index) => (
                    <MentorshipCard
                        key={model.title}
                        title={model.title}
                        description={model.description}
                        icon={model.icon}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
};
