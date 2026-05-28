// packages/web/services/sessionService.ts

import { Session, SessionNote } from '@student-tracker/shared/models/Session';
import { apiClient } from '@/utils/apiClient';

class SessionServiceClass {
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
    return await apiClient.post<SessionNote>(`sessions/${sessionId}/notes`, noteData);
  }

  // Get notes for a session
  async getSessionNotes(sessionId: string): Promise<SessionNote[]> {
    try {
      const data = await apiClient.get<any>(`sessions/${sessionId}/notes`);
      // API might return a single note object or array of notes based on backend setup.
      // Usually it's an array for historical notes.
      return Array.isArray(data) ? data : [data];
    } catch {
      return [];
    }
  }

  // Update notes
  async updateSessionNotes(
    noteId: string,
    updates: Partial<SessionNote>
  ): Promise<SessionNote | undefined> {
    try {
      // Assuming there is a notes specific update route or we update the session overall
      // The backend route is PUT /sessions/:id. If notes are embedded, we might need to hit that.
      // Or if there's a specific note endpoint. Using a generic put for now if backend supports it.
      return await apiClient.put<SessionNote>(`sessions/notes/${noteId}`, updates);
    } catch {
      return undefined;
    }
  }

  // Get all sessions for a student
  async getStudentSessions(studentId: string): Promise<Session[]> {
    try {
      return await apiClient.get<Session[]>(`sessions/student/${studentId}`);
    } catch {
      return [];
    }
  }

  // Get all sessions for a mentor
  async getMentorSessions(mentorId: string): Promise<Session[]> {
    try {
      return await apiClient.get<Session[]>(`sessions/mentor/${mentorId}`);
    } catch {
      return [];
    }
  }

  // Mark session as completed
  async completeSession(sessionId: string): Promise<Session | undefined> {
    try {
      return await apiClient.put<Session>(`sessions/${sessionId}`, { status: 'completed' });
    } catch {
      return undefined;
    }
  }
}

export const SessionService = new SessionServiceClass();