"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { type ProgressData } from "@/lib/schemas/validation-simple";

interface ProgressFormProps {
  initialData?: ProgressData;
  onSubmit: (data: ProgressData) => void | Promise<void>;
  isLoading?: boolean;
  studentId?: string;
  studentName?: string;
}

export function ProgressForm({
  initialData,
  onSubmit,
  isLoading = false,
  studentId,
  studentName,
}: ProgressFormProps) {
  const [formData, setFormData] = React.useState<ProgressData>(
    initialData || {
      studentId: studentId || "",
      studentName: studentName || "",
      date: new Date(),
      subject: "",
      topicsLearned: "",
      performanceLevel: "good",
      notes: "",
      attachments: [],
    }
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentName && !formData.studentId) {
      newErrors.studentName = "Student is required";
    }
    if (!formData.subject) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.topicsLearned) {
      newErrors.topicsLearned = "Topics learned is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "date" ? new Date(value) : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Student Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date.toISOString().split("T")[0]}
                onChange={handleChange}
                aria-invalid={errors.date ? "true" : "false"}
                aria-describedby={errors.date ? "date-error" : undefined}
              />
              {errors.date && (
                <p id="date-error" className="text-xs text-red-500">
                  {errors.date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                name="subject"
                placeholder="e.g., Mathematics"
                value={formData.subject}
                onChange={handleChange}
                aria-invalid={errors.subject ? "true" : "false"}
                aria-describedby={errors.subject ? "subject-error" : undefined}
              />
              {errors.subject && (
                <p id="subject-error" className="text-xs text-red-500">
                  {errors.subject}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="performanceLevel" className="text-sm font-medium">
                Performance Level <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="performanceLevel"
                  name="performanceLevel"
                  value={formData.performanceLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-invalid={errors.performanceLevel ? "true" : "false"}
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="below-average">Below Average</option>
                  <option value="needs-improvement">Needs Improvement</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topicsLearned" className="text-sm font-medium">
              Topics Learned <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="topicsLearned"
              name="topicsLearned"
              placeholder="Describe the topics covered..."
              value={formData.topicsLearned}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-24 resize-none"
              aria-invalid={errors.topicsLearned ? "true" : "false"}
              aria-describedby={
                errors.topicsLearned ? "topicsLearned-error" : undefined
              }
            />
            {errors.topicsLearned && (
              <p id="topicsLearned-error" className="text-xs text-red-500">
                {errors.topicsLearned}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes & Observations
            </Label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Additional observations or notes..."
              value={formData.notes || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-20 resize-none"
              aria-describedby={errors.notes ? "notes-error" : undefined}
            />
            {errors.notes && (
              <p id="notes-error" className="text-xs text-red-500">
                {errors.notes}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                studentId: studentId || "",
                studentName: studentName || "",
                date: new Date(),
                subject: "",
                topicsLearned: "",
                performanceLevel: "good",
                notes: "",
              })}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
