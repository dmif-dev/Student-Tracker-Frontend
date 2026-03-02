import { z } from 'zod';

export const DailyProgressSchema = z.object({
    studentId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    topicsCovered: z.array(z.string()).min(1, 'At least one topic must be listed'),
    notes: z.string().optional(),
    attendanceStatus: z.enum(['present', 'absent', 'late']),
    performanceRating: z.number().min(1).max(10).optional(),
});

export type DailyProgressInput = z.infer<typeof DailyProgressSchema>;
