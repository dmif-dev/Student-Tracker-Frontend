// packages/shared/models/Student.ts

export type ProgramType = 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';

export interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  program: ProgramType;
  track: string;
  mentor?: string; // Made optional - PCP students don't have mentors
  status: 'active' | 'inactive' | 'pending' | 'completed';
  joinDate: string;
  lastActive: string;
  progress: number;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}