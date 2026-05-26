"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, X, AlertTriangle, Info, CheckCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStudentNotifications, StudentNotification } from "@/contexts/StudentNotificationContext";
import { formatDistanceToNow } from "date-fns";

export default function StudentNotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
        loading
    } = useStudentNotifications();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getNotificationIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case "success":
                return <CheckCircle size={18} className="text-green-500" />;
            case "warning":
                return <AlertTriangle size={18} className="text-yellow-500" />;
            case "error":
                return <AlertTriangle size={18} className="text-red-500" />;
            default:
                return <Info size={18} className="text-orange-500" />;
        }
    };

    // Filter unread or latest 5 notifications to show in the quick dropdown
    const latestNotifications = notifications.slice(0, 5);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative text-gray-700"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden z-50 animate-in fade-in-50 duration-100">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200/50 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                                        {unreadCount} New
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => {
                                        markAllAsRead();
                                    }}
                                    className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
                                >
                                    <Check size={14} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Dropdown List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                            {latestNotifications.length === 0 ? (
                                <div className="text-center py-10">
                                    <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-xs text-gray-500 font-medium">No notifications yet</p>
                                </div>
                            ) : (
                                latestNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => {
                                            handleNotificationClick(notification);
                                            setIsOpen(false);
                                        }}
                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-start space-x-3 ${
                                            !notification.isRead ? "bg-orange-50/20" : ""
                                        }`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <p className="text-xs font-bold text-gray-900 truncate">
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification.id);
                                                        }}
                                                        className="p-0.5 text-gray-400 hover:text-orange-600 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                                {notification.actionUrl && (
                                                    <span className="text-[10px] text-orange-600 font-bold flex items-center gap-0.5">
                                                        View Details
                                                        <ExternalLink size={10} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    router.push("/Student/notifications");
                                    setIsOpen(false);
                                }}
                                className="text-xs text-orange-600 hover:text-orange-700 font-bold w-full text-center transition-colors block"
                            >
                                View all notifications
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
