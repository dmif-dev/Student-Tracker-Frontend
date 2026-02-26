// Mock data service for admin dashboard

export interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
  track: string;
  mentor: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
  progress: number;
  phone?: string;
  address?: string;
  avatar?: string;
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
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  students: number;
  programs: string[];
  rating: number;
  status: 'active' | 'inactive';
  joinDate: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatar?: string;
  schedule?: MentorSchedule[];  // Add this
  availability?: Availability[]; // Add this
  assignedStudents?: AssignedStudent[]; // Add this
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
}

export interface Track {
  id: string;
  name: string;
  students: number;
  mentors: number;
  progress: number;
  outcomes: number;
}

export interface Activity {
  id: string;
  type: 'enrollment' | 'progress' | 'outcome' | 'session' | 'completion' | 'student_registered' | 'progress_submitted' | 'report_generated' | 'outcome_achieved';
  title: string;
  description: string;
  time: string;
  user?: string;
  userId?: string;
  date?: string; // Add optional date field
}

export interface Outcome {
  id: string;
  type: 'patent' | 'paper' | 'project' | 'certification';
  title: string;
  student: string;
  studentId: string;
  status: 'pending' | 'filed' | 'published' | 'granted' | 'completed';
  date: string;
  mentor?: string;
}

// Mock Students Data
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
    mentor: 'Dr. Brown',
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
    program: 'G-CMP',
    track: 'Full Stack Development',
    mentor: 'Prof. Johnson',
    status: 'inactive',
    joinDate: '2024-02-15',
    lastActive: '2024-03-01',
    progress: 30,
    phone: '+1 234 567 8906',
  },
];

// Mock Mentors Data with Schedule and Availability
export const mockMentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Smith',
    email: 'smith@dmif.org',
    expertise: ['AI/ML', 'Patents', 'Research Methodology'],
    students: 15,
    programs: ['G-GMP', 'G-CMP'],
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
        progress: 75
      },
      {
        id: '5',
        name: 'Alex Chen',
        program: 'G-GMP',
        track: 'Research Paper Track',
        joinDate: '2024-01-20',
        lastSession: '2024-03-19',
        nextSession: '2024-03-26',
        progress: 45
      },
      {
        id: '6',
        name: 'Emily Brown',
        program: 'G-CMP',
        track: 'Full Stack Development',
        joinDate: '2024-02-15',
        lastSession: '2024-03-18',
        nextSession: '2024-03-25',
        progress: 30
      }
    ]
  },
  {
    id: '2',
    name: 'Prof. Johnson',
    email: 'johnson@dmif.org',
    expertise: ['Full Stack', 'Cloud Architecture', 'DevOps'],
    students: 12,
    programs: ['G-CMP', 'PCP'],
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
        progress: 60
      }
    ]
  },
  {
    id: '3',
    name: 'Dr. Williams',
    email: 'williams@dmif.org',
    expertise: ['Agentic AI', 'Research', 'Entrepreneurship'],
    students: 8,
    programs: ['E-TIP', 'G-GMP'],
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
        progress: 25
      }
    ]
  },
  {
    id: '4',
    name: 'Dr. Brown',
    email: 'brown@dmif.org',
    expertise: ['Product Development', 'AI Strategy', 'Leadership'],
    students: 10,
    programs: ['E-TIP', 'PCP'],
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
    assignedStudents: [
      {
        id: '4',
        name: 'Sarah Wilson',
        program: 'PCP',
        track: 'Agentic AI Systems',
        joinDate: '2024-02-20',
        lastSession: '2024-03-21',
        nextSession: '2024-03-28',
        progress: 90
      }
    ]
  },
];

