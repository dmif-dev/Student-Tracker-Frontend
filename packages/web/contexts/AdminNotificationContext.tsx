// packages/web/contexts/AdminNotificationContext.tsx

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { Notification, Alert } from '@student-tracker/shared/models/Notification';
import { useRouter } from 'next/navigation';

interface AdminNotificationContextType {
  notifications: Notification[];
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: any) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  handleNotificationClick: (notification: Notification) => void;
  refreshNotifications: () => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export function AdminNotificationProvider({ 
  children, 
  userId = 'admin' 
}: { 
  children: ReactNode; 
  userId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading: loadingNotifications } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: () => ApiService.getAdminNotifications(),
    refetchInterval: 5000,
  });

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ['adminAlerts'],
    queryFn: () => ApiService.getAdminAlerts(),
    refetchInterval: 5000,
  });

  const loading = loadingNotifications || loadingAlerts;

  const refreshNotifications = async () => {
    await queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
    await queryClient.invalidateQueries({ queryKey: ['adminAlerts'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => ApiService.createNotification(data),
    onSuccess: refreshNotifications
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => ApiService.markNotificationAsRead(id),
    onSuccess: refreshNotifications
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => ApiService.markAllNotificationsAsRead(),
    onSuccess: refreshNotifications
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteNotification(id),
    onSuccess: refreshNotifications
  });

  const dismissAlertMutation = useMutation({
    mutationFn: (id: string) => ApiService.dismissAlert(id),
    onSuccess: refreshNotifications
  });

  const addNotification = async (notification: any) => {
    await createMutation.mutateAsync(notification);
  };

  const markAsRead = async (id: string) => {
    await markReadMutation.mutateAsync(id);
  };

  const markAllAsRead = async () => {
    await markAllReadMutation.mutateAsync();
  };

  const deleteNotification = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const dismissAlert = async (id: string) => {
    await dismissAlertMutation.mutateAsync(id);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const value = {
    notifications,
    alerts,
    unreadCount,
    loading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dismissAlert,
    handleNotificationClick,
    refreshNotifications,
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within AdminNotificationProvider');
  }
  return context;
};