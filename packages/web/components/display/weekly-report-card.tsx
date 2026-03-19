"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";

interface WeeklyReportCardProps {
  title: string;
  reportType: "weekly" | "monthly" | "custom";
  startDate: Date;
  endDate: Date;
  studentCount: number;
  generatedDate: Date;
  description?: string;
}

const reportTypeLabels = {
  weekly: "Weekly Report",
  monthly: "Monthly Report",
  custom: "Custom Report",
};

const reportTypeColors = {
  weekly: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  monthly: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  custom: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
};

export function WeeklyReportCard({
  title,
  reportType,
  startDate,
  endDate,
  studentCount,
  generatedDate,
  description,
}: WeeklyReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription className="mt-2">{description}</CardDescription>
            )}
          </div>
          <Badge className={reportTypeColors[reportType]}>
            {reportTypeLabels[reportType]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Period</p>
              <p className="font-medium">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Students</p>
              <p className="font-medium">{studentCount} students</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Generated {generatedDate.toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
