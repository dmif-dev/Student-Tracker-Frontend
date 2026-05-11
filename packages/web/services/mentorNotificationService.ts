// packages/web/services/mentorNotificationService.ts

import { Notification, Alert, NotificationCategory } from '@student-tracker/shared/models/Notification';
import { apiClient } from '../utils/apiClient';

export class MentorNotificationService {
  private static notifications: Notification[] = [];
  private static alerts: Alert[] = [];
  private static listeners: (() => void)[] = [];

  // Dynamic service connected to backend

  // Subscribe to changes
  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  static async getNotifications(mentorId: string): Promise<Notification[]> {
    try {
      const data = await apiClient.get<Notification[]>('mentor/notifications');
      this.notifications = data;
      return data;
    } catch (error) {
      console.error('Failed to get notifications', error);
      return [];
    }
  }

  static async getAlerts(): Promise<Alert[]> {
    try {
      const data = await apiClient.get<Alert[]>('mentor/alerts');
      this.alerts = data;
      return data;
    } catch (error) {
      console.error('Failed to get alerts', error);
      return [];
    }
  }

  static async generateMentorAlerts(mentorId: string): Promise<Alert[]> {
    // The backend now generates these dynamically
    return this.getAlerts();
  }

  static async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.put(`mentor/notifications/${id}/read`, {});
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  }

  static async markAllAsRead(mentorId: string): Promise<void> {
    try {
      await apiClient.put('mentor/notifications/read-all', {});
      this.notifications.forEach(n => n.isRead = true);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  }

  static async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`mentor/notifications/${id}`);
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  }

  static async dismissAlert(id: string): Promise<void> {
    // Currently alerts are dynamic so dismissing them might just be a frontend state unless we save dismissed state
    // For now we'll just remove it from the local array
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.notifyListeners();
  }

  static async getUnreadCount(mentorId: string): Promise<number> {
    return this.notifications.filter(n => !n.isRead).length;
  }

  static async addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    // Usually added by backend, but if needed locally:
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...notification,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.unshift(newNotification);
    this.notifyListeners();
    return newNotification;
  }
}