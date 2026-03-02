import { ReportService } from './ReportService';
import { DailyProgress } from '../models/DailyProgress';
import { WeeklyReport } from '../models/WeeklyReport';

describe('ReportService', () => {
    describe('generateReport', () => {
        const studentId = 'student-test-1';
        const progressList: DailyProgress[] = [
            { id: '1', studentId, date: '2024-02-12', topicsCovered: ['Math'], attendanceStatus: 'present', performanceRating: 8 },
            { id: '2', studentId, date: '2024-02-13', topicsCovered: ['Science'], attendanceStatus: 'absent', performanceRating: 0 },
        ];

        it('should generate report with metadata', async () => {
            const report = await ReportService.generateReport(studentId, progressList);
            expect(report.studentId).toBe(studentId);
            expect(report.generatedAt).toBeDefined();
            expect(report.generatedAt).toBeInstanceOf(Date);

            // Cast to verify properties if they exist
            // Or use optional chaining. Partial<WeeklyReport> means properties can be undefined.
            expect(report.summary).toBeDefined();
            expect(report.summary).toContain('Attended 1 of 2 days');
            expect(report.summary).toContain('Topics covered: Math, Science');
        });
    });
});
