// packages/web/contexts/MentorNotificationContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Notification, Alert } from '@student-tracker/shared/models/Notification';
import { MentorNotificationService } from '@/services/mentorNotificationService';
import { useRouter } from 'next/navigation';

interface MentorNotificationContextType {
  notifications: Notification[];
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  handleNotificationClick: (notification: Notification) => void;
  refreshNotifications: () => Promise<void>;
}

const MentorNotificationContext = createContext<MentorNotificationContextType | undefined>(undefined);

export function MentorNotificationProvider({ 
  children, 
  mentorId 
}: { 
  children: ReactNode; 
  mentorId: string;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadNotifications = useCallback(async () => {
    try {
      const data = await MentorNotificationService.getNotifications(mentorId);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [mentorId]);

  const loadAlerts = useCallback(async () => {
    try {
      const existingAlerts = await MentorNotificationService.getAlerts();
      // Filter alerts relevant to mentors
      const mentorAlerts = existingAlerts.filter(alert => 
        alert.category === 'session' || alert.category === 'student' || alert.category === 'system' || alert.category === 'progress'
      );
      
      setAlerts(mentorAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [mentorId]);

  // Initial load
  useEffect(() => {
    Promise.all([loadNotifications(), loadAlerts()]);
  }, [loadNotifications, loadAlerts]);

  // Subscribe to service changes
  useEffect(() => {
    const unsubscribe = MentorNotificationService.subscribe(() => {
      loadNotifications();
      loadAlerts();
    });

    return () => {
      unsubscribe();
    };
  }, [loadNotifications, loadAlerts]);

  const refreshNotifications = useCallback(async () => {
    await Promise.all([loadNotifications(), loadAlerts()]);
  }, [loadNotifications, loadAlerts]);

  const markAsRead = async (id: string) => {
    await MentorNotificationService.markAsRead(id);
    await refreshNotifications();
  };

  const markAllAsRead = async () => {
    await MentorNotificationService.markAllAsRead(mentorId);
    await refreshNotifications();
  };

  const deleteNotification = async (id: string) => {
    await MentorNotificationService.deleteNotification(id);
    await refreshNotifications();
  };

  const dismissAlert = async (id: string) => {
    await MentorNotificationService.dismissAlert(id);
    await refreshNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Redirect to mentor-specific paths
    if (notification.actionUrl) {
      let finalUrl = notification.actionUrl;
      
      // Map generic entity URLs to the correct mentor dashboard pages
      if (finalUrl.startsWith('/sessions')) {
        finalUrl = '/mentor/schedule';
      } else if (finalUrl.startsWith('/documents')) {
        finalUrl = '/mentor/documents';
      } else if (finalUrl.startsWith('/outcomes')) {
        finalUrl = '/mentor/outcomes';
      } else if (finalUrl.startsWith('/assignments') || finalUrl.startsWith('/progress')) {
        finalUrl = '/mentor/students';
      } else if (finalUrl.startsWith('/admin/')) {
        finalUrl = finalUrl.replace('/admin/', '/mentor/');
      } else if (!finalUrl.startsWith('/mentor/')) {
        // Fallback: prepend /mentor/ to any other relative paths like /students/[id]
        finalUrl = `/mentor${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
      }

      router.push(finalUrl);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    notifications,
    alerts,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dismissAlert,
    handleNotificationClick,
    refreshNotifications,
  };

  return (
    <MentorNotificationContext.Provider value={value}>
      {children}
    </MentorNotificationContext.Provider>
  );
}

export const useMentorNotifications = () => {
  const context = useContext(MentorNotificationContext);
  if (!context) {
    throw new Error('useMentorNotifications must be used within MentorNotificationProvider');
  }
  return context;
};