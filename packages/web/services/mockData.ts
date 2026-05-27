// packages/web/services/mockData.ts

// Mock data service for admin dashboard

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
  notes?: string;
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
}

// Update the Program interface
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

// Mock Students Data - Updated with PCP students having no mentor
export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    registrationNumber: 'DMIF2024001',
    program: 'G-GMP',
    track: 'Patent Track',
    mentor: 'Dr. Smith',
    status: 'active',
    joinDate: '2024-01-15',
    lastActive: '2024-03-21',
    progress: 75,
    phone: '+1 234 567 8901',
    address: '123 Main St, New York, NY 10001',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    registrationNumber: 'DMIF2024002',
    program: 'G-CMP',
    track: 'AI Product Development',
    mentor: 'Prof. Johnson',
    status: 'active',
    joinDate: '2024-02-01',
    lastActive: '2024-03-21',
    progress: 60,
    phone: '+1 234 567 8902',
    address: '456 Oak Ave, Los Angeles, CA 90001',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.j@example.com',
    registrationNumber: 'DMIF2024003',
    program: 'E-TIP',
    track: 'Cloud Development',
    mentor: 'Dr. Williams',
    status: 'pending',
    joinDate: '2024-03-10',
    lastActive: '2024-03-15',
    progress: 25,
    phone: '+1 234 567 8903',
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.w@example.com',
    registrationNumber: 'DMIF2024004',
    program: 'PCP',
    track: 'Agentic AI Systems',
    mentor: undefined, // No mentor for PCP
    status: 'active',
    joinDate: '2024-02-20',
    lastActive: '2024-03-21',
    progress: 90,
    phone: '+1 234 567 8904',
  },
  {
    id: '5',
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    registrationNumber: 'DMIF2024005',
    program: 'G-GMP',
    track: 'Research Paper Track',
    mentor: 'Dr. Smith',
    status: 'active',
    joinDate: '2024-01-20',
    lastActive: '2024-03-20',
    progress: 45,
    phone: '+1 234 567 8905',
  },
  {
    id: '6',
    name: 'Emily Brown',
    email: 'emily.b@example.com',
    registrationNumber: 'DMIF2024006',
    program: 'PCP',
    track: 'AI Product Development',
    mentor: undefined, // No mentor for PCP
    status: 'completed',
    joinDate: '2024-02-15',
    lastActive: '2024-03-01',
    progress: 100,
    phone: '+1 234 567 8906',
  },
  {
    id: '7',
    name: 'David Lee',
    email: 'david.lee@example.com',
    registrationNumber: 'DMIF2024007',
    program: 'G-CMP',
    track: 'Full Stack Development',
    mentor: 'Prof. Johnson',
    status: 'active',
    joinDate: '2024-02-10',
    lastActive: '2024-03-19',
    progress: 35,
    phone: '+1 234 567 8907',
  },
  {
    id: '8',
    name: 'Lisa Chen',
    email: 'lisa.chen@example.com',
    registrationNumber: 'DMIF2024008',
    program: 'E-TIP',
    track: 'AI Product Development',
    mentor: 'Dr. Williams',
    status: 'active',
    joinDate: '2024-03-01',
    lastActive: '2024-03-18',
    progress: 15,
    phone: '+1 234 567 8908',
  },
  {
    id: '9',
    name: 'Robert Kim',
    email: 'robert.kim@example.com',
    registrationNumber: 'DMIF2024009',
    program: 'PCP',
    track: 'AI Security',
    mentor: undefined, // No mentor for PCP
    status: 'pending',
    joinDate: '2024-03-15',
    lastActive: '2024-03-15',
    progress: 5,
    phone: '+1 234 567 8909',
  },
  {
    id: '10',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    registrationNumber: 'DMIF2024010',
    program: 'G-GMP',
    track: 'Entrepreneurship Track',
    mentor: 'Dr. Smith',
    status: 'active',
    joinDate: '2024-01-25',
    lastActive: '2024-03-17',
    progress: 55,
    phone: '+1 234 567 8910',
  },
];

