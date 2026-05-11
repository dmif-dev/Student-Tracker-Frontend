import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../utils/apiClient';
import { mapMentor, mapStudent, mapDocument } from '../../utils/dataMappers';
import { Mentor, Student, MentorSchedule } from '../../services/mockData';

export const useCurrentMentor = () => {
  return useQuery<Mentor>({
    queryKey: ['currentMentor'],
    queryFn: async () => {
      // Assuming the backend has an endpoint for the logged-in user profile
      const data = await apiClient.get<any>('mentor/profile');
      
      // We will map it assuming the data has a mentor object
      // If it's directly the mentor object, use data.
      const mentorData = data.mentor || data;
      return mapMentor(mentorData);
    },
  });
};

export const useMentorStudents = (mentorId?: string) => {
  return useQuery<Student[]>({
    queryKey: ['mentorStudents', mentorId],
    queryFn: async () => {
      // Assuming GET /mentor/students fetches students for the current logged-in mentor
      const data = await apiClient.get<any[]>('mentor/students');
      return data.map(mapStudent);
    },
    enabled: !!mentorId, // Only run if mentorId is available (if we're relying on it)
  });
};

export const useMentorSchedule = (mentorId?: string) => {
  return useQuery<any[]>({
    queryKey: ['mentorSchedule', mentorId],
    queryFn: async () => {
      // Fetch mentor's schedule/sessions
      const data = await apiClient.get<any[]>('mentor/sessions');
      // Simple mapping for sessions
      return data.map((session: any) => ({
        id: session.id,
        studentId: session.student?.id || session.studentId,
        studentName: session.student?.name || 'Unknown Student',
        studentProgram: session.student?.programId || 'G-GMP',
        studentTrack: session.student?.track?.name || session.student?.trackId || '',
        date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status?.toLowerCase() || 'scheduled',
        topic: session.topic,
        meetingLink: session.meetingLink,
        notes: session.notes || [],
        createdAt: session.createdAt || new Date().toISOString(),
        updatedAt: session.updatedAt || new Date().toISOString(),
      }));
    },
  });
};

export const useMentorDashboardStats = () => {
  return useQuery({
    queryKey: ['mentorDashboardStats'],
    queryFn: async () => {
      const data = await apiClient.get<any>('dashboard/mentor');
      return data;
    },
  });
};

export const useMentorDocuments = () => {
  return useQuery({
    queryKey: ['mentorDocuments'],
    queryFn: async () => {
      const data = await apiClient.get<any[]>('mentor/documents');
      return data.map(mapDocument);
    },
  });
};

