import { z } from "zod";

/**
 * Validation schemas using Zod for form data
 * These schemas are used with React Hook Form for form validation
 */

// Student Schema
export const StudentDataSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  grade: z.string().min(1, "Grade is required"),
  status: z.enum(["active", "inactive"]),
  enrollmentDate: z.coerce.date(),
  notes: z.string().optional(),
});

export type StudentData = z.infer<typeof StudentDataSchema>;

// Progress Schema
export const ProgressDataSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, "Student is required"),
  studentName: z.string().min(1, "Student name is required"),
  date: z.coerce.date(),
  subject: z.string().min(1, "Subject is required"),
  topicsLearned: z.string().min(1, "Topics learned is required"),
  performanceLevel: z.enum([
    "excellent",
    "good",
    "average",
    "below-average",
    "needs-improvement",
  ]),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

export type ProgressData = z.infer<typeof ProgressDataSchema>;

// Report Schema
export const ReportDataSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  reportType: z.enum(["weekly", "monthly", "custom"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  generatedDate: z.coerce.date(),
  description: z.string().optional(),
}).refine((data: { endDate: Date; startDate: Date }) => data.endDate >= data.startDate, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

export type ReportData = z.infer<typeof ReportDataSchema>;

// User Settings Schema
export const UserSettingsDataSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  emailNotifications: z.boolean(),
  weeklySummary: z.boolean(),
  studentUpdates: z.boolean(),
});

export type UserSettingsData = z.infer<typeof UserSettingsDataSchema>;

// Type guards
export const isStudentData = (data: unknown): data is StudentData => {
  return StudentDataSchema.safeParse(data).success;
};

export const isProgressData = (data: unknown): data is ProgressData => {
  return ProgressDataSchema.safeParse(data).success;
};

export const isReportData = (data: unknown): data is ReportData => {
  return ReportDataSchema.safeParse(data).success;
};

export const isUserSettingsData = (data: unknown): data is UserSettingsData => {
  return UserSettingsDataSchema.safeParse(data).success;
};