// Mock Programs Data
export const mockPrograms: Program[] = [
  {
    id: 'g-gmp',
    name: 'G-GMP',
    description: 'Global Guided Mentorship Program - Innovation, Research & Entrepreneurship',
    icon: 'Brain',
    color: 'purple',
    tracks: [
      { id: 'patent', name: 'Patent Track', students: 45, mentors: 5, progress: 75, outcomes: 12 },
      { id: 'research', name: 'Research Paper Track', students: 38, mentors: 4, progress: 68, outcomes: 15 },
      { id: 'entrepreneurship', name: 'Entrepreneurship Track', students: 25, mentors: 3, progress: 82, outcomes: 8 },
      { id: 'foundation', name: 'Inventor Foundation Track', students: 52, mentors: 6, progress: 45, outcomes: 0 },
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
    tracks: [
      { id: 'ai-product', name: 'AI Product Development', students: 65, mentors: 7, progress: 82, outcomes: 20 },
      { id: 'fullstack', name: 'Full Stack Development', students: 48, mentors: 5, progress: 70, outcomes: 15 },
      { id: 'cloud', name: 'Cloud Development & Deployment', students: 32, mentors: 4, progress: 68, outcomes: 10 },
      { id: 'agentic-ai', name: 'Agentic AI Development', students: 28, mentors: 3, progress: 60, outcomes: 8 },
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
    tracks: [
      { id: 'ai-product-exec', name: 'AI Product Development', students: 18, mentors: 3, progress: 85, outcomes: 5 },
      { id: 'fullstack-exec', name: 'Full Stack', students: 12, mentors: 2, progress: 78, outcomes: 3 },
      { id: 'cloud-exec', name: 'Cloud Development', students: 15, mentors: 2, progress: 72, outcomes: 4 },
      { id: 'agentic-ai-exec', name: 'Agentic AI', students: 10, mentors: 2, progress: 65, outcomes: 2 },
      { id: 'custom', name: 'Custom Track', students: 8, mentors: 1, progress: 90, outcomes: 2 },
    ],
    totalStudents: 63,
    activeStudents: 58,
    completionRate: 92,
  },
  {
    id: 'pcp',
    name: 'PCP',
    description: 'Professional Certification Program - Industry-Grade AI Certifications',
    icon: 'BookOpen',
    color: 'orange',
    tracks: [
      { id: 'ai-product-pcp', name: 'AI Product Development', students: 85, mentors: 8, progress: 88, outcomes: 25 },
      { id: 'agentic-ai-pcp', name: 'Agentic AI Systems', students: 42, mentors: 4, progress: 75, outcomes: 12 },
      { id: 'ai-finance', name: 'AI for Finance', students: 0, mentors: 2, progress: 0, outcomes: 0 },
      { id: 'ai-security', name: 'AI Security', students: 0, mentors: 2, progress: 0, outcomes: 0 },
    ],
    totalStudents: 127,
    activeStudents: 112,
    completionRate: 88,
  },
];

// Mock Activities Data
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
  },
];

// Mock Outcomes Data
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
  },
  {
    id: '4',
    type: 'certification',
    title: 'Agentic AI Specialist',
    student: 'Sarah Wilson',
    studentId: '4',
    status: 'completed',
    date: '2024-03-05',
    mentor: 'Dr. Brown',
  },
];

// Mock Analytics Data
export const mockAnalytics = {
  enrollmentTrend: [
    { month: 'Jan', students: 65 },
    { month: 'Feb', students: 85 },
    { month: 'Mar', students: 95 },
    { month: 'Apr', students: 110 },
    { month: 'May', students: 135 },
    { month: 'Jun', students: 156 },
  ],
  programDistribution: [
    { name: 'G-GMP', value: 160 },
    { name: 'G-CMP', value: 173 },
    { name: 'E-TIP', value: 63 },
    { name: 'PCP', value: 127 },
  ],
  trackPerformance: [
    { track: 'Patent Track', progress: 75, completion: 45 },
    { track: 'Research Track', progress: 68, completion: 38 },
    { track: 'AI Product', progress: 82, completion: 65 },
    { track: 'Cloud Dev', progress: 70, completion: 32 },
    { track: 'Agentic AI', progress: 60, completion: 28 },
  ],
  outcomesByMonth: [
    { month: 'Jan', patents: 3, papers: 5 },
    { month: 'Feb', patents: 5, papers: 7 },
    { month: 'Mar', patents: 8, papers: 6 },
    { month: 'Apr', patents: 6, papers: 9 },
    { month: 'May', patents: 10, papers: 12 },
    { month: 'Jun', patents: 12, papers: 15 },
  ],
  engagementMetrics: [
    { week: 'W1', active: 85, submissions: 120 },
    { week: 'W2', active: 92, submissions: 145 },
    { week: 'W3', active: 88, submissions: 135 },
    { week: 'W4', active: 95, submissions: 160 },
    { week: 'W5', active: 102, submissions: 180 },
    { week: 'W6', active: 110, submissions: 195 },
  ],
};

// Dashboard Stats
export const mockDashboardStats = {
  totalStudents: 523,
  activeStudents: 412,
  totalMentors: 24,
  programsCount: 4,
  pendingReviews: 12,
  outcomesThisMonth: 35,
  totalOutcomes: 89,
  patentsCount: 35,
  papersCount: 54,
  averageProgress: 68,
  engagementRate: 78,
};