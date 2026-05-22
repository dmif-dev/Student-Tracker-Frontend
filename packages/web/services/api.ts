// packages/web/services/api.ts

// Mock API service - Replace with actual API calls when backend is ready
import {
  mockStudents,
  mockMentors,
  mockPrograms,
  mockActivities,
  mockOutcomes,
  mockAnalytics,
  mockDashboardStats,
  type Student,
  type Mentor,
  type Program,
  type Track,
  type Activity,
  type Outcome,
} from './mockData';
import { DocumentService } from './documentService';
import { Document } from '@student-tracker/shared/models/Document';
import { createClient } from '@/utils/supabase/client';
import { apiClient } from '@/utils/apiClient';

// Helper function to get the current Supabase session token
const getAuthToken = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get program name from ID
const getProgramName = (programId: string): 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP' => {
  switch (programId?.toLowerCase()) {
    case 'g-gmp': return 'G-GMP';
    case 'g-cmp': return 'G-CMP';
    case 'e-tip': return 'E-TIP';
    case 'pcp': return 'PCP';
    default: return 'G-GMP';
  }
};

const mapBackendTrack = (track: any): Track => ({
  id: track.id,
  name: track.name,
  students: track._count?.students ?? track.students?.length ?? track.students ?? track.studentCount ?? 0,
  mentors: track.mentors ?? track.mentorCount ?? 0,
  progress: track.progress ?? track.averageProgress ?? 0,
  outcomes: track.outcomes ?? 0,
  requiresMentor: track.requiresMentor ?? true,
});

const sumRecordValues = (value: Record<string, number> | undefined) => {
  if (!value) return undefined;
  return Object.values(value).reduce((total, count) => total + Number(count || 0), 0);
};

const mapBackendProgram = (program: any): Program => {
  const metrics = program.metrics || {};
  const tracks = Array.isArray(program.tracks) ? program.tracks.map(mapBackendTrack) : [];
  const totalStudents = metrics.totalStudents ?? program._count?.students ?? program.totalStudents ?? 0;
  const activeStudents = metrics.activeStudents ?? program.activeStudents ?? 0;
  const completionRate = metrics.completionRate ?? program.completionRate ?? 0;
  const outcomeCount = sumRecordValues(metrics.outcomes) ?? program.outcomeCount;

  return {
    id: program.id,
    name: program.name,
    description: program.description || '',
    icon: program.icon || 'BookOpen',
    color: program.color || 'blue',
    tracks,
    totalStudents,
    activeStudents,
    completionRate,
    hasMentors: program.hasMentors ?? false,
    hasOutcomes: program.hasOutcomes ?? false,
    outcomeCount: outcomeCount || undefined,
  };
};

const mapBackendOutcome = (outcome: any): Outcome => ({
  id: outcome.id,
  type: (outcome.type || 'project').toLowerCase(),
  title: outcome.title,
  student: outcome.student?.name || outcome.student || '',
  studentId: outcome.studentId || '',
  status: (outcome.status || 'pending').toLowerCase(),
  date: outcome.date ? new Date(outcome.date).toISOString().split('T')[0] : '',
  mentor: outcome.mentor?.name || outcome.mentor || '',
  program: getProgramName(outcome.programId || outcome.program || '') as any,
});

const normalizeActivityType = (action: string): Activity['type'] => {
  const normalized = action.toLowerCase();
  if (normalized.includes('register')) return 'student_registered';
  if (normalized.includes('progress')) return 'progress_submitted';
  if (normalized.includes('session')) return 'session';
  if (normalized.includes('outcome')) return 'outcome_achieved';
  if (normalized.includes('report')) return 'report_generated';
  if (normalized.includes('completion')) return 'completion';
  return 'progress';
};

