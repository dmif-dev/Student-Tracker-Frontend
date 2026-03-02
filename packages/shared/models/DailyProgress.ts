export interface DailyProgress {
    id: string;
    studentId: string;
    /** ISO Date string YYYY-MM-DD */
    date: string;
    notes?: string;
    topicsCovered: string[];
    attendanceStatus: 'present' | 'absent' | 'late';
    performanceRating?: number; // 1-10 scale
}
