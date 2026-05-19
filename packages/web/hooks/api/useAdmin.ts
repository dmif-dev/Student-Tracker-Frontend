import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../utils/apiClient';
import { mapMentor, mapStudent } from '../../utils/dataMappers';
import { Student, Mentor } from '../../services/mockData';

export const adminKeys = {
  all: ['admin'] as const,
  dashboardStats: () => [...adminKeys.all, 'dashboardStats'] as const,
  systemActivities: () => [...adminKeys.all, 'systemActivities'] as const,
  students: () => [...adminKeys.all, 'students'] as const,
  student: (id: string) => [...adminKeys.students(), id] as const,
  mentors: () => [...adminKeys.all, 'mentors'] as const,
  mentor: (id: string) => [...adminKeys.mentors(), id] as const,
  outcomes: () => [...adminKeys.all, 'outcomes'] as const,
  profile: () => [...adminKeys.all, 'profile'] as const,
};

// Dashboard
export const useAdminDashboardStats = (dateRange?: string, program?: string) => {
  return useQuery({
    queryKey: [...adminKeys.dashboardStats(), { dateRange, program }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange) params.append('dateRange', dateRange);
      if (program) params.append('program', program);
      
      const qs = params.toString();
      const data = await apiClient.get<any>(`dashboard/admin${qs ? `?${qs}` : ''}`);
      return data;
    },
  });
};

export const useSystemActivities = (limit?: number) => {
  return useQuery({
    queryKey: [...adminKeys.systemActivities(), limit],
    queryFn: async () => {
      const response = await apiClient.get<any>(`activities/system${limit ? `?limit=${limit}` : ''}`);
      const data = response.data || response;
      return Array.isArray(data) ? data : [];
    },
  });
};

export const useAdminOutcomes = (studentId?: string) => {
  return useQuery({
    queryKey: [...adminKeys.outcomes(), { studentId }],
    queryFn: async () => {
      const qs = studentId ? `?studentId=${studentId}` : '';
      const data = await apiClient.get<any[]>(`outcomes${qs}`);
      return data;
    },
  });
};

// Students
export const useAdminStudents = () => {
  return useQuery<Student[]>({
    queryKey: adminKeys.students(),
    queryFn: async () => {
      const data = await apiClient.get<any[]>('students');
      return data.map(mapStudent);
    },
  });
};

export const useAdminStudent = (id: string) => {
  return useQuery<Student>({
    queryKey: adminKeys.student(id),
    queryFn: async () => {
      const data = await apiClient.get<any>(`students/${id}`);
      return mapStudent(data);
    },
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Student>) => apiClient.post<any>('students', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) =>
      apiClient.put<any>(`students/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
      queryClient.invalidateQueries({ queryKey: adminKeys.student(variables.id) });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`students/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
      queryClient.removeQueries({ queryKey: adminKeys.student(id) });
    },
  });
};

// Mentors
export const useAdminMentors = () => {
  return useQuery<Mentor[]>({
    queryKey: adminKeys.mentors(),
    queryFn: async () => {
      const data = await apiClient.get<any[]>('mentors');
      return data.map(mapMentor);
    },
  });
};

export const useAdminMentor = (id: string) => {
  return useQuery<Mentor>({
    queryKey: adminKeys.mentor(id),
    queryFn: async () => {
      const data = await apiClient.get<any>(`mentors/${id}`);
      return mapMentor(data);
    },
    enabled: !!id,
  });
};

export const useCreateMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Mentor>) => apiClient.post<any>('mentors', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.mentors() });
    },
  });
};

export const useUpdateMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Mentor> }) =>
      apiClient.put<any>(`mentors/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.mentors() });
      queryClient.invalidateQueries({ queryKey: adminKeys.mentor(variables.id) });
    },
  });
};

export const useDeleteMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<any>(`mentors/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.mentors() });
      queryClient.removeQueries({ queryKey: adminKeys.mentor(id) });
    },
  });
};

export const useAdminMentorPerformance = (id: string, period: string = 'year') => {
  return useQuery({
    queryKey: [...adminKeys.mentor(id), 'performance', period],
    queryFn: async () => {
      const data = await apiClient.get<any>(`mentors/${id}/performance?period=${period}`);
      return data;
    },
    enabled: !!id,
  });
};

// Admin Profile Hooks
export const useAdminProfile = () => {
  return useQuery({
    queryKey: adminKeys.profile(),
    queryFn: async () => {
      const data = await apiClient.get<any>('auth/me');
      return data;
    },
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => {
      return apiClient.put<any>('settings/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.profile() });
    },
  });
};
