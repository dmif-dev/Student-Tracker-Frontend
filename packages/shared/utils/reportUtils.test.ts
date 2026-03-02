import { generateWeeklySummary } from './reportUtils';
import { DailyProgress } from '../models/DailyProgress';

describe('reportUtils', () => {
    describe('generateWeeklySummary', () => {
        const mockProgressList: DailyProgress[] = [
            { id: '1', studentId: '1', date: '2024-02-12', topicsCovered: ['Math'], attendanceStatus: 'present' },
            { id: '2', studentId: '1', date: '2024-02-13', topicsCovered: ['Science'], attendanceStatus: 'absent' },
            { id: '3', studentId: '1', date: '2024-02-14', topicsCovered: ['History'], attendanceStatus: 'present' },
        ];

        it('should generate correct summary text', () => {
            const result = generateWeeklySummary(mockProgressList);
            expect(result.summary).toBeDefined();
            expect(result.summary).toContain('Attended 2 of 3 days');
            expect(result.summary).toContain('Topics covered: Math, Science, History');
        });

        it('should handle empty progress list', () => {
            const result = generateWeeklySummary([]);
            expect(result.summary).toContain('Attended 0 of 0 days');
        });
    });
});
