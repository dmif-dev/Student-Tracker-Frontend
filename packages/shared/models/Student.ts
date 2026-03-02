export interface Student {
    id: string;
    name: string;
    registrationNumber: string;
    email: string;
    class: string;
    section?: string;
    createdAt: Date;
    updatedAt: Date;
}
