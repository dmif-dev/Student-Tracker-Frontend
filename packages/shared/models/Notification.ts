// export type NotificationType = 'info' | 'warning' | 'error' | 'success';

// export interface Notification {
//     id: string;
//     userId: string;
//     type: NotificationType;
//     title: string;
//     message: string;
//     isRead: boolean;
//     createdAt: Date;
//     link?: string;
// }

// packages/shared/models/Notification.ts

// packages/shared/models/Notification.ts

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationCategory = 
  | 'student' 
  | 'mentor' 
  | 'session' 
  | 'report' 
  | 'system' 
  | 'alert'
  | 'outcome'   // Added outcome category
  | 'progress'  // Added progress category
  | 'achievement'; // Added achievement category

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  link?: string; // For redirect
  actionUrl?: string; // Where to redirect when clicked
  actionText?: string; // e.g., "View Student", "Reschedule"
  metadata?: {
    entityId?: string; // Student ID, Mentor ID, etc.
    entityType?: string;
    priority?: 'high' | 'medium' | 'low';
  };
}

// Add Alert interface for system alerts
export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  category: 'student' | 'mentor' | 'session' | 'system' | 'outcome' | 'progress';
  action?: {
    url: string;
    text: string;
  };
  dismissed?: boolean;
  expiresAt?: Date;
}