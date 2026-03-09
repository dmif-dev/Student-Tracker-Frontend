// packages/web/services/mentorNotificationService.ts

import { Notification, Alert, NotificationCategory } from '@student-tracker/shared/models/Notification';

export class MentorNotificationService {
  private static notifications: Notification[] = [];
  private static alerts: Alert[] = [];
  private static listeners: (() => void)[] = [];

  // Initialize with mentor-specific mock data
  static {
    // Add sample mentor notifications
    this.notifications = [
      {
        id: 'm1',
        userId: 'mentor1',
        type: 'info',
        category: 'student', // Changed from 'document' to 'student'
        title: 'New Student Assigned',
        message: 'Robert Kim has been assigned to you (G-CMP)',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        actionUrl: '/mentor/students/9',
        actionText: 'View Student',
        metadata: {
          entityId: '9',
          entityType: 'student',
        },
      },
      {
        id: 'm2',
        userId: 'mentor1',
        type: 'success',
        category: 'session',
        title: 'Session Completed',
        message: 'Session with John Doe completed. Add session notes.',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        actionUrl: '/mentor/schedule',
        actionText: 'Add Notes',
        metadata: {
          entityId: 's1',
          entityType: 'session',
        },
      },
      {
        id: 'm3',
        userId: 'mentor1',
        type: 'warning',
        category: 'session',
        title: 'Upcoming Session',
        message: 'Session with Jane Smith in 30 minutes',
        isRead: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        actionUrl: '/mentor/schedule',
        actionText: 'Join Session',
        metadata: {
          entityId: 's2',
          entityType: 'session',
        },
      },
      {
        id: 'm4',
        userId: 'mentor1',
        type: 'info',
        category: 'progress', // Changed from 'document' to 'progress'
        title: 'Document Uploaded',
        message: 'You uploaded "G-CMP Module 2: Advanced AI"',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        actionUrl: '/mentor/documents',
        actionText: 'View Document',
        metadata: {
          entityId: 'doc123',
          entityType: 'document',
        },
      },
      {
        id: 'm5',
        userId: 'mentor1',
        type: 'success',
        category: 'progress', // Changed from 'document' to 'progress'
        title: 'Student Progress',
        message: 'Alex Chen completed 75% of Patent Track',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        actionUrl: '/mentor/students/5',
        actionText: 'View Progress',
      },
    ];

    // Add mentor-specific alerts
    this.alerts = [
      {
        id: 'malert1',
        type: 'warning',
        title: 'Upcoming Sessions',
        message: 'You have 3 sessions scheduled for tomorrow',
        category: 'session',
        action: {
          url: '/mentor/schedule',
          text: 'View Schedule',
        },
        dismissed: false,
      },
      {
        id: 'malert2',
        type: 'info',
        title: 'Pending Session Notes',
        message: '2 sessions waiting for notes',
        category: 'session',
        action: {
          url: '/mentor/schedule?filter=pending-notes',
          text: 'Add Notes',
        },
        dismissed: false,
      },
      {
        id: 'malert3',
        type: 'success',
        title: 'Student Milestone',
        message: '3 students reached 50% progress this week',
        category: 'progress', // Changed from 'student' to 'progress'
        action: {
          url: '/mentor/students',
          text: 'View Students',
        },
        dismissed: false,
      },
    ];
  }

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

  // Get notifications for a specific mentor
  static async getNotifications(mentorId: string): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, this would filter by mentorId
    return this.notifications.filter(n => n.userId === mentorId);
  }

  // Get mentor-specific alerts
  static async getAlerts(): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.alerts.filter(a => !a.dismissed);
  }

  // Generate mentor-specific system alerts
  static async generateMentorAlerts(mentorId: string): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real app, this would check the mentor's actual data
    // For now, return existing mentor alerts
    return this.alerts.filter(a => !a.dismissed);
  }

  static async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      this.notifyListeners();
    }
  }

  static async markAllAsRead(mentorId: string): Promise<void> {
    this.notifications
      .filter(n => n.userId === mentorId)
      .forEach(n => n.isRead = true);
    this.notifyListeners();
  }

  static async deleteNotification(id: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  static async dismissAlert(id: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.dismissed = true;
      this.notifyListeners();
    }
  }

  // Get unread count for a mentor
  static async getUnreadCount(mentorId: string): Promise<number> {
    return this.notifications.filter(n => n.userId === mentorId && !n.isRead).length;
  }

  // Add a new notification (e.g., when session is scheduled)
  static async addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
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