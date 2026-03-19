// packages/shared/models/Session.ts 

export interface Session {
  id: string;
  studentId: string;
  studentName: string;
  studentProgram: 'G-GMP' | 'G-CMP' | 'E-TIP';
  studentTrack: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  topic: string;
  meetingLink?: string;
  notes?: SessionNote[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionNote {
  id: string;
  sessionId: string;
  content: string;
  topics: string[];
  duration?: number; // actual duration in minutes
  feedback?: string;
  nextSteps?: string;
  resources?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}