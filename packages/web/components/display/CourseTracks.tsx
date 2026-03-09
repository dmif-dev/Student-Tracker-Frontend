import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";

interface TrackCardProps {
    title: string;
    description: string;
    color: "purple" | "orange" | "cyan" | "yellow" | "green";
    index: number;
}

const TrackCard: React.FC<TrackCardProps> = ({ title, description, color, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const params = useParams();

    const accentMap = {
        purple: "rgba(167, 139, 250, 0.4)",
        orange: "rgba(251, 146, 60, 0.4)",
        cyan: "rgba(34, 211, 238, 0.4)",
        yellow: "rgba(250, 204, 21, 0.4)",
        green: "rgba(52, 211, 153, 0.4)"
    };

    const gradientMap = {
        purple: "from-violet-400 to-fuchsia-400",
        orange: "from-orange-400 to-rose-400",
        cyan: "from-cyan-400 to-blue-400",
        yellow: "from-amber-300 to-orange-400",
        green: "from-emerald-300 to-cyan-400"
    };

    const accentColor = accentMap[color];
    const gradient = gradientMap[color];

    return (
        <Link href={`/Student/my-courses/${params.courseId}/resources?track=${encodeURIComponent(title)}`}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative h-full cursor-pointer group"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <motion.div
                    className="absolute -inset-0.5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    animate={{
                        boxShadow: isHovered ? `0 15px 40px -5px ${accentColor}` : "0 0 0px 0px transparent",
                    }}
                    style={{
                        background: `linear-gradient(135deg, ${accentColor}, transparent 80%)`,
                    }}
                />

                <div
                    className="relative h-full rounded-[2rem] bg-white/90 backdrop-blur-xl border border-orange-100/50 p-8 flex flex-col overflow-hidden transition-all duration-500 group-hover:bg-white"
                    style={{
                        transformStyle: 'preserve-3d',
                        boxShadow: '0 10px 30px -10px rgba(251, 146, 60, 0.1)',
                    }}
                >
                    <div
                        className={cn(
                            "absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40 bg-gradient-to-r",
                            gradient
                        )}
                        style={{
                            transform: 'translateZ(20px)',
                        }}
                    />

                    <div className="relative z-10 space-y-6 flex-grow flex flex-col">
                        <motion.div style={{ transform: 'translateZ(30px)' }}>
                            <span className={cn(
                                "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-orange-100 bg-orange-50/50 text-orange-600"
                            )}>
                                TRACK
                            </span>
                        </motion.div>

                        <div style={{ transform: 'translateZ(40px)' }} className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
                                {title}
                            </h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed group-hover:text-gray-600 transition-colors">
                                {description}
                            </p>
                        </div>

                        <div style={{ transform: 'translateZ(50px)' }} className="mt-auto pt-6">
                            <div className="w-full py-3 rounded-full border border-orange-200 bg-white text-[10px] font-black uppercase tracking-widest text-orange-600 text-center transition-all group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 shadow-sm shadow-orange-100/50">
                                VIEW DETAILS
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export const CourseTracks: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 60;
            const y = (e.clientY - rect.top - rect.height / 2) / 60;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const tracks: { title: string; description: string; color: "purple" | "orange" | "cyan" | "yellow" | "green" }[] = [
        {
            title: "AI Product Development",
            description: "Learn how to build AI-powered products using real-world use cases.",
            color: "purple"
        },
        {
            title: "Full Stack Development",
            description: "Understand end-to-end application development from frontend to backend.",
            color: "orange"
        },
        {
            title: "Cloud-Native Development",
            description: "Learn how to develop, deploy, scale, and manage applications on the Cloud.",
            color: "cyan"
        },
        {
            title: "Agentic AI Development",
            description: "Explore how intelligent agents work and how to build autonomous AI systems.",
            color: "yellow"
        },
        {
            title: "DMIF Custom Coding Track",
            description: "A customized, project-first coding track aligned to all type of Industry needs.",
            color: "green"
        }
    ];

    return (
        <div
            ref={containerRef}
            className="py-24 space-y-16 relative overflow-visible rounded-[3rem] px-8"
            style={{ perspective: '2000px' }}
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-orange-200/40 blur-[1px]"
                        style={{
                            width: `${Math.random() * 4 + 1}px`,
                            height: `${Math.random() * 4 + 1}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `pulse ${Math.random() * 5 + 5}s infinite alternate`
                        }}
                    />
                ))}
            </div>

            <div className="text-center space-y-4 relative z-20">
                <div className="inline-flex items-center gap-2">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.5em]">LEARNING PATHS</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">
                    Choose Your Track
                </h2>
                <p className="text-gray-500 font-medium tracking-tight text-lg max-w-2xl mx-auto leading-relaxed">
                    Specialized learning paths designed to take you from beginner to industry-ready across different areas of modern development.
                </p>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
                animate={{
                    rotateX: -mousePosition.y,
                    rotateY: mousePosition.x
                }}
                transition={{ type: "spring", stiffness: 40, damping: 25, mass: 0.5 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {tracks.map((track, index) => (
                    <TrackCard
                        key={track.title}
                        title={track.title}
                        description={track.description}
                        color={track.color}
                        index={index}
                    />
                ))}
            </motion.div>
        </div>
    );
};
