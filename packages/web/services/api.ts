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
  type Activity,
  type Outcome,
} from './mockData';
import { DocumentService } from './documentService';
import { Document } from '@student-tracker/shared/models/Document'; // Add this import

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get program name from ID
const getProgramName = (programId: string): string => {
  switch (programId) {
    case 'g-gmp': return 'G-GMP';
    case 'g-cmp': return 'G-CMP';
    case 'e-tip': return 'E-TIP';
    case 'pcp': return 'PCP';
    default: return '';
  }
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
    await delay(800);
    return mockStudents;
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
    await delay(800);
    return mockMentors;
  }

  static async getMentorById(id: string): Promise<Mentor | undefined> {
    await delay(500);
    return mockMentors.find(m => m.id === id);
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
}