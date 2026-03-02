export interface WeeklyReport {
    id: string;
    studentId: string;
    /** YYYY-MM-DD */
    weekStart: string;
    /** YYYY-MM-DD */
    weekEnd: string;
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
    generatedAt: Date;
}
