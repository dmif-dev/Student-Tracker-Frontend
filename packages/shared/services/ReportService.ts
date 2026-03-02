import { DailyProgress } from '../models/DailyProgress';
import { WeeklyReport } from '../models/WeeklyReport';
import { generateWeeklySummary } from '../utils/reportUtils';

export class ReportService {
    static async generateReport(studentId: string, weekProgress: DailyProgress[]): Promise<Partial<WeeklyReport>> {
        const summaryData = generateWeeklySummary(weekProgress);

        return {
            studentId,
            ...summaryData,
            generatedAt: new Date(),
        };
    }
}
