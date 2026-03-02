import { Student } from '../models/Student';

export const formatStudentName = (student: Student): string => {
    return `${student.name} (${student.registrationNumber})`;
};

export const isValidRegistrationNumber = (regNum: string): boolean => {
    // Alphanumeric, 5-15 chars
    return /^[a-zA-Z0-9]{5,15}$/.test(regNum);
};

export const getStudentInitials = (name: string): string => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
