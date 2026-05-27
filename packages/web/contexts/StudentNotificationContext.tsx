"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "@/services/api";
import { useRouter } from "next/navigation";

// Models defined in shared folder but can type simply to maintain compilation integrity
export interface StudentNotification {
    id: string;
    userId: string;
    studentId?: string | null;
    mentorId?: string | null;
    type: string; // info, warning, error, success
    category: string; // student, mentor, session, report, outcome, etc.
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    actionUrl?: string | null;
    actionText?: string | null;
}

interface StudentNotificationContextType {
    notifications: StudentNotification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    handleNotificationClick: (notification: StudentNotification) => void;
    refreshNotifications: () => Promise<void>;
}

const StudentNotificationContext = createContext<StudentNotificationContextType | undefined>(undefined);

export function StudentNotificationProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Query for Student Notifications (polling every 5 seconds)
    const { data: notifications = [], isLoading: loading } = useQuery<StudentNotification[]>({
        queryKey: ["studentNotifications"],
        queryFn: async () => {
            try {
                return await ApiService.getStudentNotifications();
            } catch (error) {
                console.error("Failed to load student notifications:", error);
                return [];
            }
        },
        refetchInterval: 5000,
    });

    const refreshNotifications = async () => {
        await queryClient.invalidateQueries({ queryKey: ["studentNotifications"] });
    };

    const markReadMutation = useMutation({
        mutationFn: (id: string) => ApiService.markStudentNotificationAsRead(id),
        onSuccess: refreshNotifications
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => ApiService.markAllStudentNotificationsAsRead(),
        onSuccess: refreshNotifications
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ApiService.deleteStudentNotification(id),
        onSuccess: refreshNotifications
    });

    const markAsRead = async (id: string) => {
        await markReadMutation.mutateAsync(id);
    };

    const markAllAsRead = async () => {
        await markAllReadMutation.mutateAsync();
    };

    const deleteNotification = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    const handleNotificationClick = (notification: StudentNotification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        
        if (notification.actionUrl) {
            let finalUrl = notification.actionUrl;

            // Map generic entity URLs to corresponding student dashboard paths
            if (finalUrl.startsWith("/sessions")) {
                finalUrl = "/Student/dashboard";
            } else if (finalUrl.startsWith("/documents")) {
                finalUrl = "/Student/my-courses";
            } else if (finalUrl.startsWith("/outcomes")) {
                finalUrl = "/Student/my-stats";
            } else if (finalUrl.startsWith("/assignments") || finalUrl.startsWith("/progress")) {
                finalUrl = "/Student/progress/new";
            } else if (finalUrl.startsWith("/profile")) {
                finalUrl = "/Student/my-profile";
            } else if (!finalUrl.startsWith("/Student/")) {
                // Ensure student route namespace prefix
                finalUrl = `/Student${finalUrl.startsWith("/") ? "" : "/"}${finalUrl}`;
            }

            router.push(finalUrl);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const value = {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        handleNotificationClick,
        refreshNotifications,
    };

    return (
        <StudentNotificationContext.Provider value={value}>
            {children}
        </StudentNotificationContext.Provider>
    );
}

export const useStudentNotifications = () => {
    const context = useContext(StudentNotificationContext);
    if (!context) {
        throw new Error("useStudentNotifications must be used within a StudentNotificationProvider");
    }
    return context;
};
