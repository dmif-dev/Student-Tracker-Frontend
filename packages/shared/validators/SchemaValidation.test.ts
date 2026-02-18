import { StudentSchema } from './StudentSchema';
import { DailyProgressSchema } from './DailyProgressSchema';

describe('Validation Schemas', () => {
    describe('StudentSchema', () => {
        it('should validate a valid student', () => {
            const validStudent = {
                name: 'John Doe',
                registrationNumber: 'REG12345',
                email: 'john@example.com',
                class: '10',
            };
            const result = StudentSchema.safeParse(validStudent);
            expect(result.success).toBe(true);
        });

        it('should require minimum name length', () => {
            const invalidStudent = {
                name: 'J', // too short
                registrationNumber: 'REG12345',
                email: 'john@example.com',
                class: '10',
            };
            const result = StudentSchema.safeParse(invalidStudent);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Name must be at least 2 characters');
            }
        });

        it('should validate registration number format', () => {
            const invalidStudent = {
                name: 'John Doe',
                registrationNumber: 'TooLongToShowHowItFailsValidationExample', // too long > 15
                email: 'john@example.com',
                class: '10',
            };
            const result = StudentSchema.safeParse(invalidStudent);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid registration number format');
            }
        });

        it('should validate email format', () => {
            const invalidStudent = {
                name: 'John Doe',
                registrationNumber: 'REG12345',
                email: 'not-an-email',
                class: '10',
            };
            const result = StudentSchema.safeParse(invalidStudent);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email address');
            }
        });
    });

    describe('DailyProgressSchema', () => {
        it('should validate valid progress', () => {
            const validProgress = {
                studentId: '123e4567-e89b-12d3-a456-426614174000', // valid uuid
                date: '2024-02-12',
                topicsCovered: ['Math'],
                attendanceStatus: 'present',
                performanceRating: 8,
            };
            const result = DailyProgressSchema.safeParse(validProgress);
            expect(result.success).toBe(true);
        });

        it('should fail invalid date format', () => {
            const invalidProgress = {
                studentId: '123e4567-e89b-12d3-a456-426614174000',
                date: '12-02-2024', // DD-MM-YYYY invalid per regex
                topicsCovered: ['Math'],
                attendanceStatus: 'present',
            };
            const result = DailyProgressSchema.safeParse(invalidProgress);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid date format (YYYY-MM-DD)');
            }
        });

        it('should require at least one topic', () => {
            const invalidProgress = {
                studentId: '123e4567-e89b-12d3-a456-426614174000',
                date: '2024-02-12',
                topicsCovered: [], // empty
                attendanceStatus: 'present',
            };
            const result = DailyProgressSchema.safeParse(invalidProgress);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('At least one topic must be listed');
            }
        });
    });
});
