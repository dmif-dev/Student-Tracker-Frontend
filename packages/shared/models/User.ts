export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    isActive: boolean;
    lastLogin?: Date;
}
