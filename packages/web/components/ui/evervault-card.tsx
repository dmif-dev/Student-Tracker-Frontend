"use client";
import { useMotionValue } from "framer-motion";
import React from "react";
import { useMotionTemplate, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const EvervaultCard = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    let mouseX = useMotionValue(0);
    let mouseY = useMotionValue(0);

    function onMouseMove({ currentTarget, clientX, clientY }: any) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={cn(
                "p-0.5 bg-transparent flex items-center justify-center w-full h-full relative",
                className
            )}
        >
            <div
                onMouseMove={onMouseMove}
                className="group/card rounded-3xl w-full relative overflow-hidden bg-transparent flex items-start justify-start h-full min-h-[14rem]"
            >
                <CardPattern
                    mouseX={mouseX}
                    mouseY={mouseY}
                />
                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            </div>
        </div>
    );
};

export function CardPattern({ mouseX, mouseY }: any) {
    let maskImage = useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`;
    let style = { maskImage, WebkitMaskImage: maskImage };

    return (
        <div className="pointer-events-none">
            <div className="absolute inset-0 rounded-2xl [mask-image:linear-gradient(white,transparent)] group-hover/card:opacity-50 transition duration-500"></div>
            <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 opacity-0 group-hover/card:opacity-100 backdrop-blur-xl transition duration-500"
                style={style}
            />
        </div>
    );
}
