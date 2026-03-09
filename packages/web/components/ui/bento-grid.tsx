"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.1,
                    },
                },
            }}
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
                className
            )}
        >
            {children}
        </motion.div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.5,
                    },
                },
            }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={cn(
                "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4 relative overflow-hidden",
                className
            )}
        >
            {/* Shine effect on hover */}
            <div
                className="
            absolute top-0 left-[-150%] h-full w-[50%]
            bg-[linear-gradient(to_right,transparent_0%,#ffffff33_50%,transparent_100%)]
            skew-x-[-25deg]
            transition-all duration-700 ease-in-out
            group-hover/bento:left-[125%]
            z-0
            pointer-events-none
            "
            />
            <div className="relative z-10 flex flex-col justify-between h-full">
                {header}
                <div className="group-hover/bento:translate-x-2 transition duration-200 mt-2">
                    {icon}
                    <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
                        {title}
                    </div>
                    <div className="font-sans font-normal text-neutral-600 dark:text-neutral-300 text-xs">
                        {description}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