// Mock Mentors Data - Updated to exclude PCP from their programs
export const mockMentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Smith',
    email: 'smith@dmif.org',
    expertise: ['AI/ML', 'Patents', 'Research Methodology'],
    students: 15,
    programs: ['G-GMP', 'G-CMP'], // Removed PCP
    rating: 4.8,
    status: 'active',
    joinDate: '2023-01-15',
    bio: 'PhD in Computer Science with 15+ years of experience in AI research and patent filing.',
    phone: '+1 234 567 8901',
    location: 'New York, USA',
    avatar: '/avatars/smith.jpg',
    availability: [
      { id: 'a1', dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isRecurring: true },
      { id: 'a2', dayOfWeek: 1, startTime: '14:00', endTime: '17:00', isRecurring: true },
      { id: 'a3', dayOfWeek: 3, startTime: '10:00', endTime: '13:00', isRecurring: true },
      { id: 'a4', dayOfWeek: 5, startTime: '09:00', endTime: '12:00', isRecurring: true },
    ],
    assignedStudents: [
      {
        id: '1',
        name: 'John Doe',
        program: 'G-GMP',
        track: 'Patent Track',
        joinDate: '2024-01-15',
        lastSession: '2024-03-20',
        nextSession: '2024-03-27',
        progress: 75,
        hasMentor: true,
      },
      {
        id: '5',
        name: 'Alex Chen',
        program: 'G-GMP',
        track: 'Research Paper Track',
        joinDate: '2024-01-20',
        lastSession: '2024-03-19',
        nextSession: '2024-03-26',
        progress: 45,
        hasMentor: true,
      },
      {
        id: '10',
        name: 'Maria Garcia',
        program: 'G-GMP',
        track: 'Entrepreneurship Track',
        joinDate: '2024-01-25',
        lastSession: '2024-03-17',
        nextSession: '2024-03-24',
        progress: 55,
        hasMentor: true,
      }
    ]
  },
  {
    id: '2',
    name: 'Prof. Johnson',
    email: 'johnson@dmif.org',
    expertise: ['Full Stack', 'Cloud Architecture', 'DevOps'],
    students: 12,
    programs: ['G-CMP'], // Removed PCP
    rating: 4.9,
    status: 'active',
    joinDate: '2023-02-01',
    bio: 'Former CTO with extensive experience in product development and cloud infrastructure.',
    phone: '+1 234 567 8902',
    location: 'San Francisco, USA',
    avatar: '/avatars/johnson.jpg',
    availability: [
      { id: 'b1', dayOfWeek: 2, startTime: '10:00', endTime: '14:00', isRecurring: true },
      { id: 'b2', dayOfWeek: 4, startTime: '13:00', endTime: '17:00', isRecurring: true },
    ],
    assignedStudents: [
      {
        id: '2',
        name: 'Jane Smith',
        program: 'G-CMP',
        track: 'AI Product Development',
        joinDate: '2024-02-01',
        lastSession: '2024-03-21',
        nextSession: '2024-03-28',
        progress: 60,
        hasMentor: true,
      },
      {
        id: '7',
        name: 'David Lee',
        program: 'G-CMP',
        track: 'Full Stack Development',
        joinDate: '2024-02-10',
        lastSession: '2024-03-19',
        nextSession: '2024-03-26',
        progress: 35,
        hasMentor: true,
      }
    ]
  },
  {
    id: '3',
    name: 'Dr. Williams',
    email: 'williams@dmif.org',
    expertise: ['Agentic AI', 'Research', 'Entrepreneurship'],
    students: 8,
    programs: ['E-TIP', 'G-GMP'], // Only E-TIP and G-GMP
    rating: 4.7,
    status: 'active',
    joinDate: '2023-03-10',
    bio: 'Serial entrepreneur and AI researcher with multiple patents in autonomous systems.',
    phone: '+1 234 567 8903',
    location: 'Boston, USA',
    avatar: '/avatars/williams.jpg',
    availability: [
      { id: 'c1', dayOfWeek: 5, startTime: '09:00', endTime: '13:00', isRecurring: true },
    ],
    assignedStudents: [
      {
        id: '3',
        name: 'Mike Johnson',
        program: 'E-TIP',
        track: 'Cloud Development',
        joinDate: '2024-03-10',
        lastSession: '2024-03-15',
        nextSession: '2024-03-22',
        progress: 25,
        hasMentor: true,
      },
      {
        id: '8',
        name: 'Lisa Chen',
        program: 'E-TIP',
        track: 'AI Product Development',
        joinDate: '2024-03-01',
        lastSession: '2024-03-18',
        nextSession: '2024-03-25',
        progress: 15,
        hasMentor: true,
      }
    ]
  },
  {
    id: '4',
    name: 'Dr. Brown',
    email: 'brown@dmif.org',
    expertise: ['Product Development', 'AI Strategy', 'Leadership'],
    students: 10,
    programs: ['E-TIP'], // Only E-TIP, removed PCP
    rating: 4.6,
    status: 'inactive',
    joinDate: '2023-04-20',
    bio: 'Product leader with experience at top tech companies.',
    phone: '+1 234 567 8904',
    location: 'Austin, USA',
    avatar: '/avatars/brown.jpg',
    availability: [
      { id: 'd1', dayOfWeek: 4, startTime: '11:00', endTime: '15:00', isRecurring: true },
    ],
    assignedStudents: [] // No active students currently
  },
];

