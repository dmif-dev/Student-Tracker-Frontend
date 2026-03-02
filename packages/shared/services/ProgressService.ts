import { DailyProgress } from '../models/DailyProgress';

export class ProgressService {
    private static progress: DailyProgress[] = [];

    static async getProgressByStudent(studentId: string): Promise<DailyProgress[]> {
        return this.progress.filter(p => p.studentId === studentId);
    }

    static async addProgress(data: DailyProgress): Promise<void> {
        this.progress.push(data);
    }

    static calculateAveragePerformance(progressList: DailyProgress[]): number {
        if (progressList.length === 0) return 0;
        const sum = progressList.reduce((acc, p) => acc + (p.performanceRating || 0), 0);
        return sum / progressList.length;
    }
}
