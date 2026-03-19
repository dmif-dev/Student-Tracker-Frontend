"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ComponentType<{ className?: string }>;
  bgColor?: string;
  iconColor?: string;
  trend?: "up" | "down";
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  bgColor = "bg-blue-500/10",
  iconColor = "text-blue-500",
  trend,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon && (
          <div className={`${bgColor} p-2 rounded-lg`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-xs font-medium ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {Math.abs(change)}% {trend === "up" ? "increase" : "decrease"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