// Mock Programs Data - Updated with hasMentors flag
// Update the mockPrograms data
export const mockPrograms: Program[] = [
  {
    id: 'g-gmp',
    name: 'G-GMP',
    description: 'Global Guided Mentorship Program - Innovation, Research & Entrepreneurship',
    icon: 'Brain',
    color: 'purple',
    hasMentors: true,
    hasOutcomes: true,  // Add this
    outcomeCount: 35, // Total patents + papers + startups from mockOutcomes
    tracks: [
      { id: 'patent', name: 'Patent Track', students: 45, mentors: 5, progress: 75, outcomes: 12, requiresMentor: true },
      { id: 'research', name: 'Research Paper Track', students: 38, mentors: 4, progress: 68, outcomes: 15, requiresMentor: true },
      { id: 'entrepreneurship', name: 'Entrepreneurship Track', students: 25, mentors: 3, progress: 82, outcomes: 8, requiresMentor: true },
      { id: 'foundation', name: 'Inventor Foundation Track', students: 52, mentors: 6, progress: 45, outcomes: 0, requiresMentor: true },
    ],
    totalStudents: 160,
    activeStudents: 142,
    completionRate: 78,
  },
  {
    id: 'g-cmp',
    name: 'G-CMP',
    description: 'Global Coding Mentorship Program - Building Real Engineers',
    icon: 'Code',
    color: 'green',
    hasMentors: true,
    hasOutcomes: false,  // Add this
    outcomeCount: undefined,  // Add this
    tracks: [
      { id: 'ai-product', name: 'AI Product Development', students: 65, mentors: 7, progress: 82, outcomes: 20, requiresMentor: true },
      { id: 'fullstack', name: 'Full Stack Development', students: 48, mentors: 5, progress: 70, outcomes: 15, requiresMentor: true },
      { id: 'cloud', name: 'Cloud Development & Deployment', students: 32, mentors: 4, progress: 68, outcomes: 10, requiresMentor: true },
      { id: 'agentic-ai', name: 'Agentic AI Development', students: 28, mentors: 3, progress: 60, outcomes: 8, requiresMentor: true },
    ],
    totalStudents: 173,
    activeStudents: 158,
    completionRate: 82,
  },
  {
    id: 'e-tip',
    name: 'E-TIP',
    description: 'Executive Technology Immersion Program - Technical Leadership',
    icon: 'Award',
    color: 'blue',
    hasMentors: true,
    hasOutcomes: false,  // Add this
    outcomeCount: undefined,  // Add this
    tracks: [
      { id: 'ai-product-exec', name: 'AI Product Development', students: 18, mentors: 3, progress: 85, outcomes: 5, requiresMentor: true },
      { id: 'fullstack-exec', name: 'Full Stack', students: 12, mentors: 2, progress: 78, outcomes: 3, requiresMentor: true },
      { id: 'cloud-exec', name: 'Cloud Development', students: 15, mentors: 2, progress: 72, outcomes: 4, requiresMentor: true },
      { id: 'agentic-ai-exec', name: 'Agentic AI', students: 10, mentors: 2, progress: 65, outcomes: 2, requiresMentor: true },
      { id: 'custom', name: 'Custom Track', students: 8, mentors: 1, progress: 90, outcomes: 2, requiresMentor: true },
    ],
    totalStudents: 63,
    activeStudents: 58,
    completionRate: 92,
  },
  {
    id: 'pcp',
    name: 'PCP',
    description: 'Professional Certification Program - Industry-Grade AI Certifications (Self-Paced, No Mentors)',
    icon: 'BookOpen',
    color: 'orange',
    hasMentors: false,
    hasOutcomes: true,  // PCP has certifications as outcomes
    outcomeCount: 42, // Total certifications from mockOutcomes
    tracks: [
      { id: 'ai-product-pcp', name: 'AI Product Development', students: 85, mentors: 0, progress: 88, outcomes: 25, requiresMentor: false },
      { id: 'agentic-ai-pcp', name: 'Agentic AI Systems', students: 42, mentors: 0, progress: 75, outcomes: 12, requiresMentor: false },
      { id: 'ai-finance', name: 'AI for Finance', students: 15, mentors: 0, progress: 45, outcomes: 3, requiresMentor: false },
      { id: 'ai-security', name: 'AI Security', students: 12, mentors: 0, progress: 30, outcomes: 2, requiresMentor: false },
    ],
    totalStudents: 154,
    activeStudents: 138,
    completionRate: 88,
  },
];

