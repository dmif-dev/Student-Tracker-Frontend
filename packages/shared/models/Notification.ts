export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    link?: string;
}
