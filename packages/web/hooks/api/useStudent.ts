import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';
import { createClient } from '@/utils/supabase/client';

// Profile Hook
export const useStudentProfile = () => {
  return useQuery({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const response = await apiClient.get<any>('student/profile');
      return response;
    },
  });
};

// Progress Hooks
export const useSubmitProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (progressData: any) => {
      const response = await apiClient.post<any>('progress', progressData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentStats'] });
      queryClient.invalidateQueries({ queryKey: ['studentProgress'] });
      queryClient.invalidateQueries({ queryKey: ['studentTrends'] });
      queryClient.invalidateQueries({ queryKey: ['studentProgressHistory'] });
    },
  });
};

export const useUploadEvidence = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      // Do NOT manually set Content-Type here.
      // The browser must set it automatically so it includes the
      // multipart boundary (e.g. "multipart/form-data; boundary=----...").
      // If we set it manually, the boundary is missing and multer on the
      // backend cannot parse the file — causing a 400 "No file uploaded" error.
      const response = await apiClient.post<any>('progress/upload', formData);
      return response;
    },
  });
};

// Stats and Trends
export const useStudentStats = (studentId?: string) => {
  return useQuery({
    queryKey: ['studentStats', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const response = await apiClient.get<any>(`progress/stats/${studentId}`);
      return response;
    },
    enabled: !!studentId,
  });
};

export const useStudentTrends = (studentId?: string) => {
  return useQuery({
    queryKey: ['studentTrends', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const response = await apiClient.get<any>(`progress/trends/${studentId}`);
      return response;
    },
    enabled: !!studentId,
  });
};

// Outcomes Summary
export const useStudentOutcomes = (studentId?: string) => {
  return useQuery({
    queryKey: ['studentOutcomes', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const response = await apiClient.get<any>(`outcomes/student/${studentId}/summary`);
      return response;
    },
    enabled: !!studentId,
  });
};

export const useStudentProgressHistory = (studentId?: string) => {
  return useQuery({
    queryKey: ['studentProgressHistory', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const response = await apiClient.get<any>(`progress/student/${studentId}?limit=365`);
      return response;
    },
    enabled: !!studentId,
  });
};

export const useStudentSessions = (studentId?: string) => {
  return useQuery({
    queryKey: ['studentSessions', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const response = await apiClient.get<any[]>(`sessions/student/${studentId}`);
      return response;
    },
    enabled: !!studentId,
  });
};

export const useStudentSessionsHistory = () => {
  return useQuery({
    queryKey: ['studentSessionsHistory'],
    queryFn: async () => {
      const response = await apiClient.get<any>('sessions/history');
      return response;
    },
  });
};

export const useStudentDocuments = (program?: string, track?: string) => {
  return useQuery({
    queryKey: ['studentDocuments', program, track],
    queryFn: async () => {
      let url = 'documents';
      const params = new URLSearchParams();
      if (program) params.append('program', program);
      if (track) params.append('track', track);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await apiClient.get<any[]>(url);
      return response;
    }
  });
};

/**
 * Self-contained composite hook for the Student Dashboard.
 * Fetches the student profile first, then derives the studentId to conditionally
 * fetch stats, progress history, sessions, and documents.
 * Sets up Supabase real-time subscriptions on progress_entries and sessions tables
 * and automatically invalidates the relevant React Query caches when data changes.
 */
export const useStudentDashboard = () => {
  const queryClient = useQueryClient();

  // Step 1: fetch the profile (no args needed – uses auth session)
  const profileQuery = useStudentProfile();
  // IMPORTANT: The backend /student/profile response maps:
  //   profile.id         = student.registrationNumber (e.g. "DMIF2026ABC")
  //   profile.studentId  = student.id (the actual Prisma DB UUID)
  // We must use profile.studentId for all DB queries.
  const studentId: string | undefined = profileQuery.data?.studentId;

  // Step 2: conditionally fetch everything that depends on studentId
  const statsQuery = useStudentStats(studentId);
  const progressQuery = useStudentProgressHistory(studentId);
  const sessionsQuery = useStudentSessions(studentId);
  const documentsQuery = useStudentDocuments();

  // Step 3: Supabase real-time subscriptions
  useEffect(() => {
    if (!studentId) return;

    const supabase = createClient();

    // Listen for changes in progress_entries for this student
    const progressChannel = supabase
      .channel(`student-progress-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress_entries',
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['studentStats', studentId] });
          queryClient.invalidateQueries({ queryKey: ['studentProgressHistory', studentId] });
          queryClient.invalidateQueries({ queryKey: ['studentTrends', studentId] });
        }
      )
      .subscribe();

    // Listen for changes in sessions for this student
    const sessionsChannel = supabase
      .channel(`student-sessions-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['studentSessions', studentId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, [studentId, queryClient]);

  const isLoading =
    profileQuery.isLoading ||
    (!!studentId && (statsQuery.isLoading || progressQuery.isLoading || sessionsQuery.isLoading)) ||
    documentsQuery.isLoading;

  return {
    profile: profileQuery.data,
    studentId,
    stats: statsQuery.data,
    progressHistory: progressQuery.data,
    sessions: sessionsQuery.data ?? [],
    documents: documentsQuery.data ?? [],
    isLoading,
  };
};