const mapBackendActivity = (activity: any): Activity => {
  const action = activity.action || activity.type || 'activity';
  const metadata = activity.metadata || {};
  return {
    id: activity.id,
    type: normalizeActivityType(action),
    title: metadata.title || action.replace(/_/g, ' '),
    description: metadata.details || metadata.description || action.replace(/_/g, ' '),
    time: activity.createdAt || activity.time || new Date().toISOString(),
    user: activity.user?.email || activity.user?.name || activity.user || 'System',
    userId: activity.userId,
    date: activity.createdAt ? new Date(activity.createdAt).toISOString().split('T')[0] : undefined,
  };
};

// Helper function to generate monthly outcome data
const generateMonthlyOutcomeData = (outcomes: Outcome[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    patents: Math.floor(Math.random() * 5) + 1,
    papers: Math.floor(Math.random() * 6) + 2,
    startups: Math.floor(Math.random() * 3) + 1,
  }));
};

// Helper function to generate monthly certification data
const generateMonthlyCertificationData = (outcomes: Outcome[]) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    certifications: Math.floor(Math.random() * 8) + 3,
  }));
};

export class ApiService {
  // Students
  static async getStudents(): Promise<Student[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  }

  static async getStudentById(id: string): Promise<Student | undefined> {
    await delay(500);
    return mockStudents.find(s => s.id === id);
  }

  static async createStudent(student: Partial<Student>): Promise<Student> {
    await delay(1000);
    const newStudent = {
      id: String(mockStudents.length + 1),
      ...student,
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      progress: 0,
    } as Student;
    mockStudents.push(newStudent);
    return newStudent;
  }

