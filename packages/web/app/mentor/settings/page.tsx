// packages/web/app/mentor/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Bell,
  Shield,
  Moon,
  Sun,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Save,
  Eye,
  EyeOff,
  Key,
  LogOut,
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { signOut } from '@/app/auth/actions';
import { useCurrentMentor } from '@/hooks/api/useMentor';
import { apiClient } from '@/utils/apiClient';
import { createClient } from '@/utils/supabase/client';
import LoaderOne from "@/components/ui/loader-one";

interface MentorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  expertise: string[];
  programs: string[];
  avatar?: string;
  notificationPreferences: {
    emailNotifications: boolean;
    sessionReminders: boolean;
    studentUpdates: boolean;
    documentUploads: boolean;
    weeklyDigest: boolean;
  };
  privacySettings: {
    profileVisibility: 'public' | 'mentors_only' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
}

export default function MentorSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'account' | 'privacy'>('profile');
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Form states
  const [editedProfile, setEditedProfile] = useState<Partial<MentorProfile>>({});
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    sessionReminders: true,
    studentUpdates: true,
    documentUploads: true,
    weeklyDigest: false,
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'mentors_only' as 'public' | 'mentors_only' | 'private',
    showEmail: false,
    showPhone: false,
  });
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { data: profileData, isLoading, refetch } = useCurrentMentor();

  useEffect(() => {
    const loadSettings = async () => {
      if (!profileData) return;
      setProfile(profileData as any);
      setEditedProfile(profileData as any);
      try {
        const settings = await apiClient.get<any>('mentor/settings');
        if (settings.notificationSettings) {
          setNotificationSettings(settings.notificationSettings);
        }
        if (settings.privacySettings) {
          setPrivacySettings(settings.privacySettings);
        }
      } catch {
        // keep defaults
      }
    };
    loadSettings();
  }, [profileData]);

  const handleProfileSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const updated = await apiClient.put<any>('mentor/profile/me', {
        name: editedProfile.name,
        phone: editedProfile.phone,
        location: editedProfile.location,
        bio: editedProfile.bio,
      });
      
      setProfile(prev => prev ? { ...prev, ...updated } : null);
      refetch(); // re-sync React Query cache
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await apiClient.put('mentor/settings', {
        section: 'notifications',
        notificationSettings,
      });
      setSuccessMessage('Notification preferences updated!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to update notification settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacySave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      await apiClient.put('mentor/settings', {
        section: 'privacy',
        privacySettings,
      });
      setSuccessMessage('Privacy settings updated!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage('Failed to update privacy settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }
    
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      const supabase = createClient();
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) throw new Error('Could not identify current user');

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      });

      if (signInError) {
        setErrorMessage('Current password is incorrect');
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        throw updateError;
      }
      
      setSuccessMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully.');
  };

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700',
      'G-CMP': 'bg-green-100 text-green-700',
      'E-TIP': 'bg-blue-100 text-blue-700',
    };
    return colors[program as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderOne />
      </div>
    );
  }

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Eye },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle2 size={18} className="text-green-500" />
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle size={18} className="text-red-500" />
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && profile && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editedProfile.name || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editedProfile.email || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editedProfile.phone || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editedProfile.location || ''}
                        onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={editedProfile.bio || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expertise
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise.map((exp, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Programs
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profile.programs.map((program) => (
                        <span
                          key={program}
                          className={`px-3 py-1 rounded-full text-sm ${getProgramColor(program)}`}
                        >
                          {program}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="scale-75 mr-2"><LoaderOne /></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Session Reminders</p>
                      <p className="text-sm text-gray-500">Get reminders before scheduled sessions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.sessionReminders}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          sessionReminders: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Student Updates</p>
                      <p className="text-sm text-gray-500">Get notified about student progress</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.studentUpdates}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          studentUpdates: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Document Uploads</p>
                      <p className="text-sm text-gray-500">Get notified when students access documents</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.documentUploads}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          documentUploads: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Weekly Digest</p>
                      <p className="text-sm text-gray-500">Receive a weekly summary of your activities</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyDigest}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          weeklyDigest: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNotificationSave}
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="scale-75 mr-2"><LoaderOne /></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">Delete Account</p>
                      <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                          toast.error('Account deletion feature is currently disabled for security reasons. Please contact an administrator.');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete Account
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Logout</p>
                      <p className="text-sm text-gray-500">Sign out from your account</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2 inline" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => setPrivacySettings({
                        ...privacySettings,
                        profileVisibility: e.target.value as any
                      })}
                      className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="public">Public - Anyone can see</option>
                      <option value="mentors_only">Mentors Only</option>
                      <option value="private">Private - Only me</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Show Email</p>
                      <p className="text-sm text-gray-500">Display your email to others</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showEmail}
                        onChange={(e) => setPrivacySettings({
                          ...privacySettings,
                          showEmail: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Show Phone</p>
                      <p className="text-sm text-gray-500">Display your phone number to others</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.showPhone}
                        onChange={(e) => setPrivacySettings({
                          ...privacySettings,
                          showPhone: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePrivacySave}
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="scale-75 mr-2"><LoaderOne /></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Privacy Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}