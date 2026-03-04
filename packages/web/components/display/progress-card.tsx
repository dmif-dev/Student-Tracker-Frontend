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
import { StudentAvatar } from "./student-avatar";

interface ProgressCardProps {
  studentName: string;
  studentEmail?: string;
  date: Date;
  subject: string;
  performanceLevel: "excellent" | "good" | "average" | "below-average" | "needs-improvement";
  topicsLearned: string[];
  notes?: string;
}

const performanceLevelColors = {
  excellent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  average: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  "below-average":
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  "needs-improvement":
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
};

export function ProgressCard({
  studentName,
  studentEmail,
  date,
  subject,
  performanceLevel,
  topicsLearned,
  notes,
}: ProgressCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <StudentAvatar name={studentName} email={studentEmail} size="md" />
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                {subject} • {date.toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={performanceLevelColors[performanceLevel]}>
            {performanceLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2">Topics Learned</h4>
          <div className="flex flex-wrap gap-2">
            {topicsLearned.map((topic) => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
        {notes && (
          <div>
            <h4 className="text-sm font-semibold mb-1">Notes</h4>
            <p className="text-sm text-muted-foreground">{notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
