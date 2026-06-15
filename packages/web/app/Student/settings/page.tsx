"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Globe,
    Bell,
    Lock,
    Save,
    User,
    Calendar,
    Briefcase,
    Mail,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff
} from "lucide-react";

interface StudentSettings {
    timezone: string;
    dateFormat: string;
    language: string;
    darkMode: boolean;
    emailNotifications: boolean;
    weeklyReports: boolean;
    sessionReminders: boolean;
    newDocuments: boolean;
    outcomeAlerts: boolean;
}

const defaultSettings: StudentSettings = {
    timezone: "UTC+5:30",
    dateFormat: "YYYY-MM-DD",
    language: "en",
    darkMode: false,
    emailNotifications: true,
    weeklyReports: true,
    sessionReminders: true,
    newDocuments: true,
    outcomeAlerts: true,
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<"preferences" | "notifications" | "security">("preferences");
    const [settingsState, setSettingsState] = useState<StudentSettings>(defaultSettings);

    const queryClient = useQueryClient();

    // Password State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    // Load Live Settings Preferences from Database
    const { data: preferencesData, isLoading: isPreferencesLoading } = useQuery({
        queryKey: ["userPreferences"],
        queryFn: async () => {
            try {
                return await ApiService.getUserPreferences();
            } catch (error) {
                console.error("Failed to load preferences:", error);
                return defaultSettings;
            }
        }
    });

    // Load Student Profile for Session Details Panel
    const { data: profile } = useQuery({
        queryKey: ["studentProfile"],
        queryFn: async () => {
            try {
                return await ApiService.getStudentProfile();
            } catch (error) {
                console.error("Failed to load profile for settings:", error);
                return null;
            }
        }
    });

    useEffect(() => {
        if (preferencesData) {
            setSettingsState(prev => ({
                ...prev,
                ...preferencesData
            }));
        }
    }, [preferencesData]);

    // Save Preferences Mutation
    const saveMutation = useMutation({
        mutationFn: (updated: StudentSettings) => ApiService.updateUserPreferences(updated),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
            toast.success("Settings Saved", {
                description: "Your settings preferences have been updated successfully.",
            });
        },
        onError: (error) => {
            console.error("Failed to save settings:", error);
            toast.error("Error", {
                description: "Failed to save settings. Please try again later.",
            });
        }
    });

    const handleSavePreferences = () => {
        saveMutation.mutate(settingsState);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Required Fields", {
                description: "Please fill out all password fields.",
            });
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Weak Password", {
                description: "New password must be at least 8 characters long.",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords Mismatch", {
                description: "Your new password and confirmation password do not match.",
            });
            return;
        }

        try {
            setIsPasswordLoading(true);
            await ApiService.changePassword(currentPassword, newPassword);
            toast.success("Password Updated", {
                description: "Your account password has been updated successfully.",
            });
            // Clear password fields
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Failed to update password:", error);
            toast.error("Error Changing Password", {
                description: error.message || "Failed to update password. Verify current password.",
            });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const PROGRAM_TRACKS = {
        "G-GMP": "Global Guided Mentorship Program",
        "G-CMP": "Global Coding Mentorship Program",
        "E-TIP": "Executive Technology Immersion Program",
        "PCP": "Professional Certification Program",
    };

    if (isPreferencesLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="text-gray-500 font-medium">Loading preferences settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    Settings
                </h1>
                <p className="text-gray-600 mt-2">Manage your student application preferences, alerts, and account security.</p>
            </div>

            {/* Sidebar Tabbed Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 space-y-1">
                        <button
                            onClick={() => setActiveTab("preferences")}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                                activeTab === "preferences"
                                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <Globe className="w-4 h-4 mr-3" />
                            App Preferences
                        </button>
                        <button
                            onClick={() => setActiveTab("notifications")}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                                activeTab === "notifications"
                                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <Bell className="w-4 h-4 mr-3" />
                            Notifications
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                                activeTab === "security"
                                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/10"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <Lock className="w-4 h-4 mr-3" />
                            Account & Security
                        </button>
                    </div>
                </div>

                {/* Settings Tab Panels */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Tab 1: Application Preferences */}
                    {activeTab === "preferences" && (
                        <Card className="rounded-2xl border-gray-200/50 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-orange-600" />
                                    Application Preferences
                                </CardTitle>
                                <CardDescription>Configure display language, localized formats, and timezone settings.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="timezone" className="text-sm font-bold text-gray-700">Timezone</Label>
                                        <select
                                            id="timezone"
                                            value={settingsState.timezone}
                                            onChange={(e) => setSettingsState({ ...settingsState, timezone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow text-sm"
                                        >
                                            <option value="UTC+5:30">IST (UTC+5:30) - Mumbai, Chennai</option>
                                            <option value="UTC+0">UTC (Universal Coordinated Time)</option>
                                            <option value="UTC-5">EST (UTC-5) - New York, Boston</option>
                                            <option value="UTC-8">PST (UTC-8) - California, Seattle</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dateFormat" className="text-sm font-bold text-gray-700">Date Format</Label>
                                        <select
                                            id="dateFormat"
                                            value={settingsState.dateFormat}
                                            onChange={(e) => setSettingsState({ ...settingsState, dateFormat: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow text-sm"
                                        >
                                            <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-05-25)</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 25/05/2026)</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 05/25/2026)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="language" className="text-sm font-bold text-gray-700">Display Language</Label>
                                    <select
                                        id="language"
                                        value={settingsState.language}
                                        onChange={(e) => setSettingsState({ ...settingsState, language: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow text-sm"
                                    >
                                        <option value="en">English (US)</option>
                                        <option value="es">Español (Spanish)</option>
                                        <option value="fr">Français (French)</option>
                                        <option value="de">Deutsch (German)</option>
                                    </select>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-gray-900 text-sm">Theme Selection</p>
                                        <p className="text-xs text-gray-500">Toggle deep dark theme visual interface.</p>
                                    </div>
                                    <Switch
                                        checked={settingsState.darkMode}
                                        onCheckedChange={(checked) => setSettingsState({ ...settingsState, darkMode: checked })}
                                    />
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <Button
                                        disabled={saveMutation.isPending}
                                        onClick={handleSavePreferences}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold gap-2"
                                    >
                                        {saveMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Save Preferences
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tab 2: Notification Configuration */}
                    {activeTab === "notifications" && (
                        <Card className="rounded-2xl border-gray-200/50 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-orange-600" />
                                    Notification Settings
                                </CardTitle>
                                <CardDescription>Configure which updates, reports, and reminders trigger student email notifications.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-gray-900 text-sm">Global Email Alerts</p>
                                            <p className="text-xs text-gray-500">Enable overall student updates in your inbox.</p>
                                        </div>
                                        <Switch
                                            checked={settingsState.emailNotifications}
                                            onCheckedChange={(checked) => setSettingsState({ ...settingsState, emailNotifications: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-gray-900 text-sm">Weekly Progress Summaries</p>
                                            <p className="text-xs text-gray-500">Receive automated performance evaluations at week end.</p>
                                        </div>
                                        <Switch
                                            checked={settingsState.weeklyReports}
                                            onCheckedChange={(checked) => setSettingsState({ ...settingsState, weeklyReports: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-gray-900 text-sm">Mentorship Session Reminders</p>
                                            <p className="text-xs text-gray-500">Alerts sent 2 hours before scheduled mentor meetings.</p>
                                        </div>
                                        <Switch
                                            checked={settingsState.sessionReminders}
                                            onCheckedChange={(checked) => setSettingsState({ ...settingsState, sessionReminders: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-gray-900 text-sm">Learning Guides & Course Materials</p>
                                            <p className="text-xs text-gray-500">Get notified immediately when new folders or PDFs are uploaded.</p>
                                        </div>
                                        <Switch
                                            checked={settingsState.newDocuments}
                                            onCheckedChange={(checked) => setSettingsState({ ...settingsState, newDocuments: checked })}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-gray-900 text-sm">Milestone Achievement Alerts</p>
                                            <p className="text-xs text-gray-500">Be notified when outcomes (patents/papers) are verified or updated.</p>
                                        </div>
                                        <Switch
                                            checked={settingsState.outcomeAlerts}
                                            onCheckedChange={(checked) => setSettingsState({ ...settingsState, outcomeAlerts: checked })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <Button
                                        disabled={saveMutation.isPending}
                                        onClick={handleSavePreferences}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold gap-2"
                                    >
                                        {saveMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Save Preferences
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tab 3: Account & Security */}
                    {activeTab === "security" && (
                        <div className="space-y-6">
                            {/* Change Password Card */}
                            <Card className="rounded-2xl border-gray-200/50 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-orange-600" />
                                        Change Account Password
                                    </CardTitle>
                                    <CardDescription>Update your Supabase authentication credentials. Use a strong, unique value.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="currentPassword" className="text-sm font-bold text-gray-700">Current Password</Label>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setShowPasswords(prev => !prev)}
                                                    className="text-xs text-orange-500 hover:text-orange-600 font-bold flex items-center gap-1"
                                                >
                                                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    {showPasswords ? "Hide" : "Show"} Passwords
                                                </button>
                                            </div>
                                            <Input
                                                id="currentPassword"
                                                type={showPasswords ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="border-gray-200 rounded-lg"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword" className="text-sm font-bold text-gray-700">New Password</Label>
                                            <Input
                                                id="newPassword"
                                                type={showPasswords ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Min. 8 characters"
                                                className="border-gray-200 rounded-lg"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700">Confirm New Password</Label>
                                            <Input
                                                id="confirmPassword"
                                                type={showPasswords ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="border-gray-200 rounded-lg"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={isPasswordLoading}
                                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold gap-2"
                                            >
                                                {isPasswordLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                )}
                                                Update Password
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Active Session Info Card */}
                            {profile && (
                                <Card className="rounded-2xl border-gray-200/50 bg-gradient-to-br from-orange-50/40 via-white to-white shadow-sm overflow-hidden group">
                                    <CardHeader>
                                        <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <User className="w-4 h-4 text-orange-600" />
                                            Active Student Session Profile
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <div className="p-2 bg-orange-50 rounded-lg">
                                                    <User className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Name</p>
                                                    <p className="font-bold text-gray-900">{profile.firstName} {profile.lastName}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <div className="p-2 bg-orange-50 rounded-lg">
                                                    <Briefcase className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Registration Number</p>
                                                    <p className="font-bold text-gray-900">{profile.id}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <div className="p-2 bg-orange-50 rounded-lg">
                                                    <Mail className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Authorized Email</p>
                                                    <p className="font-bold text-gray-900 truncate max-w-[200px]" title={profile.email}>{profile.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <div className="p-2 bg-orange-50 rounded-lg">
                                                    <Calendar className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Join Date</p>
                                                    <p className="font-bold text-gray-900">{profile.joinDate}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