// Mock Activities Data - Updated with program info
export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'enrollment',
    title: 'New student enrolled',
    description: 'John Doe enrolled in G-GMP Patent Track',
    time: '10 minutes ago',
    date: '2024-03-21',
    user: 'John Doe',
    userId: '1',
    program: 'G-GMP',
  },
  {
    id: '2',
    type: 'progress',
    title: 'Weekly progress submitted',
    description: 'Jane Smith submitted weekly progress for G-CMP',
    time: '1 hour ago',
    date: '2024-03-21',
    user: 'Jane Smith',
    userId: '2',
    program: 'G-CMP',
  },
  {
    id: '3',
    type: 'outcome',
    title: 'Patent filed',
    description: 'Mike Johnson filed provisional patent for AI invention',
    time: '3 hours ago',
    date: '2024-03-21',
    user: 'Mike Johnson',
    userId: '3',
    program: 'E-TIP',
  },
  {
    id: '4',
    type: 'session',
    title: 'Mentor session completed',
    description: 'Sarah Wilson completed session with Dr. Brown',
    time: '5 hours ago',
    date: '2024-03-20',
    user: 'Sarah Wilson',
    userId: '4',
    program: 'PCP', // Note: Sarah is PCP but this is a certification completion, not a mentor session
  },
  {
    id: '5',
    type: 'completion',
    title: 'Track completed',
    description: 'Alex Chen completed Research Paper Track',
    time: '1 day ago',
    date: '2024-03-19',
    user: 'Alex Chen',
    userId: '5',
    program: 'G-GMP',
  },
  {
    id: '6',
    type: 'completion',
    title: 'Certification completed',
    description: 'Emily Brown completed PCP AI Product Development certification',
    time: '2 days ago',
    date: '2024-03-18',
    user: 'Emily Brown',
    userId: '6',
    program: 'PCP',
  },
  {
    id: '7',
    type: 'enrollment',
    title: 'New student enrolled',
    description: 'Robert Kim enrolled in PCP AI Security',
    time: '3 days ago',
    date: '2024-03-17',
    user: 'Robert Kim',
    userId: '9',
    program: 'PCP',
  },
  {
    id: '8',
    type: 'progress',
    title: 'Self-paced module completed',
    description: 'Sarah Wilson completed Module 3 of Agentic AI Systems',
    time: '4 days ago',
    date: '2024-03-16',
    user: 'Sarah Wilson',
    userId: '4',
    program: 'PCP',
  },
];

