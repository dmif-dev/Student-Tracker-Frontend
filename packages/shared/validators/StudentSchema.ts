import { z } from 'zod';

export const StudentSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    registrationNumber: z.string().regex(/^[a-zA-Z0-9]{5,15}$/, 'Invalid registration number format'),
    email: z.string().email('Invalid email address'),
    class: z.string().min(1, 'Class is required'),
    section: z.string().optional(),
});

export type StudentInput = z.infer<typeof StudentSchema>;
