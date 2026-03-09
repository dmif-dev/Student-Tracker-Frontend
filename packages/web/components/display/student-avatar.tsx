"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface StudentAvatarProps {
  name: string;
  email?: string;
  size?: "sm" | "md" | "lg";
  image?: string;
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

const textSizeMap = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function StudentAvatar({
  name,
  email,
  size = "md",
  image,
  className,
}: StudentAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-2">
      <Avatar className={cn(sizeMap[size], className)}>
        {image && <AvatarImage src={image} alt={name} />}
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      {size !== "sm" && (
        <div className="hidden sm:block">
          <p className="font-medium leading-none">{name}</p>
          {email && (
            <p className={cn("text-muted-foreground", textSizeMap[size])}>
              {email}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
