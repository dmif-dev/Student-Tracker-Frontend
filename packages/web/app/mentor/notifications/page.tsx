// packages/web/app/mentor/notifications/page.tsx

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMentorNotifications } from '@/contexts/MentorNotificationContext';
import { formatDistanceToNow } from 'date-fns';
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
  Users,
  FileText,
  Clock
} from 'lucide-react';

type FilterType = 'all' | 'unread' | 'read';
type DateFilterType = 'all' | 'today' | 'week' | 'month';
type CategoryFilterType = 'all' | 'student' | 'session' | 'document' | 'system';

export default function MentorNotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dismissAlert,
    handleNotificationClick,
  } = useMentorNotifications();

  // Filter states
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters to notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Status filter
      if (filter === 'unread' && notification.isRead) return false;
      if (filter === 'read' && !notification.isRead) return false;

      // Category filter
      if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;

      // Date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        const notifDate = new Date(notification.createdAt);
        const diffTime = Math.abs(now.getTime() - notifDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'today':
            if (diffDays > 1) return false;
            break;
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
        }
      }

      return true;
    });
  }, [notifications, filter, categoryFilter, dateFilter]);

  // Apply filters to alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Category filter for alerts
      if (categoryFilter !== 'all' && alert.category !== categoryFilter) return false;
      return true;
    });
  }, [alerts, categoryFilter]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (dateFilter !== 'all') count++;
    return count;
  };

  const clearFilters = () => {
    setFilter('all');
    setCategoryFilter('all');
    setDateFilter('all');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'student':
        return <Users size={16} className="text-blue-500" />;
      case 'session':
        return <Clock size={16} className="text-purple-500" />;
      case 'document':
        return <FileText size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      student: 'Students',
      session: 'Sessions',
      document: 'Documents',
      system: 'System',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      student: 'bg-blue-100 text-blue-700',
      session: 'bg-purple-100 text-purple-700',
      document: 'bg-green-100 text-green-700',
      system: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <Check size={18} className="mr-2" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                  showFilters || getActiveFilterCount() > 0
                    ? 'bg-primary-50 border-primary-300 text-primary-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter size={18} className="mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <div className="text-sm text-gray-500">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread ({unreadCount})</option>
                    <option value="read">Read</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as CategoryFilterType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="student">Students</option>
                    <option value="session">Sessions</option>
                    <option value="document">Documents</option>
                    <option value="system">System</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {filteredAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.type === 'error' ? 'bg-red-50 border-red-200' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                alert.type === 'success' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {alert.type === 'error' && <AlertTriangle size={20} className="text-red-500" />}
                  {alert.type === 'warning' && <AlertTriangle size={20} className="text-yellow-500" />}
                  {alert.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
                  {alert.type === 'info' && <Info size={20} className="text-blue-500" />}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(alert.category)}`}>
                        {getCategoryLabel(alert.category)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    {alert.action && (
                      <button
                        onClick={() => router.push(alert.action!.url)}
                        className="mt-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        {alert.action.text}
                        <ExternalLink size={14} className="ml-1" />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Dismiss"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Notifications</h2>
          {filteredNotifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              <Check size={16} className="mr-1" />
              Mark all as read
            </button>
          )}
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {getActiveFilterCount() > 0 
                ? 'No notifications match your current filters.' 
                : 'You\'re all caught up!'}
            </p>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-primary-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {notification.type === 'success' && <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />}
                    {notification.type === 'warning' && <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />}
                    {notification.type === 'error' && <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />}
                    {notification.type === 'info' && <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(notification.category)}
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        {!notification.isRead && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                            New
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(notification.category)}`}>
                          {getCategoryLabel(notification.category)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-xs text-gray-400 flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                        {notification.actionUrl && (
                          <span className="text-xs text-primary-600 hover:text-primary-700 flex items-center">
                            Click to view
                            <ExternalLink size={12} className="ml-1" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check size={16} className="text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}