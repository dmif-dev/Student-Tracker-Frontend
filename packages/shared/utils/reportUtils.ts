import { DailyProgress } from '../models/DailyProgress';
import { WeeklyReport } from '../models/WeeklyReport';

export const generateWeeklySummary = (
    progressList: DailyProgress[]
): Partial<WeeklyReport> => {
    const totalDays = progressList.length;
    const attendedDays = progressList.filter(
        (p) => p.attendanceStatus === 'present'
    ).length;

    const topics: string[] = [];
    progressList.forEach((p) => topics.push(...p.topicsCovered));

    const uniqueTopics = Array.from(new Set(topics));

    return {
        summary: `Attended ${attendedDays} of ${totalDays} days. Topics covered: ${uniqueTopics.join(', ')}.`,
        strengths: [],
        areasForImprovement: [],
    };
};
