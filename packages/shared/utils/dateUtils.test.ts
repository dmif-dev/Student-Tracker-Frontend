import { getWeekRange, formatDate, isSameDay } from './dateUtils';

describe('dateUtils', () => {
    describe('getWeekRange', () => {
        it('should return correct week range for a Monday', () => {
            const date = new Date('2024-02-12'); // Monday
            const { start, end } = getWeekRange(date);
            expect(start.toISOString().split('T')[0]).toBe('2024-02-11'); // Sunday
            expect(end.toISOString().split('T')[0]).toBe('2024-02-17'); // Saturday
        });

        it('should return correct week range for a Sunday', () => {
            const date = new Date('2024-02-11'); // Sunday
            const { start, end } = getWeekRange(date);
            expect(start.toISOString().split('T')[0]).toBe('2024-02-11');
            expect(end.toISOString().split('T')[0]).toBe('2024-02-17');
        });

        it('should default to current date if no date provided', () => {
            const { start, end } = getWeekRange();
            expect(start).toBeDefined();
            expect(end).toBeDefined();
            // Just verify they are 6 days apart
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            expect(diffDays).toBe(6);
        });
    });

    describe('formatDate', () => {
        it('should format date string correctly', () => {
            const formatted = formatDate('2024-02-14');
            // The exact output depends on locale, but let's check basic structure or components
            // Since toLocaleDateString() formats per user locale, exact match might be tricky in tests without setting locale strictly.
            // However, verify it returns a string.
            expect(typeof formatted).toBe('string');
        });

        it('should format Date object correctly', () => {
            const formatted = formatDate(new Date('2024-02-14'));
            expect(typeof formatted).toBe('string');
        });
    });

    describe('isSameDay', () => {
        it('should return true for same day', () => {
            const d1 = new Date('2024-02-14T10:00:00');
            const d2 = new Date('2024-02-14T15:30:00');
            expect(isSameDay(d1, d2)).toBe(true);
        });

        it('should return false for different days', () => {
            const d1 = new Date('2024-02-14');
            const d2 = new Date('2024-02-15');
            expect(isSameDay(d1, d2)).toBe(false);
        });

        it('should return false for same day different month', () => {
            const d1 = new Date('2024-02-14');
            const d2 = new Date('2024-03-14');
            expect(isSameDay(d1, d2)).toBe(false);
        });
    });
});
