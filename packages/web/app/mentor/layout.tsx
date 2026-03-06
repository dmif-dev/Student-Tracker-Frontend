// packages/web/app/mentor/layout.tsx

'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  User,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  BookOpen
} from 'lucide-react';
import { MentorNotificationProvider } from '@/contexts/MentorNotificationContext';
import MentorNotificationBell from '@/components/mentor/MentorNotificationBell';

interface MentorLayoutProps {
  children: ReactNode;
}

// Mock mentor data - replace with actual auth
const MOCK_MENTOR = {
  id: '1',
  name: 'Dr. Smith',
  email: 'smith@dmif.org',
  avatar: '/avatars/smith.jpg',
  role: 'Mentor',
  programs: ['G-GMP', 'G-CMP'],
};

const navigation = [
  { name: 'Dashboard', href: '/mentor', icon: LayoutDashboard },
  { name: 'My Students', href: '/mentor/students', icon: Users },
  { name: 'My Documents', href: '/mentor/documents', icon: FileText },
  { name: 'My Schedule', href: '/mentor/schedule', icon: Calendar },
  { name: 'My Profile', href: '/mentor/profile', icon: User },
  { name: 'Settings', href: '/mentor/settings', icon: Settings },
];

export default function MentorLayout({ children }: MentorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activePath, setActivePath] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('mentor');
    router.push('/login');
  };

  useEffect(() => {
    setMounted(true);
    setActivePath(window.location.pathname);
  }, []);


  return (
    <MentorNotificationProvider mentorId={MOCK_MENTOR.id}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-20 ${
            isSidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {isSidebarOpen && (
              <span className="text-xl font-bold text-primary-600">DMIF Mentor</span>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>

          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = typeof window !== 'undefined' && 
                  window.location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        mounted && activePath === item.href
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} className={isSidebarOpen ? 'mr-3' : ''} />
                      {isSidebarOpen && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mentor Info - collapsed/expanded */}
          {isSidebarOpen && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {MOCK_MENTOR.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{MOCK_MENTOR.name}</p>
                  <p className="text-xs text-gray-500 truncate">{MOCK_MENTOR.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                >
                  <Menu size={20} />
                </button>

                <div className="flex-1" />

                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <MentorNotificationBell />

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {MOCK_MENTOR.name.charAt(0)}
                      </div>
                      <div className="text-left hidden md:block">
                        <p className="text-sm font-medium text-gray-700">{MOCK_MENTOR.name}</p>
                        <p className="text-xs text-gray-500">{MOCK_MENTOR.email}</p>
                      </div>
                    </button>

                    {showUserMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-40">
                          <div className="px-4 py-3 border-b border-gray-200">
                            <p className="text-sm font-medium text-gray-900">{MOCK_MENTOR.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{MOCK_MENTOR.email}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {MOCK_MENTOR.programs.map(prog => (
                                <span key={prog} className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs">
                                  {prog}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="py-2">
                            <Link
                              href="/mentor/profile"
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-gray-700"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User size={16} className="mr-3 text-gray-500" />
                              My Profile
                            </Link>
                            <Link
                              href="/mentor/settings"
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-gray-700"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings size={16} className="mr-3 text-gray-500" />
                              Settings
                            </Link>
                          </div>

                          <div className="border-t border-gray-200 my-2" />

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

          {/* Page Content */}
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </MentorNotificationProvider>
  );
}