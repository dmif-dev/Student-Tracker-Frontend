"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { type StudentData } from "@/lib/schemas/validation-simple";

interface StudentFormProps {
  initialData?: StudentData;
  onSubmit: (data: StudentData) => void | Promise<void>;
  isLoading?: boolean;
}

export function StudentForm({
  initialData,
  onSubmit,
  isLoading = false,
}: StudentFormProps) {
  const [formData, setFormData] = React.useState<StudentData>(
    initialData || {
      name: "",
      email: "",
      grade: "",
      status: "active",
      enrollmentDate: new Date(),
      notes: "",
    }
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.grade) {
      newErrors.grade = "Grade is required";
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
      [name]: name === "enrollmentDate" ? new Date(value) : value,
    }));
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
        <CardTitle>
          {initialData ? "Edit Student" : "Add New Student"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-xs text-red-500">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="text-sm font-medium">
                Grade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="grade"
                name="grade"
                placeholder="Grade 5"
                value={formData.grade}
                onChange={handleChange}
                aria-invalid={errors.grade ? "true" : "false"}
                aria-describedby={errors.grade ? "grade-error" : undefined}
              />
              {errors.grade && (
                <p id="grade-error" className="text-xs text-red-500">
                  {errors.grade}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-invalid={errors.status ? "true" : "false"}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollmentDate" className="text-sm font-medium">
                Enrollment Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="enrollmentDate"
                name="enrollmentDate"
                type="date"
                value={formData.enrollmentDate.toISOString().split("T")[0]}
                onChange={handleChange}
                aria-invalid={errors.enrollmentDate ? "true" : "false"}
                aria-describedby={
                  errors.enrollmentDate ? "enrollmentDate-error" : undefined
                }
              />
              {errors.enrollmentDate && (
                <p id="enrollmentDate-error" className="text-xs text-red-500">
                  {errors.enrollmentDate}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Additional notes about the student..."
              value={formData.notes || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-24 resize-none"
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
                name: "",
                email: "",
                grade: "",
                status: "active",
                enrollmentDate: new Date(),
                notes: "",
              })}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Student"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
