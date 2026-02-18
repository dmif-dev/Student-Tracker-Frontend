import { WeekService } from './WeekService';

describe('WeekService', () => {
    describe('getCurrentWeek', () => {
        it('should return a valid week range', () => {
            const { start, end } = WeekService.getCurrentWeek();
            expect(start).toBeInstanceOf(Date);
            expect(end).toBeInstanceOf(Date);

            // Should be 6 days apart
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            expect(diffDays).toBe(6);

            // Start should be Sunday (day 0)
            expect(start.getDay()).toBe(0);
            // End should be Saturday (day 6)
            expect(end.getDay()).toBe(6);
        });
    });

    describe('getNextWeek', () => {
        it('should perform week calculation for next week', () => {
            const current = WeekService.getCurrentWeek();
            const next = WeekService.getNextWeek();
            // Next week start should be 7 days after current week start
            const diffTime = next.start.getTime() - current.start.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            expect(diffDays).toBe(7);
        });
    });

    describe('isDateInCurrentWeek', () => {
        it('should return true for today', () => {
            const result = WeekService.isDateInCurrentWeek(new Date());
            expect(result).toBe(true);
        });

        it('should return false for next week', () => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 8);
            const result = WeekService.isDateInCurrentWeek(nextWeek);
            expect(result).toBe(false);
        });
    });
});
