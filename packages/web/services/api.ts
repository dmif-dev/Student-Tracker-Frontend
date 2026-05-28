// packages/web/services/api.ts

import { type Student, type Mentor, type Program, type Track, type Activity, type Outcome } from '../types/models';

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
    try {
      return await apiClient.get<Student>(`students/${id}`);
    } catch {
      return undefined;
    }
  }

  static async createStudent(student: Partial<Student>): Promise<Student> {
    return await apiClient.post<Student>('students', student);
  }

  static async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    try {
      return await apiClient.put<Student>(`students/${id}`, updates);
    } catch {
      return undefined;
    }
  }

  static async deleteStudent(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`students/${id}`);
      return true;
    } catch {
      return false;
    }
  }

  static async importStudents(students: Partial<Student>[]): Promise<{ success: number; errors: string[] }> {
    return await apiClient.post<{ success: number; errors: string[] }>('students/import', { students });
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
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/programs`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error('Failed to fetch programs');
    const data = await response.json();
    return data.map(mapBackendProgram);
  }

  static async getProgramById(id: string): Promise<Program | undefined> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/programs/${id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!response.ok) return undefined;
    const data = await response.json();
    return mapBackendProgram(data);
  }

  // Update a track via backend
  static async updateTrack(trackId: string, updates: Record<string, any>): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/programs/tracks/${trackId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );
    if (!response.ok) throw new Error('Failed to update track');
    return response.json();
  }

  // Get program metrics by ID
  static async getProgramMetrics(programId: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/programs/${programId}/metrics`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    if (!response.ok) throw new Error('Failed to fetch program metrics');
    return response.json();
  }

  // Activities
  static async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      const data = await apiClient.get<any>(`activity/me?limit=${limit}`);
      return Array.isArray(data) ? data.map(mapBackendActivity) : [];
    } catch {
      return [];
    }
  }

  // Outcomes
  static async getOutcomes(filters?: { 
    studentId?: string; 
    type?: string; 
    program?: string;
    status?: string;
  }): Promise<Outcome[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.studentId) params.append('studentId', filters.studentId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.program) params.append('program', filters.program);
      if (filters?.status) params.append('status', filters.status);
      
      const data = await apiClient.get<any[]>(`outcomes?${params.toString()}`);
      return data.map(mapBackendOutcome);
    } catch {
      return [];
    }
  }

  static async getOutcomeById(id: string): Promise<Outcome | undefined> {
    try {
      const data = await apiClient.get<any>(`outcomes/${id}`);
      return mapBackendOutcome(data);
    } catch {
      return undefined;
    }
  }

  static async getOutcomesByProgram(program: string): Promise<Outcome[]> {
    return this.getOutcomes({ program });
  }

  static async getGGMPOutcomes(): Promise<Outcome[]> {
    return this.getOutcomes({ program: 'G-GMP' });
  }

  static async getPCPCertifications(): Promise<Outcome[]> {
    return this.getOutcomes({ program: 'PCP' });
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
    try {
      const data = await apiClient.get<any>('outcomes/analytics/dashboard');
      return data;
    } catch {
      // Fallback empty structure in case backend doesn't match
      return {
        gGMP: { total: 0, patents: 0, papers: 0, startups: 0, byMonth: [] },
        pcp: { total: 0, associate: 0, specialist: 0, professional: 0, byMonth: [] }
      };
    }
  }

  static async createOutcome(outcome: Partial<Outcome>): Promise<Outcome> {
    const data = await apiClient.post<any>('outcomes', outcome);
    return mapBackendOutcome(data);
  }

  static async updateOutcome(id: string, updates: Partial<Outcome>): Promise<Outcome | undefined> {
    try {
      const data = await apiClient.put<any>(`outcomes/${id}`, updates);
      return mapBackendOutcome(data);
    } catch {
      return undefined;
    }
  }

  static async deleteOutcome(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`outcomes/${id}`);
      return true;
    } catch {
      return false;
    }
  }

  // Analytics
  static async getDashboardStats(): Promise<any> {
    try {
      // Trying admin dashboard stats by default, assuming generic dashboard usage
      return await apiClient.get<any>('dashboard/admin');
    } catch {
      return {};
    }
  }

  static async getAnalytics(dateRange: string = '6m', program?: string, track?: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const queryParams = new URLSearchParams({
      dateRange,
      ...(program && { program }),
      ...(track && { track })
    });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/outcomes/analytics/admin?${queryParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch admin analytics');
    }

    return response.json();
  }

  // Get program comparison data
  static async getProgramComparison(): Promise<any[]> {
    try {
      const programs = await this.getPrograms();
      return programs.map(program => ({
        program: program.name,
        type: program.hasOutcomes ? 
          (program.id === 'g-gmp' ? 'Innovation Program' : 'Certification Program') : 
          'Learning Program',
        totalStudents: program.totalStudents,
        activeStudents: program.activeStudents,
        completionRate: program.completionRate,
        hasMentors: program.hasMentors,
        hasOutcomes: program.hasOutcomes,
        outcomeCount: program.outcomeCount,
      }));
    } catch {
      return [];
    }
  }

  // Search
  static async search(query: string, type?: 'student' | 'mentor' | 'outcome' | 'all'): Promise<any> {
    try {
      const params = new URLSearchParams({ q: query });
      if (type && type !== 'all') params.append('type', type);
      return await apiClient.get<any>(`search?${params.toString()}`);
    } catch {
      return { students: [], mentors: [], outcomes: [] };
    }
  }

  static async getMentorSchedule(mentorId?: string): Promise<any[]> {
    const url = mentorId ? `mentor/sessions?mentorId=${mentorId}` : 'mentor/sessions';
    return await apiClient.get<any[]>(url);
  }

  static async getMentorAvailability(mentorId?: string): Promise<any[]> {
    const url = mentorId ? `mentor/availability?mentorId=${mentorId}` : 'mentor/availability';
    return await apiClient.get<any[]>(url);
  }

  static async scheduleSession(sessionData: any): Promise<any> {
    return await apiClient.post<any>('mentor/sessions', sessionData);
  }

  static async getTodaySessions(): Promise<any[]> {
    // Assuming backend returns only upcoming/today's sessions for this endpoint
    // Fallback to filtering all sessions if a specific endpoint doesn't exist
    try {
      return await apiClient.get<any[]>('mentor/sessions/upcoming');
    } catch {
      const allSessions = await this.getMentorSchedule();
      const today = new Date().toISOString().split('T')[0];
      return allSessions.filter(s => s.date.startsWith(today));
    }
  }

  static async getWeeklySessionCounts(): Promise<any> {
    try {
      const stats = await apiClient.get<any>('mentor/stats');
      return stats.weeklyCounts || {
        'G-GMP': 0,
        'G-CMP': 0,
        'E-TIP': 0,
        'PCP': 0
      };
    } catch {
      return {
        'G-GMP': 0,
        'G-CMP': 0,
        'E-TIP': 0,
        'PCP': 0
      };
    }
  }

  // Reports
  static async generateReport(config: any): Promise<any> {
    try {
      return await apiClient.post<any>('reports/generate', config);
    } catch {
      throw new Error('Failed to generate report');
    }
  }

  static async getSavedReports(): Promise<any[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reports/admin/generated`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch generated reports');
    const result = await response.json();
    return result.data || [];
  }

  static async generateWeeklyReport(studentId: string, weekStart?: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reports/weekly/generate/${studentId}`);
    if (weekStart) {
      url.searchParams.append('weekStart', weekStart);
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to generate report for student ${studentId}`);
    }

    return response.json();
  }

  static async getScheduledReports(): Promise<any[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reports/scheduled`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch scheduled reports');
    const result = await response.json();

    // Map scheduled reports from backend format to frontend format
    return (result || []).map((s: any) => {
      const config = typeof s.config === 'string' ? JSON.parse(s.config) : s.config || {};
      return {
        id: s.id,
        name: s.name,
        type: (s.frequency || 'weekly') as 'weekly' | 'monthly',
        schedule: config.schedule || (s.frequency === 'weekly' ? 'Every Monday' : '1st of every month'),
        time: config.time || '09:00 AM',
        recipients: s.recipients || [],
        format: config.format || 'pdf',
        programs: config.programs || ['G-GMP', 'G-CMP', 'E-TIP', 'PCP'],
        status: s.isActive ? 'active' as const : 'paused' as const,
        lastGenerated: s.lastRunAt,
        nextGeneration: s.nextRunAt,
      };
    });
  }

  static async createScheduledReport(data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reports/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: data.name,
        frequency: data.type || 'weekly',
        config: {
          format: data.format || 'pdf',
          programs: data.programs || [],
          schedule: data.schedule || 'Every Monday',
          time: data.time || '09:00',
        },
        recipients: data.recipients || [],
        startDate: new Date().toISOString(),
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create scheduled report');
    }
    return response.json();
  }

  static async updateScheduledReport(id: string, data: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    // Build the payload dynamically so we support partial updates (like toggling isActive)
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.type !== undefined) payload.frequency = data.type;
    if (data.recipients !== undefined) payload.recipients = data.recipients;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    
    // If we're updating details, we should supply a full config
    if (data.format !== undefined || data.programs !== undefined || data.schedule !== undefined || data.time !== undefined) {
      payload.config = {
        format: data.format,
        programs: data.programs,
        schedule: data.schedule,
        time: data.time
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reports/scheduled/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update scheduled report');
    }
    return response.json();
  }

  static async deleteScheduledReport(id: string): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reports/scheduled/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete scheduled report');
    }
  }

  static async downloadGeneratedReport(reportId: string, format: string, fileName: string): Promise<void> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reports/export/${reportId}?format=${format}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to download report');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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

  // User Preferences Settings
  static async getUserPreferences(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings/preferences`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch user preferences');
    return response.json();
  }

  static async updateUserPreferences(preferences: any): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/settings/preferences`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
      body: JSON.stringify({ preferences }) 
    });
    if (!response.ok) throw new Error('Failed to update user preferences');
    return response.json();
  }

  // --- Student Notifications ---
  static async getStudentNotifications(): Promise<any[]> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/notifications`, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    if (!response.ok) throw new Error('Failed to fetch student notifications');
    return response.json();
  }

  static async markStudentNotificationAsRead(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/notifications/${id}/read`, { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  }

  static async markAllStudentNotificationsAsRead(): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/notifications/read-all`, { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
    return response.json();
  }

  static async deleteStudentNotification(id: string): Promise<any> {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/notifications/${id}`, { 
      method: 'DELETE', 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    if (!response.ok) throw new Error('Failed to delete notification');
    return response.json();
  }

  // --- Tags ---
  static async getTags(): Promise<any[]> {
    try {
      const data = await apiClient.get<any[]>('tags');
      return data;
    } catch {
      return [];
    }
  }

  static async createTag(tagData: any): Promise<any> {
    return await apiClient.post<any>('tags', tagData);
  }

  static async updateTag(id: string, tagData: any): Promise<any> {
    return await apiClient.put<any>(`tags/${id}`, tagData);
  }

  static async deleteTag(id: string): Promise<any> {
    return await apiClient.delete<any>(`tags/${id}`);
  }
}
