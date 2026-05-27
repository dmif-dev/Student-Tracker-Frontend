// packages/web/app/mentor/profile/page.tsx

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Code,
  Brain,
  Edit,
  Save,
  X,
  Clock,
  Users,
  Camera,
  Loader2,
  Trash2
} from 'lucide-react';
import { useCurrentMentor } from '@/hooks/api/useMentor';
import { apiClient } from '@/utils/apiClient';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';

interface MentorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  expertise: string[];
  programs: string[];
  students: number;
  rating: number;
  joinDate: string;
  avatar?: string;
  stats?: {
    totalStudents: number;
    activeStudents: number;
    totalSessions: number;
    averageStudentProgress: number;
    totalOutcomes: number;
    completionRate: number;
    rating: number;
    averageSessionDuration: number;
    documentsShared: number;
  };
  performance?: {
    period: string;
    summary: {
      totalSessions: number;
      averageStudentProgress: number;
      outcomesAchieved: number;
      completionRate: number;
    };
  };
}

export default function MentorProfilePage() {
  const { data, isLoading, refetch } = useCurrentMentor();
  const profile = data as MentorProfile | undefined;
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<MentorProfile & { removeAvatar: boolean }>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const getAvatarUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/api\/?$/, '') || 'http://localhost:4000';
    // Append the raw path as a version query parameter to break browser cache when a new image is uploaded
    return `${apiUrl}/api/mentor/${profile?.id}/avatar?v=${encodeURIComponent(path)}`;
  };

  const handleEdit = () => {
    setEditedProfile({
      name: profile?.name,
      phone: profile?.phone,
      location: profile?.location,
      bio: profile?.bio,
      removeAvatar: false,
    });
    setSaveError(null);
    setSaveSuccess(false);
    setSelectedAvatarFile(null);
    setPreviewAvatar(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      if (selectedAvatarFile) {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', selectedAvatarFile);
        try {
          await apiClient.post('mentor/profile/avatar', formData);
        } finally {
          setUploadingAvatar(false);
        }
      }

      await apiClient.put('mentor/profile/me', {
        name: editedProfile.name,
        phone: editedProfile.phone,
        location: editedProfile.location,
        bio: editedProfile.bio,
        removeAvatar: editedProfile.removeAvatar,
      });
      await refetch();
      setSaveSuccess(true);
      setIsEditing(false);
      setSelectedAvatarFile(null);
      setPreviewAvatar(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
    setSaveError(null);
    setSelectedAvatarFile(null);
    setPreviewAvatar(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedAvatarFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
    setEditedProfile(prev => ({ ...prev, removeAvatar: false }));
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedProfile(prev => ({ ...prev, removeAvatar: true }));
    setSelectedAvatarFile(null);
    setPreviewAvatar(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getProgramIcon = (program: string) => {
    switch (program) {
      case 'G-GMP':
        return <Brain size={16} className="text-purple-500" />;
      case 'G-CMP':
        return <Code size={16} className="text-green-500" />;
      case 'E-TIP':
        return <Award size={16} className="text-blue-500" />;
      default:
        return <BookOpen size={16} className="text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!isEditing ? (
          // <button
          //   onClick={handleEdit}
          //   className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          // >
          //   <Edit size={18} className="mr-2" />
          //   Edit Profile
          // </button>

          <Button onClick={handleEdit} variant="outline" className="font-montserrat font-bold border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-500">
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        ) : (
        <div className="flex space-x-2">
            <Button
              onClick={handleCancel}
              disabled={saving}
              variant="outline" className="font-montserrat font-bold border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-500"
            >
              <X size={18} className="mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Success / Error banners */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-700 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Profile updated successfully!
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {saveError}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className={`relative w-32 h-32 mx-auto mb-4 ${isEditing ? 'group' : ''}`}>
              <div 
                className={`w-full h-full relative ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                {(!editedProfile.removeAvatar) && (previewAvatar || getAvatarUrl(profile.avatar)) ? (
                  <img 
                    src={previewAvatar || getAvatarUrl(profile.avatar)!} 
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover shadow-lg border-4 border-white"
                  />
                ) : (
                  <div className="w-full h-full bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 text-white text-4xl font-bold border-4 border-white">
                    {profile.name?.charAt(0) || '?'}
                  </div>
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    {uploadingAvatar ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-xs font-bold uppercase tracking-widest">Upload</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {isEditing && !editedProfile.removeAvatar && (previewAvatar || getAvatarUrl(profile.avatar)) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute bottom-0 right-0 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                  title="Remove avatar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden" 
              />
            </div>
            
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.name || profile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className="text-xl font-bold text-gray-900 text-center w-full border border-gray-300 rounded px-2 py-1 mb-2"
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900 mb-1">{profile.name}</h2>
            )}
            
            <p className="text-sm text-gray-500 mb-4">Mentor</p>

            <div className="flex items-center justify-center space-x-1 mb-4">
              {profile.programs.map(program => (
                <span
                  key={program}
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                    program === 'G-GMP' ? 'bg-purple-100 text-purple-700' :
                    program === 'G-CMP' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}
                >
                  {getProgramIcon(program)}
                  <span>{program}</span>
                </span>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Users size={16} className="mr-2" />
                  <span className="text-sm">Students</span>
                </div>
                <span className="font-semibold">{profile.students}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Award size={16} className="mr-2" />
                  <span className="text-sm">Rating</span>
                </div>
                <span className="font-semibold">{profile.rating}/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span className="text-sm">Joined</span>
                </div>
                <span className="font-semibold">{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail size={18} className="text-gray-400 mr-3" />
                <span className="text-gray-600">{profile.email}</span>
              </div>
              
              {isEditing ? (
                <div className="flex items-center">
                  <Phone size={18} className="text-gray-400 mr-3" />
                  <input
                    type="tel"
                    value={editedProfile.phone || profile.phone || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Phone number"
                  />
                </div>
              ) : (
                <div className="flex items-center">
                  <Phone size={18} className="text-gray-400 mr-3" />
                  <span className="text-gray-600">{profile.phone || 'Not provided'}</span>
                </div>
              )}

              {isEditing ? (
                <div className="flex items-center">
                  <MapPin size={18} className="text-gray-400 mr-3" />
                  <input
                    type="text"
                    value={editedProfile.location || profile.location || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    placeholder="Location"
                  />
                </div>
              ) : (
                <div className="flex items-center">
                  <MapPin size={18} className="text-gray-400 mr-3" />
                  <span className="text-gray-600">{profile.location || 'Not provided'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">About</h3>
            {isEditing ? (
              <textarea
                value={editedProfile.bio || profile.bio || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-600">{profile.bio || 'No bio provided.'}</p>
            )}
          </div>

          {/* Expertise */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Expertise</h3>
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

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Sessions This Month</p>
                <p className="text-2xl font-bold text-blue-700">{profile.performance?.summary?.totalSessions || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Documents Shared</p>
                <p className="text-2xl font-bold text-green-700">{profile.stats?.documentsShared || 0}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">Avg Session Duration</p>
                <p className="text-2xl font-bold text-purple-700">{profile.stats?.averageSessionDuration || 0} min</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-orange-700">{profile.stats?.completionRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}