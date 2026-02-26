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

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    // Simulate import with some errors
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

  // Activities
  static async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    await delay(500);
    return mockActivities.slice(0, limit);
  }

  // Outcomes
  static async getOutcomes(filters?: { studentId?: string; type?: string }): Promise<Outcome[]> {
    await delay(600);
    let filtered = mockOutcomes;
    if (filters?.studentId) {
      filtered = filtered.filter(o => o.studentId === filters.studentId);
    }
    if (filters?.type) {
      filtered = filtered.filter(o => o.type === filters.type);
    }
    return filtered;
  }

  // Analytics
  static async getDashboardStats(): Promise<typeof mockDashboardStats> {
    await delay(800);
    return mockDashboardStats;
  }

  static async getAnalytics(dateRange: string = '6m', program?: string): Promise<typeof mockAnalytics> {
    await delay(1000);
    // In real implementation, you'd filter based on dateRange and program
    return mockAnalytics;
  }

  // Search
  static async search(query: string, type?: 'student' | 'mentor' | 'all'): Promise<any> {
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
    
    return results;
  }

  // Schedule methods
  static async getMentorSchedule(mentorId: string): Promise<any[]> {
    await delay(500);
    const mentor = mockMentors.find(m => m.id === mentorId);
    if (!mentor || !mentor.assignedStudents) return [];
    
    const schedules: any[] = [];
    const now = new Date();
    
    mentor.assignedStudents.forEach((student: any) => {
      if (student.program === 'PCP') return;
      
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
    });
    
    return schedules;
  }

  static async getMentorAvailability(mentorId: string): Promise<any[]> {
    await delay(300);
    const mentor = mockMentors.find(m => m.id === mentorId);
    return mentor?.availability || [];
  }

  static async scheduleSession(sessionData: any): Promise<any> {
    await delay(800);
    return {
      id: Date.now().toString(),
      ...sessionData,
      status: 'scheduled'
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
      'E-TIP': 5
    };
  }
}