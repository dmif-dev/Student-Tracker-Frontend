"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default:
                    "bg-white/10 backdrop-blur-md border border-white/20 text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-white/20 hover:border-white/30 hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]",
                destructive:
                    "bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-600 hover:bg-red-500/20",
                outline:
                    "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-orange-500/10 backdrop-blur-md border border-orange-500/20 text-orange-600 hover:bg-orange-500/20",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-12 px-6 py-2",
                sm: "h-9 rounded-xl px-3 text-xs",
                lg: "h-14 rounded-2xl px-10 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface LiquidButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
LiquidButton.displayName = "LiquidButton";

export { LiquidButton, buttonVariants };
