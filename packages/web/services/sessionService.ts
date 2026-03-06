// packages/web/services/sessionService.ts

import { Session, SessionNote } from '@student-tracker/shared/models/Session';

class SessionServiceClass {
  private sessions: Session[] = [];
  private notes: SessionNote[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock sessions will be loaded from API
    // Notes will be stored separately
    const now = new Date();
    this.sessions = [
      {
        id: 's1',
        studentId: '1',
        studentName: 'John Doe',
        studentProgram: 'G-GMP',
        studentTrack: 'Patent Track',
        date: new Date(now.setDate(now.getDate() + 2)).toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        status: 'scheduled',
        topic: 'Patent Drafting Review',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        notes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more mock sessions as needed
    ];
  }

  // Add notes to a completed session
  async addSessionNotes(
    sessionId: string,
    noteData: {
      content: string;
      topics: string[];
      duration?: number;
      feedback?: string;
      nextSteps?: string;
      resources?: string[];
    },
    mentorId: string
  ): Promise<SessionNote> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newNote: SessionNote = {
      id: `note${Date.now()}`,
      sessionId,
      ...noteData,
      createdBy: mentorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notes.push(newNote);
    
    // Update session status to completed if not already
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'completed';
      session.updatedAt = new Date().toISOString();
      if (!session.notes) session.notes = [];
      session.notes.push(newNote);
    }

    return newNote;
  }

  // Get notes for a session
  async getSessionNotes(sessionId: string): Promise<SessionNote[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.notes.filter(n => n.sessionId === sessionId);
  }

  // Update notes
  async updateSessionNotes(
    noteId: string,
    updates: Partial<SessionNote>
  ): Promise<SessionNote | undefined> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.notes.findIndex(n => n.id === noteId);
    if (index !== -1) {
      this.notes[index] = {
        ...this.notes[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return this.notes[index];
    }
    return undefined;
  }

  // Get all sessions for a student
  async getStudentSessions(studentId: string): Promise<Session[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.sessions.filter(s => s.studentId === studentId);
  }

  // Get all sessions for a mentor
  async getMentorSessions(mentorId: string): Promise<Session[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, this would filter by mentor ID
    return this.sessions;
  }

  // Mark session as completed
  async completeSession(sessionId: string): Promise<Session | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'completed';
      session.updatedAt = new Date().toISOString();
    }
    return session;
  }
}

export const SessionService = new SessionServiceClass();