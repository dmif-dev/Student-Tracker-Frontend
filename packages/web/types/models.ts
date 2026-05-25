export interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
  track: string;
  mentor?: string; // Made optional - PCP students don't have mentors
  status: 'active' | 'inactive' | 'pending' | 'completed';
  joinDate: string;
  lastActive: string;
  progress: number;
  phone?: string;
  address?: string;
  avatar?: string;
  accountActive?: boolean;
  projects?: {
    completed: number;
    inProgress: number;
  };
  certifications?: {
    completed: number;
    inProgress: number;
  };
  sessionStats?: {
    completed: number;
    total: number;
    attendance: number;
  };
}

export interface MentorSchedule {
  id: string;
  studentId: string;
  studentName: string;
  studentProgram: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  topic?: string;
  notes?: string;
  meetingLink?: string;
}

export interface Availability {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
}

export interface AssignedStudent {
  id: string;
  name: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
  track: string;
  joinDate: string;
  lastSession?: string;
  nextSession?: string;
  progress: number;
  hasMentor: boolean; // Added to indicate if student has mentor
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  students: number;
  programs: string[]; // Should not include PCP
  rating: number;
  status: 'active' | 'inactive';
  joinDate: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatar?: string;
  schedule?: MentorSchedule[];
  availability?: Availability[];
  assignedStudents?: AssignedStudent[]; // Should only include G-GMP, G-CMP, E-TIP students
  stats?: any;
  performance?: any;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tracks: Track[];
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  hasMentors: boolean;
  hasOutcomes: boolean;  // Add this
  outcomeCount?: number;  // Add this (optional, only for G-GMP)
}

export interface Track {
  id: string;
  name: string;
  students: number;
  mentors: number;
  progress: number;
  outcomes: number;
  requiresMentor: boolean; // Added to indicate if track requires mentor
}

export interface Activity {
  id: string;
  type: 'enrollment' | 'progress' | 'outcome' | 'session' | 'completion' | 'student_registered' | 'progress_submitted' | 'report_generated' | 'outcome_achieved';
  title: string;
  description: string;
  time: string;
  user?: string;
  userId?: string;
  date?: string;
  program?: string; // Added to track which program the activity belongs to
}

export interface Outcome {
  id: string;
  type: 'patent' | 'paper' | 'project' | 'certification' | 'startup';
  title: string;
  student: string;
  studentId: string;
  status: 'pending' | 'filed' | 'published' | 'granted' | 'completed';
  date: string;
  mentor?: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP'; // Make it required and specific type
}