  static async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    await delay(800);
    const index = mockStudents.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStudents[index] = { ...mockStudents[index], ...updates };
      return mockStudents[index];
    }
    return undefined;
  }

  static async deleteStudent(id: string): Promise<boolean> {
    await delay(600);
    const index = mockStudents.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStudents.splice(index, 1);
      return true;
    }
    return false;
  }

  static async importStudents(students: Partial<Student>[]): Promise<{ success: number; errors: string[] }> {
    await delay(2000);
    const errors: string[] = [];
    let success = 0;
    
    students.forEach((student, index) => {
      if (!student.email || !student.name) {
        errors.push(`Row ${index + 2}: Missing required fields`);
      } else {
        const newStudent = {
          id: String(mockStudents.length + success + 1),
          ...student,
          joinDate: new Date().toISOString().split('T')[0],
          lastActive: new Date().toISOString().split('T')[0],
          progress: 0,
        } as Student;
        mockStudents.push(newStudent);
        success++;
      }
    });
    
    return { success, errors };
  }

  // Mentors
  static async getMentors(): Promise<Mentor[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/mentors`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch mentors');
    const mentors = await response.json();
    return mentors.map((m: any) => ({
      ...m,
      programs: m.programs ? m.programs.map((p: string) => p.replace('_', '-')) : []
    }));
  }

  static async getMentorById(id: string): Promise<Mentor | undefined> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/mentors/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch mentor');
    const mentor = await response.json();
    if (!mentor) return undefined;
    return {
      ...mentor,
      programs: mentor.programs ? mentor.programs.map((p: string) => p.replace('_', '-')) : []
    };
  }

  // Programs
  static async getPrograms(): Promise<Program[]> {
    await delay(800);
    return mockPrograms;
  }

  static async getProgramById(id: string): Promise<Program | undefined> {
    await delay(500);
    return mockPrograms.find(p => p.id === id);
  }

  // Get program metrics by ID
  static async getProgramMetrics(programId: string): Promise<any> {
    await delay(500);
    
    const program = mockPrograms.find(p => p.id === programId);
    const programName = getProgramName(programId);
    const students = mockStudents.filter(s => s.program === programName);
    const outcomes = mockOutcomes.filter(o => o.program === programName);
    
    // Get mentors for this program (excluding PCP)
    let mentors: any[] = [];
    if (programName !== 'PCP') {
      mentors = mockMentors.filter(m => m.programs.includes(programName));
    }
    
    return {
      program,
      studentCount: students.length,
      activeCount: students.filter(s => s.status === 'active').length,
      completionRate: program?.completionRate || 0,
      outcomes: program?.hasOutcomes ? outcomes.length : undefined,
      outcomeDetails: program?.hasOutcomes ? {
        patents: outcomes.filter(o => o.type === 'patent').length,
        papers: outcomes.filter(o => o.type === 'paper').length,
        startups: outcomes.filter(o => o.type === 'startup').length,
        certifications: outcomes.filter(o => o.type === 'certification').length,
      } : undefined,
      mentorCount: mentors.length,
      mentors: mentors.map(m => ({
        id: m.id,
        name: m.name,
        students: m.students,
      })),
    };
  }

  // Activities
  static async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    await delay(500);
    return mockActivities.slice(0, limit);
  }

  // Outcomes
  static async getOutcomes(filters?: { 
    studentId?: string; 
    type?: string; 
    program?: string;
    status?: string;
  }): Promise<Outcome[]> {
    await delay(600);
    let filtered = [...mockOutcomes];
    
    if (filters?.studentId) {
      filtered = filtered.filter(o => o.studentId === filters.studentId);
    }
    if (filters?.type) {
      filtered = filtered.filter(o => o.type === filters.type);
    }
    if (filters?.program) {
      filtered = filtered.filter(o => o.program === filters.program);
    }
    if (filters?.status) {
      filtered = filtered.filter(o => o.status === filters.status);
    }
    
    return filtered;
  }

  static async getOutcomeById(id: string): Promise<Outcome | undefined> {
    await delay(400);
    return mockOutcomes.find(o => o.id === id);
  }

  static async getOutcomesByProgram(program: string): Promise<Outcome[]> {
    await delay(400);
    return mockOutcomes.filter(o => o.program === program);
  }

  static async getGGMPOutcomes(): Promise<Outcome[]> {
    await delay(400);
    return mockOutcomes.filter(o => o.program === 'G-GMP');
  }

  static async getPCPCertifications(): Promise<Outcome[]> {
    await delay(400);
    return mockOutcomes.filter(o => o.program === 'PCP');
  }

  static async getOutcomeStatistics(): Promise<{
    gGMP: {
      total: number;
      patents: number;
      papers: number;
      startups: number;
      byMonth: Array<{ month: string; patents: number; papers: number; startups: number }>;
    };
    pcp: {
      total: number;
      associate: number;
      specialist: number;
      professional: number;
      byMonth: Array<{ month: string; certifications: number }>;
    };
  }> {
    await delay(600);
    
    const gGMPOutcomes = mockOutcomes.filter(o => o.program === 'G-GMP');
    const pcpOutcomes = mockOutcomes.filter(o => o.program === 'PCP');
    
    return {
      gGMP: {
        total: gGMPOutcomes.length,
        patents: gGMPOutcomes.filter(o => o.type === 'patent').length,
        papers: gGMPOutcomes.filter(o => o.type === 'paper').length,
        startups: gGMPOutcomes.filter(o => o.type === 'startup').length,
        byMonth: generateMonthlyOutcomeData(gGMPOutcomes),
      },
      pcp: {
        total: pcpOutcomes.length,
        associate: pcpOutcomes.filter(o => o.title?.includes('Associate')).length,
        specialist: pcpOutcomes.filter(o => o.title?.includes('Specialist')).length,
        professional: pcpOutcomes.filter(o => o.title?.includes('Professional')).length,
        byMonth: generateMonthlyCertificationData(pcpOutcomes),
      },
    };
  }

  static async createOutcome(outcome: Partial<Outcome>): Promise<Outcome> {
    await delay(800);
    const newOutcome: Outcome = {
      id: String(mockOutcomes.length + 1),
      type: outcome.type || 'patent',
      title: outcome.title || 'New Outcome',
      student: outcome.student || '',
      studentId: outcome.studentId || '',
      status: outcome.status || 'pending',
      date: new Date().toISOString().split('T')[0],
      mentor: outcome.mentor,
      program: outcome.program || 'G-GMP',
    };
    mockOutcomes.push(newOutcome);
    return newOutcome;
  }

  static async updateOutcome(id: string, updates: Partial<Outcome>): Promise<Outcome | undefined> {
    await delay(600);
    const index = mockOutcomes.findIndex(o => o.id === id);
    if (index !== -1) {
      mockOutcomes[index] = { ...mockOutcomes[index], ...updates };
      return mockOutcomes[index];
    }
    return undefined;
  }

  static async deleteOutcome(id: string): Promise<boolean> {
    await delay(500);
    const index = mockOutcomes.findIndex(o => o.id === id);
    if (index !== -1) {
      mockOutcomes.splice(index, 1);
      return true;
    }
    return false;
  }

  // Analytics
  static async getDashboardStats(): Promise<typeof mockDashboardStats> {
    await delay(800);
    return mockDashboardStats;
  }

  static async getAnalytics(dateRange: string = '6m', program?: string): Promise<typeof mockAnalytics> {
    await delay(1000);
    
    // Filter data based on dateRange and program
    let filteredData = { ...mockAnalytics };
    
    // Filter by program if specified
    if (program && program !== 'all') {
      // Adjust program distribution based on selected program
      filteredData.programDistribution = mockAnalytics.programDistribution.filter(
        (p: any) => p.name.toLowerCase().replace('-', '') === program
      );
      
      // Filter track performance by program
      if (program === 'g-gmp') {
        filteredData.trackPerformance = mockAnalytics.trackPerformance.filter(
          (t: any) => t.track.includes('Patent') || t.track.includes('Research') || t.track.includes('Entrepreneurship')
        );
      } else if (program === 'g-cmp') {
        filteredData.trackPerformance = mockAnalytics.trackPerformance.filter(
          (t: any) => t.track.includes('AI') || t.track.includes('Full') || t.track.includes('Cloud')
        );
      } else if (program === 'e-tip') {
        filteredData.trackPerformance = mockAnalytics.trackPerformance.filter(
          (t: any) => t.track.includes('Executive')
        );
      } else if (program === 'pcp') {
        filteredData.trackPerformance = mockAnalytics.trackPerformance.filter(
          (t: any) => t.program === 'PCP'
        );
      }
    }
    
    // Filter by date range
    if (dateRange !== 'all') {
      const months = {
        '1m': 1,
        '3m': 3,
        '6m': 6,
        '1y': 12
      };
      
      const limit = months[dateRange as keyof typeof months] || 6;
      filteredData.enrollmentTrend = mockAnalytics.enrollmentTrend.slice(-limit);
      filteredData.outcomesByMonth = mockAnalytics.outcomesByMonth.slice(-limit);
      filteredData.engagementMetrics = mockAnalytics.engagementMetrics.slice(-limit);
    }
    
    return filteredData;
  }

  // Get program comparison data
  static async getProgramComparison(): Promise<any[]> {
    await delay(700);
    
    return mockPrograms.map(program => ({
      program: program.name,
      type: program.hasOutcomes ? 
        (program.id === 'g-gmp' ? 'Innovation Program' : 'Certification Program') : 
        'Learning Program',
      totalStudents: program.totalStudents,
      activeStudents: program.activeStudents,
      completionRate: program.completionRate,
      hasMentors: program.hasMentors,
      hasOutcomes: program.hasOutcomes,
      outcomeCount: program.hasOutcomes ? 
        (program.id === 'g-gmp' ? 35 : 42) : 
        undefined,
    }));
  }

  // Search
  static async search(query: string, type?: 'student' | 'mentor' | 'outcome' | 'all'): Promise<any> {
    await delay(300);
    const results: any = {};
    
    if (type === 'all' || type === 'student') {
      results.students = mockStudents.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase()) ||
        s.registrationNumber.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (type === 'all' || type === 'mentor') {
      results.mentors = mockMentors.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.email.toLowerCase().includes(query.toLowerCase()) ||
        m.expertise.some(e => e.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    if (type === 'all' || type === 'outcome') {
      results.outcomes = mockOutcomes.filter(o =>
        o.title.toLowerCase().includes(query.toLowerCase()) ||
        o.student.toLowerCase().includes(query.toLowerCase()) ||
        o.type.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return results;
  }

  // Also ensure getMentorSchedule returns the updated sessions
  static async getMentorSchedule(mentorId: string): Promise<any[]> {
    await delay(500);
    
    // This would normally fetch from database
    // For now, return mock data plus any sessions added via scheduleSession
    const mentor = mockMentors.find(m => m.id === mentorId);
    if (!mentor || !mentor.assignedStudents) return [];
    
    const schedules: any[] = [];
    const now = new Date();
    
    // Only include non-PCP students
    const nonPCPStudents = mentor.assignedStudents.filter(s => s.program !== 'PCP');
    
    // Get stored sessions from localStorage or use mock data
    const storedSessions = JSON.parse(localStorage.getItem('mentor_sessions') || '[]');
    
    nonPCPStudents.forEach((student: any) => {
      // Check if there's a stored session for this student
      const existingSession = storedSessions.find((s: any) => s.studentId === student.id);
      
      if (existingSession) {
        schedules.push(existingSession);
      } else {
        // Generate mock sessions for students without stored sessions
        let dayOfWeek = 1;
        if (student.program === 'G-GMP') dayOfWeek = 1;
        if (student.program === 'G-CMP') dayOfWeek = 3;
        if (student.program === 'E-TIP') dayOfWeek = 5;
        
        for (let week = 0; week < 4; week++) {
          const sessionDate = new Date(now);
          const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7;
          sessionDate.setDate(now.getDate() + daysUntilNext + (week * 7));
          
          schedules.push({
            id: `s${student.id}-w${week}`,
            studentId: student.id,
            studentName: student.name,
            studentProgram: student.program,
            date: sessionDate.toISOString().split('T')[0],
            startTime: '10:00',
            endTime: '11:00',
            status: 'scheduled',
            topic: `${student.track} - Weekly Review`,
            meetingLink: 'https://meet.google.com/abc-defg-hij'
          });
        }
      }
    });
    
    // Merge with any additional scheduled sessions
    const allSessions = [...schedules, ...storedSessions.filter((s: any) => 
      !schedules.some((existing: any) => existing.id === s.id)
    )];
    
    return allSessions;
  }

  static async getMentorAvailability(mentorId: string): Promise<any[]> {
    await delay(300);
    const mentor = mockMentors.find(m => m.id === mentorId);
    return mentor?.availability || [];
  }

  static async scheduleSession(sessionData: any): Promise<any> {
    await delay(800);
    
    // In a real app, this would save to database
    // For now, return the session with an ID
    return {
      id: Date.now().toString(),
      ...sessionData,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
  }

  static async getTodaySessions(): Promise<any[]> {
    await delay(400);
    return [
      {
        id: 't1',
        studentName: 'John Doe',
        mentorName: 'Dr. Smith',
        program: 'G-GMP',
        track: 'Patent Track',
        time: '10:00 AM'
      },
      {
        id: 't2',
        studentName: 'Jane Smith',
        mentorName: 'Prof. Johnson',
        program: 'G-CMP',
        track: 'AI Product Development',
        time: '2:00 PM'
      },
      {
        id: 't3',
        studentName: 'Alex Chen',
        mentorName: 'Dr. Smith',
        program: 'G-GMP',
        track: 'Research Paper Track',
        time: '3:30 PM'
      }
    ];
  }

  static async getWeeklySessionCounts(): Promise<any> {
    await delay(300);
    return {
      'G-GMP': 12,
      'G-CMP': 8,
      'E-TIP': 5,
      'PCP': 0 // PCP has no sessions
    };
  }

  // Reports
  static async generateReport(config: any): Promise<any> {
    await delay(1500);
    
    // Generate report based on configuration
    const reportData: any = {
      id: Date.now().toString(),
      name: config.name,
      generatedAt: new Date().toISOString(),
      format: config.format,
      programs: config.programs,
    };

    // Add program-specific data
    if (config.programs.includes('G-GMP') || config.programs.length === 0) {
      reportData.gGMP = {
        students: mockStudents.filter(s => s.program === 'G-GMP').length,
        outcomes: mockOutcomes.filter(o => o.program === 'G-GMP').length,
        patents: mockOutcomes.filter(o => o.program === 'G-GMP' && o.type === 'patent').length,
        papers: mockOutcomes.filter(o => o.program === 'G-GMP' && o.type === 'paper').length,
        startups: mockOutcomes.filter(o => o.program === 'G-GMP' && o.type === 'startup').length,
      };
    }

    if (config.programs.includes('PCP') || config.programs.length === 0) {
      reportData.pcp = {
        students: mockStudents.filter(s => s.program === 'PCP').length,
        certifications: mockOutcomes.filter(o => o.program === 'PCP').length,
        associate: mockOutcomes.filter(o => o.program === 'PCP' && o.title?.includes('Associate')).length,
        specialist: mockOutcomes.filter(o => o.program === 'PCP' && o.title?.includes('Specialist')).length,
        professional: mockOutcomes.filter(o => o.program === 'PCP' && o.title?.includes('Professional')).length,
      };
    }

    if (config.programs.includes('G-CMP') || config.programs.length === 0) {
      reportData.gCMP = {
        students: mockStudents.filter(s => s.program === 'G-CMP').length,
        projects: Math.floor(Math.random() * 50) + 30,
      };
    }

    if (config.programs.includes('E-TIP') || config.programs.length === 0) {
      reportData.eTIP = {
        students: mockStudents.filter(s => s.program === 'E-TIP').length,
        sessions: Math.floor(Math.random() * 40) + 20,
      };
    }

    return reportData;
  }

  static async getSavedReports(): Promise<any[]> {
    await delay(600);
    return [
      {
        id: '1',
        name: 'Weekly Progress Report - Week 12',
        type: 'weekly',
        generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        format: 'pdf',
        programs: ['G-GMP', 'G-CMP', 'E-TIP'],
      },
      {
        id: '2',
        name: 'G-GMP Outcomes Report - March 2024',
        type: 'monthly',
        generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        format: 'pdf',
        programs: ['G-GMP'],
      },
      {
        id: '3',
        name: 'PCP Certification Report - Q1 2024',
        type: 'quarterly',
        generatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        format: 'excel',
        programs: ['PCP'],
      },
    ];
  }

  // Document methods
  static async getDocumentsByProgram(program: 'G-CMP' | 'E-TIP'): Promise<Document[]> {
    return DocumentService.getDocuments({ program });
  }

  static async getDocumentsByMentor(mentorId: string): Promise<Document[]> {
    return DocumentService.getMentorDocuments(mentorId);
  }

  static async getDocumentsForStudent(studentId: string): Promise<Document[]> {
    return DocumentService.getStudentDocuments(studentId);
  }

  static async grantDocumentAccess(documentId: string, studentId: string): Promise<Document | undefined> {
    return DocumentService.grantStudentPermission(documentId, studentId, true, true);
  }

  static async revokeDocumentAccess(documentId: string, studentId: string): Promise<Document | undefined> {
    return DocumentService.revokeStudentPermission(documentId, studentId);
  }

  // Backend Integration Example
  static async getMe(): Promise<any> {
    const token = await getAuthToken();
    if (!token) return null;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/user/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from backend');
    }

    return response.json();
  }

  // Student Profile Integration
  static async getStudentProfile(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/student/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  }

  static async updateStudentProfile(data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/student/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  // Mentor Profile Integration
  static async getMentorProfile(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/mentor/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mentor profile');
    }

    return response.json();
  }

  static async updateMentorProfile(data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/mentor/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update mentor profile');
    }

    return response.json();
  }

  // Auth Profile Integration
  static async getCurrentUser(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/me`, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    if (!response.ok) throw new Error('Failed to get user profile');
    return response.json();
  }

  static async updateCurrentUserProfile(data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings/profile`, { 
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }, 
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  }

  // --- Admin Settings Integration ---
  static async getAdminGeneralSettings(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/general`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch general settings');
    return response.json();
  }

  static async updateAdminGeneralSettings(data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/general`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to update general settings');
    return response.json();
  }

  static async getAdminNotificationSettings(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch notification settings');
    return response.json();
  }

  static async updateAdminNotificationSettings(data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/notifications`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to update notification settings');
    return response.json();
  }

  static async getAdminUsers(): Promise<any[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }

  static async updateAdminUserStatus(id: string, status: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/users/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status }) });
    if (!response.ok) throw new Error('Failed to update user status');
    return response.json();
  }

  static async deleteAdminUser(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete user');
    }
    return response.json();
  }

  static async createAdminUser(data: { email: string, name: string, role: string }): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/users`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  }

  // Security Settings
  static async getAdminSecuritySettings(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/security`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch security settings');
    return response.json();
  }

  static async updateAdminSecuritySettings(data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/security`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to update security settings');
    return response.json();
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const refreshToken = session?.refresh_token;
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/change-password`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
      body: JSON.stringify({ currentPassword, newPassword, refreshToken }) 
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update password');
    }
    return response.json();
  }

  // Email Templates
  static async getEmailTemplates(): Promise<any[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/email-templates`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch email templates');
    return response.json();
  }

  static async updateEmailTemplate(id: string, data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/email-templates/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to update email template');
    return response.json();
  }

  // API Keys
  static async getApiKeys(): Promise<any[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/api-keys`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch api keys');
    return response.json();
  }

  static async generateApiKey(name: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/api-keys`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ name }) });
    if (!response.ok) throw new Error('Failed to create api key');
    return response.json();
  }

  static async revokeApiKey(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/api-keys/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to revoke api key');
    return response.json();
  }

  // Backups
  static async getBackups(): Promise<any[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/backups`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch backups');
    return response.json();
  }

  static async createBackup(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/backups`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to create backup');
    return response.json();
  }

  static async restoreBackup(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/backups/${id}/restore`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to restore backup');
    return response.json();
  }

  static async deleteBackup(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/backups/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to delete backup');
    return response.json();
  }

  static async getBackupSettings(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/backup-config`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch backup settings');
    return response.json();
  }

  static async updateBackupSettings(data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/settings/backup-config`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to update backup settings');
    return response.json();
  }

  // --- Admin Notifications ---
  static async getAdminNotifications(): Promise<any[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  }

  static async getAdminAlerts(): Promise<any[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/alerts`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  }

  static async markNotificationAsRead(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/notifications/${id}/read`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  }

  static async markAllNotificationsAsRead(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/notifications/read-all`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
    return response.json();
  }

  static async deleteNotification(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/notifications/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to delete notification');
    return response.json();
  }

  static async dismissAlert(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/alerts/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to dismiss alert');
    return response.json();
  }

  static async createNotification(data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/notifications`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create notification');
    return response.json();
  }

  // --- Admin Documents ---
  static async getAdminDocuments(): Promise<any[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/documents`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  }

  static async uploadAdminDocument(data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'file' && data.file) {
        formData.append('file', data.file);
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/documents/upload`, { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token}` }, // Browser sets Content-Type to multipart/form-data with boundary
      body: formData
    });
    if (!response.ok) {
      let errorMessage = 'Failed to upload document';
      try {
        const errorData = await response.json();
        errorMessage = errorData?.error || errorData?.message || errorMessage;
      } catch {
        // Ignore parse failure and use fallback message
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  static async updateAdminDocument(id: string, data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/documents/${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
  }

  static async deleteAdminDocument(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/documents/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to delete document');
    return response.json();
  }

  static async updateAdminDocumentPermissions(id: string, permissions: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/documents/${id}/permissions`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ permissions })
    });
    if (!response.ok) throw new Error('Failed to update permissions');
    return response.json();
  }

  static async trackAdminDocumentView(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/documents/${id}/track-view`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to track view');
    return response.json();
  }

  static async trackAdminDocumentDownload(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/admin/documents/${id}/track-download`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to track download');
    return response.json();
  }
}
