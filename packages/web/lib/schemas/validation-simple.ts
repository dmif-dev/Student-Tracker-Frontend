/**
 * Validation schemas for form data
 * TypeScript interfaces for type safety
 */

// Student Schema
export interface StudentData {
  id?: string;
  name: string;
  email: string;
  grade: string;
  status: "active" | "inactive";
  enrollmentDate: Date;
  notes?: string;
}

// Progress Schema
export interface ProgressData {
  id?: string;
  studentId: string;
  studentName: string;
  date: Date;
  subject: string;
  topicsLearned: string;
  performanceLevel: "excellent" | "good" | "average" | "below-average" | "needs-improvement";
  notes?: string;
  attachments?: string[];
}

// Report Schema
export interface ReportData {
  id?: string;
  title: string;
  reportType: "weekly" | "monthly" | "custom";
  startDate: Date;
  endDate: Date;
  generatedDate: Date;
  description?: string;
}

// User Settings Schema
export interface UserSettingsData {
  firstName: string;
  lastName: string;
  email: string;
  emailNotifications: boolean;
  weeklySummary: boolean;
  studentUpdates: boolean;
}

// Type guards
export const isStudentData = (data: unknown): data is StudentData => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    typeof obj.email === "string" &&
    typeof obj.grade === "string"
  );
};

export const isProgressData = (data: unknown): data is ProgressData => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.studentId === "string" &&
    typeof obj.subject === "string" &&
    ["excellent", "good", "average", "below-average", "needs-improvement"].includes(
      obj.performanceLevel as string
    )
  );
};

export const isReportData = (data: unknown): data is ReportData => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.title === "string" &&
    ["weekly", "monthly", "custom"].includes(obj.reportType as string)
  );
};

export const isUserSettingsData = (data: unknown): data is UserSettingsData => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.firstName === "string" &&
    typeof obj.email === "string"
  );
};