// Mock Outcomes Data - Updated with program info
export const mockOutcomes: Outcome[] = [
  {
    id: '1',
    type: 'patent',
    title: 'AI-based Patent Search System',
    student: 'John Doe',
    studentId: '1',
    status: 'filed',
    date: '2024-03-20',
    mentor: 'Dr. Smith',
    program: 'G-GMP',
  },
  {
    id: '2',
    type: 'paper',
    title: 'Advances in Agentic AI Systems',
    student: 'Jane Smith',
    studentId: '2',
    status: 'published',
    date: '2024-03-15',
    mentor: 'Prof. Johnson',
    program: 'G-GMP',
  },
  {
    id: '3',
    type: 'project',
    title: 'Cloud Native Learning Platform',
    student: 'Mike Johnson',
    studentId: '3',
    status: 'completed',
    date: '2024-03-10',
    mentor: 'Dr. Williams',
    program: 'E-TIP',
  },
  {
    id: '4',
    type: 'certification',
    title: 'Agentic AI Specialist',
    student: 'Sarah Wilson',
    studentId: '4',
    status: 'completed',
    date: '2024-03-05',
    mentor: undefined, // No mentor for PCP certification
    program: 'PCP',
  },
  {
    id: '5',
    type: 'patent',
    title: 'Blockchain-based Identity System',
    student: 'Alex Chen',
    studentId: '5',
    status: 'filed',
    date: '2024-03-01',
    mentor: 'Dr. Smith',
    program: 'G-GMP',
  },
  {
    id: '6',
    type: 'certification',
    title: 'AI Product Development Professional',
    student: 'Emily Brown',
    studentId: '6',
    status: 'completed',
    date: '2024-02-28',
    mentor: undefined, // No mentor for PCP certification
    program: 'PCP',
  },
  {
    id: '7',
    type: 'paper',
    title: 'Ethical Considerations in AI',
    student: 'Maria Garcia',
    studentId: '10',
    status: 'published',
    date: '2024-02-25',
    mentor: 'Dr. Smith',
    program: 'G-GMP',
  },
  {
    id: '8',
    type: 'startup',
    title: 'AI-powered Education Platform',
    student: 'John Doe',
    studentId: '1',
    status: 'pending',
    date: '2024-03-18',
    mentor: 'Dr. Smith',
    program: 'G-GMP',
  },
  {
    id: '9',
    type: 'certification',
    title: 'AI Security Fundamentals',
    student: 'Robert Kim',
    studentId: '9',
    status: 'pending',
    date: '2024-03-10',
    mentor: undefined,
    program: 'PCP',
  },
];

