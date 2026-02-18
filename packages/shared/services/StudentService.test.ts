import { StudentService } from './StudentService';
import { Student } from '../models/Student';

describe('StudentService', () => {
    // Ideally we'd clear the static array before each test, but access is private.
    // We'll use unique IDs to ensure isolation.

    const mockStudent: Student = {
        id: 'test-id-1',
        name: 'Test Student',
        registrationNumber: 'REG-TEST-1',
        email: 'test@example.com',
        class: '10',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('should add a student', async () => {
        await StudentService.addStudent(mockStudent);
        const students = await StudentService.getStudents();
        expect(students).toContainEqual(mockStudent);
    });

    it('should get a student by ID', async () => {
        const student = await StudentService.getStudentById('test-id-1');
        expect(student).toEqual(mockStudent);
    });

    it('should update a student', async () => {
        await StudentService.updateStudent('test-id-1', { name: 'Updated Name' });
        const student = await StudentService.getStudentById('test-id-1');
        expect(student?.name).toBe('Updated Name');
    });

    it('should delete a student', async () => {
        await StudentService.deleteStudent('test-id-1');
        const student = await StudentService.getStudentById('test-id-1');
        expect(student).toBeUndefined();
    });
});
