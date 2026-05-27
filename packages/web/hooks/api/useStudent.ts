import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';

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
      // The backend expects specific format for progress
      const response = await apiClient.post<any>('progress', progressData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentStats'] });
      queryClient.invalidateQueries({ queryKey: ['studentProgress'] });
      queryClient.invalidateQueries({ queryKey: ['studentTrends'] });
    },
  });
};

export const useUploadEvidence = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // We must use fetch or axios with proper headers for multipart/form-data.
      // apiClient.post might assume JSON if not handled properly. Let's use the underlying fetch if possible, 
      // or we can just try passing formData.
      const response = await apiClient.post<any>('progress/upload', formData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });
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

export const useStudentSessionsHistory = () => {
  return useQuery({
    queryKey: ['studentSessionsHistory'],
    queryFn: async () => {
      const response = await apiClient.get<any>('sessions/history');
      return response;
    },
  });
};