// Mock Analytics Data - Updated with PCP adjustments
export const mockAnalytics = {
  enrollmentTrend: [
    { month: 'Jan', students: 65, gGMP: 25, gCMP: 20, eTIP: 10, pcp: 10 },
    { month: 'Feb', students: 85, gGMP: 30, gCMP: 25, eTIP: 12, pcp: 18 },
    { month: 'Mar', students: 95, gGMP: 32, gCMP: 28, eTIP: 15, pcp: 20 },
    { month: 'Apr', students: 110, gGMP: 35, gCMP: 30, eTIP: 18, pcp: 27 },
    { month: 'May', students: 135, gGMP: 40, gCMP: 35, eTIP: 22, pcp: 38 },
    { month: 'Jun', students: 156, gGMP: 45, gCMP: 38, eTIP: 25, pcp: 48 },
  ],
  programDistribution: [
    { name: 'G-GMP', value: 160, hasMentors: true },
    { name: 'G-CMP', value: 173, hasMentors: true },
    { name: 'E-TIP', value: 63, hasMentors: true },
    { name: 'PCP', value: 154, hasMentors: false },
  ],
  trackPerformance: [
    { track: 'Patent Track', program: 'G-GMP', progress: 75, completion: 45, students: 45, requiresMentor: true },
    { track: 'Research Track', program: 'G-GMP', progress: 68, completion: 38, students: 38, requiresMentor: true },
    { track: 'AI Product', program: 'G-CMP', progress: 82, completion: 65, students: 65, requiresMentor: true },
    { track: 'Cloud Dev', program: 'G-CMP', progress: 70, completion: 32, students: 32, requiresMentor: true },
    { track: 'Agentic AI', program: 'G-CMP', progress: 60, completion: 28, students: 28, requiresMentor: true },
    { track: 'Executive AI', program: 'E-TIP', progress: 85, completion: 18, students: 18, requiresMentor: true },
    { track: 'PCP AI Product', program: 'PCP', progress: 88, completion: 85, students: 85, requiresMentor: false },
    { track: 'PCP Agentic AI', program: 'PCP', progress: 75, completion: 42, students: 42, requiresMentor: false },
  ],
  outcomesByMonth: [
    { month: 'Jan', patents: 3, papers: 5, projects: 2, certifications: 1 },
    { month: 'Feb', patents: 5, papers: 7, projects: 3, certifications: 2 },
    { month: 'Mar', patents: 8, papers: 6, projects: 4, certifications: 3 },
    { month: 'Apr', patents: 6, papers: 9, projects: 5, certifications: 4 },
    { month: 'May', patents: 10, papers: 12, projects: 6, certifications: 6 },
    { month: 'Jun', patents: 12, papers: 15, projects: 8, certifications: 8 },
  ],
  engagementMetrics: [
    { week: 'W1', active: 85, submissions: 120, sessions: 45, selfPacedCompletions: 12 },
    { week: 'W2', active: 92, submissions: 145, sessions: 52, selfPacedCompletions: 15 },
    { week: 'W3', active: 88, submissions: 135, sessions: 48, selfPacedCompletions: 18 },
    { week: 'W4', active: 95, submissions: 160, sessions: 55, selfPacedCompletions: 22 },
    { week: 'W5', active: 102, submissions: 180, sessions: 62, selfPacedCompletions: 25 },
    { week: 'W6', active: 110, submissions: 195, sessions: 68, selfPacedCompletions: 28 },
  ],
  mentorPerformance: [
    { name: 'Dr. Smith', sessions: 45, students: 15, rating: 4.8, programs: ['G-GMP', 'G-CMP'] },
    { name: 'Prof. Johnson', sessions: 38, students: 12, rating: 4.9, programs: ['G-CMP'] },
    { name: 'Dr. Williams', sessions: 32, students: 8, rating: 4.7, programs: ['E-TIP', 'G-GMP'] },
    { name: 'Dr. Brown', sessions: 28, students: 10, rating: 4.6, programs: ['E-TIP'] },
  ],
  studentProgress: [
    { range: '0-25%', count: 45, programs: { 'G-GMP': 10, 'G-CMP': 12, 'E-TIP': 8, 'PCP': 15 } },
    { range: '26-50%', count: 78, programs: { 'G-GMP': 20, 'G-CMP': 22, 'E-TIP': 12, 'PCP': 24 } },
    { range: '51-75%', count: 112, programs: { 'G-GMP': 30, 'G-CMP': 32, 'E-TIP': 18, 'PCP': 32 } },
    { range: '76-100%', count: 88, programs: { 'G-GMP': 25, 'G-CMP': 20, 'E-TIP': 15, 'PCP': 28 } },
  ],
  programCompletionRates: [
    { program: 'G-GMP', rate: 78, withMentor: true },
    { program: 'G-CMP', rate: 82, withMentor: true },
    { program: 'E-TIP', rate: 92, withMentor: true },
    { program: 'PCP', rate: 88, withMentor: false },
  ],
};

// Dashboard Stats - Updated with PCP counts
export const mockDashboardStats = {
  totalStudents: 550, // Updated to include all students
  activeStudents: 438,
  totalMentors: 24,
  programsCount: 4,
  pendingReviews: 12,
  outcomesThisMonth: 42,
  totalOutcomes: 112,
  patentsCount: 44,
  papersCount: 59,
  averageProgress: 71,
  engagementRate: 82,
  // New stats for PCP
  pcpStudents: 154,
  pcpCompletions: 48,
  certificationsIssued: 42,
  selfPacedCompletions: 28,
};


// Mock mentor credentials (from mockData.ts)
const MENTOR_ID = '1';
const MENTOR_NAME = 'Dr. Smith';
const MENTOR_EMAIL = 'smith@dmif.org';