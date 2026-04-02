// packages/web/components/admin/AdminHeader.tsx

'use client';

import { useState } from 'react';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';
import { signOut } from '@/app/auth/actions';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

export default function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
  };

  // Mock user data - replace with actual auth
  const user = {
    name: 'Admin User',
    email: 'admin@dmif.org',
    role: 'Administrator',
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section - Menu toggle and title */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors mr-4 text-gray-900"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>

          {/* Right section - Notifications and User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications Bell - Now using context from layout */}
            <NotificationBell />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="User menu"
                aria-expanded={showUserMenu}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <>
                  {/* Backdrop for closing on click outside */}
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowUserMenu(false)}
                  />

                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push('/admin/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-gray-700"
                      >
                        <User size={16} className="mr-3 text-gray-500" />
                        Your Profile
                      </button>

                      <button
                        onClick={() => {
                          router.push('/admin/settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-gray-700"
                      >
                        <Settings size={16} className="mr-3 text-gray-500" />
                        Settings
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-red-600"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}