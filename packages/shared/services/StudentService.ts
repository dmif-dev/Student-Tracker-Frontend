import { Student } from '../models/Student';

export class StudentService {
    private static students: Student[] = [];

    static async getStudents(): Promise<Student[]> {
        return this.students;
    }

    static async getStudentById(id: string): Promise<Student | undefined> {
        return this.students.find(s => s.id === id);
    }

    static async addStudent(student: Student): Promise<void> {
        this.students.push(student);
    }

    static async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
        const index = this.students.findIndex(s => s.id === id);
        if (index !== -1) {
            this.students[index] = { ...this.students[index], ...updates, updatedAt: new Date() };
        }
    }

    static async deleteStudent(id: string): Promise<void> {
        this.students = this.students.filter(s => s.id !== id);
    }
}
