// packages/shared/services/NotificationService.ts

import { Notification, Alert, NotificationCategory, NotificationType } from '../models/Notification';

export class NotificationService {
  private static notifications: Notification[] = [];
  private static alerts: Alert[] = [];
  private static listeners: (() => void)[] = [];

  // Initialize with mock data (this runs when the class is loaded)
  static {
    // Add sample notifications
    NotificationService.notifications = [
      {
        id: '1',
        userId: 'admin',
        type: 'info',
        category: 'student',
        title: 'New Student Registered',
        message: 'John Doe has registered for G-GMP Patent Track',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        actionUrl: '/admin/students/1',
        actionText: 'View Student',
        metadata: {
          entityId: '1',
          entityType: 'student',
        },
      },
      {
        id: '2',
        userId: 'admin',
        type: 'success',
        category: 'outcome',
        title: 'Patent Filed',
        message: 'Sarah Wilson filed a provisional patent for AI invention',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        actionUrl: '/admin/outcomes/3',
        actionText: 'View Outcome',
        metadata: {
          entityId: '3',
          entityType: 'outcome',
        },
      },
      {
        id: '3',
        userId: 'admin',
        type: 'warning',
        category: 'session',
        title: 'Session Needs Rescheduling',
        message: 'Mike Johnson\'s session with Dr. Williams needs rescheduling',
        isRead: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        actionUrl: '/admin/mentors/3/schedule',
        actionText: 'View Schedule',
        metadata: {
          entityId: '3',
          entityType: 'session',
          priority: 'high',
        },
      },
      {
        id: '4',
        userId: 'admin',
        type: 'info',
        category: 'report',
        title: 'Weekly Report Ready',
        message: 'Week 12 report has been generated',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        actionUrl: '/admin/reports/weekly/12',
        actionText: 'View Report',
      },
      {
        id: '5',
        userId: 'admin',
        type: 'success',
        category: 'mentor',
        title: 'Mentor Session Completed',
        message: 'Dr. Smith completed session with Alex Chen',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        actionUrl: '/admin/mentors/1',
        actionText: 'View Mentor',
      },
      {
        id: '6',
        userId: 'admin',
        type: 'success',
        category: 'achievement',
        title: 'Milestone Achieved',
        message: 'John Doe completed 10 mentor sessions',
        isRead: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        actionUrl: '/admin/students/1',
        actionText: 'View Student',
      },
      {
        id: '7',
        userId: 'admin',
        type: 'info',
        category: 'progress',
        title: 'Progress Update',
        message: '5 students submitted weekly progress',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        actionUrl: '/admin/students?filter=recent',
        actionText: 'View Submissions',
      },
    ];

    // Add sample alerts
    NotificationService.alerts = [
      {
        id: 'alert1',
        type: 'warning',
        title: 'Inactive Students',
        message: '5 students haven\'t submitted progress in 7 days',
        category: 'student',
        action: {
          url: '/admin/students?filter=inactive',
          text: 'View Students',
        },
        dismissed: false,
      },
      {
        id: 'alert2',
        type: 'error',
        title: 'Sessions Need Rescheduling',
        message: '3 mentor sessions need rescheduling',
        category: 'session',
        action: {
          url: '/admin/mentors?filter=pending-sessions',
          text: 'View Sessions',
        },
        dismissed: false,
      },
      {
        id: 'alert3',
        type: 'info',
        title: 'Upcoming Deadlines',
        message: '8 submissions due this week',
        category: 'system',
        action: {
          url: '/admin/reports',
          text: 'View Deadlines',
        },
        dismissed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        id: 'alert4',
        type: 'success',
        title: 'Outcome Milestone',
        message: '10 patents filed this month!',
        category: 'outcome',
        action: {
          url: '/admin/outcomes?filter=patent',
          text: 'View Patents',
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

  // Notifications
  static async getNotifications(userId: string): Promise<Notification[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.notifications.filter(n => n.userId === userId);
  }

  static async getNotificationById(id: string): Promise<Notification | undefined> {
    return this.notifications.find(n => n.id === id);
  }

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

  static async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      this.notifyListeners();
    }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    this.notifications
      .filter(n => n.userId === userId)
      .forEach(n => n.isRead = true);
    this.notifyListeners();
  }

  static async deleteNotification(id: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  static async deleteAllNotifications(userId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.userId !== userId);
    this.notifyListeners();
  }

  // Alerts
  static async getAlerts(): Promise<Alert[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter out expired alerts
    const now = new Date();
    return this.alerts.filter(a => 
      !a.dismissed && 
      (!a.expiresAt || new Date(a.expiresAt) > now)
    );
  }

  static async getAlertById(id: string): Promise<Alert | undefined> {
    return this.alerts.find(a => a.id === id);
  }

  static async addAlert(alert: Omit<Alert, 'id' | 'dismissed'>): Promise<Alert> {
    const newAlert: Alert = {
      id: Date.now().toString(),
      ...alert,
      dismissed: false,
    };
    this.alerts.push(newAlert);
    this.notifyListeners();
    return newAlert;
  }

  static async dismissAlert(id: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.dismissed = true;
      this.notifyListeners();
    }
  }

  static async dismissAllAlerts(): Promise<void> {
    this.alerts.forEach(alert => alert.dismissed = true);
    this.notifyListeners();
  }

  // Get unread count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }

  // Generate system alerts from data (mock implementation)
  static async generateSystemAlerts(): Promise<Alert[]> {
    // In a real app, this would check your database
    // For now, return non-dismissed alerts
    return this.alerts.filter(a => !a.dismissed);
  }

  // Get recent notifications with limit
  static async getRecentNotifications(userId: string, limit: number = 10): Promise<Notification[]> {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Get notifications by category
  static async getNotificationsByCategory(userId: string, category: NotificationCategory): Promise<Notification[]> {
    return this.notifications.filter(n => n.userId === userId && n.category === category);
  }

  // Get notifications by type
  static async getNotificationsByType(userId: string, type: NotificationType): Promise<Notification[]> {
    return this.notifications.filter(n => n.userId === userId && n.type === type);
  }
}