"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStudentNotifications, StudentNotification } from "@/contexts/StudentNotificationContext";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Bell,
    Check,
    X,
    AlertTriangle,
    Info,
    CheckCircle,
    Filter,
    Trash2,
    ExternalLink,
    Calendar,
    ChevronDown,
    Loader2
} from "lucide-react";

type FilterType = "all" | "unread" | "read";
type DateFilterType = "all" | "today" | "week" | "month";
type CategoryFilterType = "all" | "session" | "report" | "outcome" | "progress" | "achievement" | "system" | "assignment";

export default function StudentNotificationsPage() {
    const router = useRouter();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        handleNotificationClick,
        loading
    } = useStudentNotifications();

    // Filter states
    const [filter, setFilter] = useState<FilterType>("all");
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>("all");
    const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Apply filters to notifications
    const filteredNotifications = useMemo(() => {
        return notifications.filter(notification => {
            // Status filter
            if (filter === "unread" && notification.isRead) return false;
            if (filter === "read" && !notification.isRead) return false;

            // Category filter
            if (categoryFilter !== "all" && notification.category !== categoryFilter) return false;

            // Date filter
            if (dateFilter !== "all") {
                const now = new Date();
                const notifDate = new Date(notification.createdAt);
                const diffTime = Math.abs(now.getTime() - notifDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (dateFilter) {
                    case "today":
                        if (diffDays > 1) return false;
                        break;
                    case "week":
                        if (diffDays > 7) return false;
                        break;
                    case "month":
                        if (diffDays > 30) return false;
                        break;
                }
            }

            return true;
        });
    }, [notifications, filter, categoryFilter, dateFilter]);

    const getActiveFilterCount = () => {
        let count = 0;
        if (filter !== "all") count++;
        if (categoryFilter !== "all") count++;
        if (dateFilter !== "all") count++;
        return count;
    };

    const clearFilters = () => {
        setFilter("all");
        setCategoryFilter("all");
        setDateFilter("all");
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, categoryFilter, dateFilter]);

    const totalNotificationPages = Math.max(1, Math.ceil(filteredNotifications.length / itemsPerPage));

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalNotificationPages));
    }, [totalNotificationPages]);

    const paginatedNotifications = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredNotifications, currentPage]);

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            session: "Sessions",
            report: "Reports",
            outcome: "Outcomes",
            progress: "Progress",
            achievement: "Achievements",
            system: "System",
            assignment: "Assignments",
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            session: "bg-purple-100 text-purple-700",
            report: "bg-yellow-100 text-yellow-700",
            outcome: "bg-indigo-100 text-indigo-700",
            progress: "bg-orange-100 text-orange-700",
            achievement: "bg-pink-100 text-pink-700",
            system: "bg-gray-100 text-gray-700",
            assignment: "bg-blue-100 text-blue-700",
        };
        return colors[category] || "bg-gray-100 text-gray-700";
    };

    const getNotificationIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />;
            case "warning":
                return <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />;
            case "error":
                return <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />;
            default:
                return <Info className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />;
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-gray-500 font-medium">Loading notifications...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Notifications</h1>
                    <p className="text-gray-600 mt-2">View and manage your application updates, mentor notes, and milestone reports.</p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        onClick={markAllAsRead}
                        variant="outline"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50 font-bold gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Filters Section */}
            <Card className="rounded-2xl border-gray-200/50 shadow-sm overflow-hidden">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                                className={`font-bold gap-2 ${
                                    showFilters || getActiveFilterCount() > 0
                                        ? "bg-orange-50 border-orange-300 text-orange-600"
                                        : "border-gray-200"
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                {getActiveFilterCount() > 0 && (
                                    <Badge className="bg-orange-500 text-white ml-1">
                                        {getActiveFilterCount()}
                                    </Badge>
                                )}
                            </Button>

                            {getActiveFilterCount() > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-gray-500 hover:text-gray-700"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>

                        <div className="text-xs font-bold text-gray-500">
                            Showing {filteredNotifications.length} of {notifications.length} notifications
                        </div>
                    </div>

                    {/* Expanded Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Status</label>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as FilterType)}
                                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
                                >
                                    <option value="all">All Notifications</option>
                                    <option value="unread">Unread ({unreadCount})</option>
                                    <option value="read">Read</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value as CategoryFilterType)}
                                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="session">Sessions & Meetings</option>
                                    <option value="report">Weekly Reports</option>
                                    <option value="outcome">Innovation Outcomes</option>
                                    <option value="progress">Daily Logs & Progress</option>
                                    <option value="achievement">Achievements</option>
                                    <option value="assignment">Assignments & Submissions</option>
                                    <option value="system">System Updates</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Date Range</label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
                                    className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">Last 7 Days</option>
                                    <option value="month">Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notifications Main Panel */}
            <Card className="rounded-2xl border-gray-200/50 shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="bg-gray-50/50 border-b border-gray-200/50 flex flex-row items-center justify-between py-4">
                    <CardTitle className="text-lg font-bold text-gray-900">Notification Panel</CardTitle>
                    {filteredNotifications.length > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1"
                        >
                            <Check className="w-3.5 h-3.5" />
                            Mark all read
                        </button>
                    )}
                </CardHeader>

                <CardContent className="p-0 divide-y divide-gray-100 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-1">All caught up!</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                {getActiveFilterCount() > 0
                                    ? "No notifications match your active filters. Try adjusting them."
                                    : "You do not have any notifications at the moment."}
                            </p>
                            {getActiveFilterCount() > 0 && (
                                <Button
                                    onClick={clearFilters}
                                    variant="outline"
                                    className="mt-4 border-orange-200 text-orange-600 font-bold"
                                >
                                    Reset Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-100">
                                {paginatedNotifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-6 py-5 hover:bg-gray-50/50 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                                            !notification.isRead ? "bg-orange-50/10" : ""
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                                            {getNotificationIcon(notification.type)}
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center flex-wrap gap-2">
                                                    <h4 className="font-bold text-gray-900 text-sm">{notification.title}</h4>
                                                    {!notification.isRead && (
                                                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[9px] px-1.5 py-0.5">
                                                            New
                                                        </Badge>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryColor(notification.category)}`}>
                                                        {getCategoryLabel(notification.category)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-3xl">{notification.message}</p>
                                                <div className="flex items-center gap-4 mt-2.5">
                                                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                    </span>
                                                    {notification.actionUrl && (
                                                        <span className="text-[10px] text-orange-600 font-extrabold flex items-center gap-0.5">
                                                            View Page
                                                            <ExternalLink className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                            {!notification.isRead && (
                                                <Button
                                                    onClick={() => markAsRead(notification.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-gray-100 text-gray-500 hover:text-orange-600"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => deleteNotification(notification.id)}
                                                variant="ghost"
                                                size="icon"
                                                className="hover:bg-gray-100 text-red-400 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination bar */}
                            {filteredNotifications.length > itemsPerPage && (
                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                    <p className="text-xs font-bold text-gray-500">
                                        Page {currentPage} of {totalNotificationPages}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                            disabled={currentPage === 1}
                                            variant="outline"
                                            className="font-bold text-xs"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            onClick={() => setCurrentPage((page) => Math.min(totalNotificationPages, page + 1))}
                                            disabled={currentPage === totalNotificationPages}
                                            variant="outline"
                                            className="font-bold text-xs"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Quick Summary Panel */}
            {filteredNotifications.length > 0 && (
                <div className="bg-orange-50/30 border border-orange-100 rounded-2xl p-4 flex items-center justify-between text-xs font-bold text-orange-800">
                    <span>Active Display: {filteredNotifications.length} of {notifications.length} total notifications</span>
                    <span>
                        {filteredNotifications.filter(n => !n.isRead).length} unread • {filteredNotifications.filter(n => n.isRead).length} read
                    </span>
                </div>
            )}
        </div>
    );
}
