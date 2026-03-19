'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, Menu } from 'lucide-react';
import MentorNotificationBell from '@/components/mentor/MentorNotificationBell';

const MOCK_MENTOR = {
    id: '1',
    name: 'Dr. Smith',
    email: 'smith@dmif.org',
    avatar: '/avatars/smith.jpg',
    role: 'Mentor',
    programs: ['G-GMP', 'G-CMP'],
};

export default function MentorHeader() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('mentor');
        router.push('/login');
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
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
                                                {MOCK_MENTOR.programs.map((prog) => (
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
    );
}
