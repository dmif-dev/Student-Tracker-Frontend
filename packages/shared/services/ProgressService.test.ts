import { ProgressService } from './ProgressService';
import { DailyProgress } from '../models/DailyProgress';

describe('ProgressService', () => {
    const mockProgress: DailyProgress = {
        id: 'progress-1',
        studentId: 'student-1',
        date: '2024-02-12',
        topicsCovered: ['Math'],
        attendanceStatus: 'present',
    };

    it('should add progress', async () => {
        await ProgressService.addProgress(mockProgress);
        const progressList = await ProgressService.getProgressByStudent('student-1');
        expect(progressList).toHaveLength(1);
        expect(progressList[0]).toEqual(mockProgress);
    });

    it('should calculate average performance', () => {
        const progress1: DailyProgress = {
            id: '1',
            studentId: '1',
            date: '2024-02-12',
            topicsCovered: ['Math'],
            attendanceStatus: 'present',
            performanceRating: 8,
        };
        const progress2: DailyProgress = {
            id: '2',
            date: '2024-02-13',
            studentId: '1',
            topicsCovered: ['Science'],
            attendanceStatus: 'present',
            performanceRating: 10,
        };
        const avg = ProgressService.calculateAveragePerformance([progress1, progress2]);
        expect(avg).toBe(9);
    });

    it('should return 0 average for empty list', () => {
        const avg = ProgressService.calculateAveragePerformance([]);
        expect(avg).toBe(0);
    });
});
