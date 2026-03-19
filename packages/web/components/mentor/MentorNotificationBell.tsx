// packages/web/components/mentor/MentorNotificationBell.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, AlertTriangle, Info, CheckCircle, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMentorNotifications } from '@/contexts/MentorNotificationContext';
import { formatDistanceToNow } from 'date-fns';

export default function MentorNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'alerts'>('notifications');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const {
    notifications,
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    dismissAlert,
  } = useMentorNotifications();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string, category?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-yellow-500" />;
      case 'error':
        return <AlertTriangle size={18} className="text-red-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle size={18} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-yellow-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop for closing on click outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Check size={14} className="mr-1" />
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex space-x-4 mt-3">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`text-sm pb-2 px-1 border-b-2 transition-colors ${
                    activeTab === 'notifications'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`text-sm pb-2 px-1 border-b-2 transition-colors ${
                    activeTab === 'alerts'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Alerts
                  {alerts.length > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                      {alerts.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'notifications' && (
                <>
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => {
                          handleNotificationClick(notification);
                          setIsOpen(false);
                        }}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 ${
                          !notification.isRead ? 'bg-primary-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type, notification.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                              {notification.actionUrl && (
                                <span className="text-xs text-primary-600 hover:text-primary-700 flex items-center">
                                  View
                                  <ExternalLink size={12} className="ml-1" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'alerts' && (
                <>
                  {alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No active alerts</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`px-4 py-3 border-b border-gray-100 last:border-0 ${
                          alert.type === 'error' ? 'bg-red-50' :
                          alert.type === 'warning' ? 'bg-yellow-50' :
                          'bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {alert.title}
                              </p>
                              <button
                                onClick={() => dismissAlert(alert.id)}
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {alert.message}
                            </p>
                            {alert.action && (
                              <button
                                onClick={() => {
                                  router.push(alert.action!.url);
                                  setIsOpen(false);
                                }}
                                className="mt-2 text-xs text-primary-600 hover:text-primary-700 flex items-center"
                              >
                                {alert.action.text}
                                <ExternalLink size={12} className="ml-1" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  router.push('/mentor/notifications');
                  setIsOpen(false);
                }}
                className="text-xs text-gray-600 hover:text-gray-900 w-full text-center"
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