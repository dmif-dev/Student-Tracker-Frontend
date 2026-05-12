// packages/web/app/mentor/profile/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Users
} from 'lucide-react';
import { ApiService } from '@/services/api';

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
}

export default function MentorProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<MentorProfile>>({});
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loading, isError } = useQuery<MentorProfile>({
    queryKey: ['mentorProfile'],
    queryFn: async () => {
      const mentor = await ApiService.getMentorProfile();
      return {
        id: mentor.id,
        name: mentor.name || '',
        email: mentor.user?.email || '',
        phone: mentor.phone || '',
        location: mentor.location || '',
        bio: mentor.bio || '',
        expertise: mentor.expertise || [],
        programs: mentor.programs || [],
        students: mentor._count?.assignedStudents || mentor.students || 0,
        rating: mentor.rating || 0,
        joinDate: mentor.joinDate || new Date().toISOString(),
      };
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<MentorProfile>) => ApiService.updateMentorProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorProfile'] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
    }
  });

  const handleEdit = () => {
    setEditedProfile({
      name: profile?.name,
      phone: profile?.phone,
      location: profile?.location,
      bio: profile?.bio,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editedProfile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
          <button
            onClick={handleEdit}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Edit size={18} className="mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X size={18} className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Save size={18} className="mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {profile.name.charAt(0)}
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
                <span className="font-semibold">{new Date(profile.joinDate).toLocaleDateString()}</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
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
                <p className="text-2xl font-bold text-blue-700">24</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Documents Shared</p>
                <p className="text-2xl font-bold text-green-700">18</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">Avg Session Duration</p>
                <p className="text-2xl font-bold text-purple-700">45 min</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 mb-1">Response Rate</p>
                <p className="text-2xl font-bold text-orange-700">95%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}