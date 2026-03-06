// packages/web/contexts/AdminNotificationContext.tsx

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Notification, Alert } from '@student-tracker/shared/models/Notification';
import { NotificationService } from '@student-tracker/shared/services/NotificationService';
import { useRouter } from 'next/navigation';

interface AdminNotificationContextType {
  notifications: Notification[];
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadNotifications = useCallback(async () => {
    try {
      const data = await NotificationService.getNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [userId]);

  const loadAlerts = useCallback(async () => {
    try {
      const systemAlerts = await NotificationService.generateSystemAlerts();
      const existingAlerts = await NotificationService.getAlerts();
      // Merge and deduplicate alerts
      const allAlerts = [...systemAlerts, ...existingAlerts];
      const uniqueAlerts = Array.from(
        new Map(allAlerts.map(alert => [alert.id, alert])).values()
      );
      setAlerts(uniqueAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    Promise.all([loadNotifications(), loadAlerts()]);
  }, [loadNotifications, loadAlerts]);

  // Subscribe to service changes
  useEffect(() => {
    const unsubscribe = NotificationService.subscribe(() => {
      loadNotifications();
      loadAlerts();
    });

    return () => {
      unsubscribe();
    };
  }, [loadNotifications, loadAlerts]);

  // Refresh notifications manually
  const refreshNotifications = useCallback(async () => {
    await Promise.all([loadNotifications(), loadAlerts()]);
  }, [loadNotifications, loadAlerts]);

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    await NotificationService.addNotification({ ...notification, userId });
    await refreshNotifications();
  };

  const markAsRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    await refreshNotifications();
  };

  const markAllAsRead = async () => {
    await NotificationService.markAllAsRead(userId);
    await refreshNotifications();
  };

  const deleteNotification = async (id: string) => {
    await NotificationService.deleteNotification(id);
    await refreshNotifications();
  };

  const dismissAlert = async (id: string) => {
    await NotificationService.dismissAlert(id);
    await refreshNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Redirect if action URL exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};