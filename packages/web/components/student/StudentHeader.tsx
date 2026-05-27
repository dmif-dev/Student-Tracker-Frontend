"use client";

import { useState } from "react";
import { Menu, User, LogOut, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ApiService } from "@/services/api";
import StudentNotificationBell from "./StudentNotificationBell";
import { signOut } from "@/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentHeader() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut();
    };

    // Load Student Profile Dynamically from PostgreSQL DB
    const { data: profile } = useQuery({
        queryKey: ["studentProfile"],
        queryFn: async () => {
            try {
                return await ApiService.getStudentProfile();
            } catch (error) {
                console.error("Failed to load profile for header:", error);
                return null;
            }
        }
    });

    const studentName = profile ? `${profile.firstName} ${profile.lastName}` : "Student User";
    const studentEmail = profile?.email || "student@dmifstudent.org";
    const studentReg = profile?.id || "DMIF Student";
    const avatarUrl = profile?.avatar || "/assets/student-profile.jpg";

    // Dynamic Title mapping
    const getPageTitle = () => {
        if (pathname.includes("/Student/dashboard")) return "Student Dashboard";
        if (pathname.includes("/Student/my-courses")) return "My Courses";
        if (pathname.includes("/Student/progress")) return "Track Progress";
        if (pathname.includes("/Student/my-stats")) return "My Achievements";
        if (pathname.includes("/Student/mentor-details")) return "Mentor Contacts";
        if (pathname.includes("/Student/my-profile")) return "Student Profile";
        if (pathname.includes("/Student/settings")) return "Application Settings";
        if (pathname.includes("/Student/notifications")) return "Notification Board";
        return "Student Dashboard";
    };

    return (
        <header className="bg-white border-b border-gray-200/50 sticky top-0 z-10 w-full">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left section - title */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-black text-gray-900 tracking-tight font-montserrat">
                            {getPageTitle()}
                        </h1>
                    </div>

                    {/* Right section - Notifications and User menu */}
                    <div className="flex items-center space-x-4">
                        {/* Student Notifications Bell */}
                        <StudentNotificationBell />

                        {/* User Menu Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                                aria-label="User menu"
                            >
                                <Avatar className="h-8 w-8 border border-orange-200">
                                    <AvatarImage src={avatarUrl} alt={studentName} />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-xs">
                                        {profile ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}` : "ST"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden md:block">
                                    <p className="text-xs font-bold text-gray-800 leading-tight">{studentName}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{studentReg}</p>
                                </div>
                            </button>

                            {showUserMenu && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setShowUserMenu(false)}
                                    />

                                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-200/50 py-2 z-40 animate-in fade-in-50 duration-100">
                                        {/* User header */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-bold text-gray-900">{studentName}</p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5" title={studentEmail}>{studentEmail}</p>
                                        </div>

                                        {/* Dropdown Items */}
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    router.push("/Student/my-profile");
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-xs font-bold text-gray-700 transition-colors"
                                            >
                                                <User size={14} className="mr-3 text-gray-400" />
                                                Your Profile
                                            </button>

                                            <button
                                                onClick={() => {
                                                    router.push("/Student/settings");
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-xs font-bold text-gray-700 transition-colors"
                                            >
                                                <Settings size={14} className="mr-3 text-gray-400" />
                                                Settings
                                            </button>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-gray-100 my-1"></div>

                                        {/* Sign out */}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-xs font-bold text-red-600 transition-colors"
                                        >
                                            <LogOut size={14} className="mr-3 text-red-400" />
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
