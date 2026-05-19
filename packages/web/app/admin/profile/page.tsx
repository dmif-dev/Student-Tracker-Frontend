// packages/web/app/admin/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  User, Mail, Calendar, Shield, Edit2, CheckCircle, Search, 
  Filter, GraduationCap, Award, BookOpen, Award as AchievementIcon,
  TrendingUp, Users, RefreshCw
} from 'lucide-react';
import { useAdminStudents, useAdminProfile, useUpdateAdminProfile } from '@/hooks/api/useAdmin';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminProfilePage() {
  const { data: userData, isLoading: profileLoading, refetch: refetchProfile } = useAdminProfile();
  const { data: students = [], isLoading: studentsLoading, refetch: refetchStudents } = useAdminStudents();

  const updateProfileMutation = useUpdateAdminProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('ALL');

  useEffect(() => {
    if (userData?.profile?.name) {
      setEditedName(userData.profile.name);
    }
  }, [userData]);

  const handleSaveProfile = () => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    updateProfileMutation.mutate(
      { name: editedName },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully!");
          setIsEditing(false);
          refetchProfile();
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update profile");
        }
      }
    );
  };

  const getProgramBadgeColor = (programName: string) => {
    switch (programName?.toUpperCase()) {
      case 'G-GMP': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'G-CMP': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'E-TIP': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PCP': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter candidates (students) based on search and program filter
  const filteredCandidates = students.filter(candidate => {
    const matchesSearch = 
      candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProgram = 
      programFilter === 'ALL' || 
      candidate.program?.name?.toUpperCase() === programFilter.toUpperCase();

    return matchesSearch && matchesProgram;
  });

  const isLoading = profileLoading || studentsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <p className="text-gray-500 font-medium">Loading your profile & candidate details...</p>
      </div>
    );
  }

  const adminName = userData?.profile?.name || userData?.email?.split('@')[0] || 'Administrator';
  const adminEmail = userData?.email || 'admin@dmif.org';
  const joinedDate = userData?.profile?.createdAt 
    ? new Date(userData.profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'May 18, 2026';

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-white via-orange-50/10 to-white min-h-screen">
      {/* Header title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-montserrat text-gray-900">Your Profile & Candidates</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your details and monitor candidate enrollments real-time.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => { refetchProfile(); refetchStudents(); toast.success('Data refreshed!'); }}
          className="border-orange-200 text-orange-600 hover:bg-orange-50 font-bold"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Admin profile card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-gray-150 shadow-md bg-white rounded-2xl overflow-hidden transition-all hover:shadow-lg">
            <div className="h-32 bg-gradient-to-r from-orange-500 to-amber-500 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-br from-orange-600 to-amber-500 text-white font-extrabold flex items-center justify-center text-4xl shadow-md">
                  {adminName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <CardContent className="pt-16 pb-8 px-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{adminName}</h2>
                  {!isEditing && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="text-gray-500 hover:text-orange-600 rounded-full"
                    >
                      <Edit2 size={16} />
                    </Button>
                  )}
                </div>
                <p className="text-sm font-semibold uppercase tracking-wider text-orange-600 mt-1">System Administrator</p>
              </div>

              {isEditing ? (
                <div className="space-y-3 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                  <label className="text-xs font-black uppercase text-orange-800 tracking-wider">Update Name</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                    placeholder="Enter your name"
                  />
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => { setIsEditing(false); setEditedName(adminName); }}
                      className="text-gray-500 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="border-t border-gray-100 my-4"></div>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center space-x-3">
                  <Mail className="text-gray-400 w-5 h-5 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Email Address</p>
                    <p className="font-bold text-gray-900 truncate">{adminEmail}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="text-gray-400 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Access Level</p>
                    <Badge className="bg-purple-100 text-purple-800 border-none font-bold uppercase text-[10px] tracking-wider mt-0.5">
                      Full Root Access
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="text-gray-400 w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-black uppercase tracking-wider">Member Since</p>
                    <p className="font-bold text-gray-900">{joinedDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Admin Stats */}
          <Card className="border border-gray-150 shadow-md bg-white rounded-2xl overflow-hidden transition-all hover:shadow-lg p-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Administration Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Candidates</p>
                <p className="text-2xl font-black text-orange-950 mt-1">{students.length}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Managed Tracks</p>
                <p className="text-2xl font-black text-amber-950 mt-1">4</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Candidates list */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-150 shadow-md bg-white rounded-2xl overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-6 pb-2 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <Users className="text-orange-500" /> Managed Candidates ({filteredCandidates.length})
                  </CardTitle>
                  <CardDescription className="mt-1">Real-time candidate profile entries, registration records, and track statuses.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search candidate by name, email, or reg number..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-gray-50/50"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Filter size={16} className="text-gray-500" />
                  <select
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white w-full sm:w-auto"
                  >
                    <option value="ALL">All Programs</option>
                    <option value="G-GMP">G-GMP</option>
                    <option value="G-CMP">G-CMP</option>
                    <option value="E-TIP">E-TIP</option>
                    <option value="PCP">PCP</option>
                  </select>
                </div>
              </div>

              {/* Candidates Grid/Table */}
              <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-inner bg-gray-50/30">
                <table className="min-w-full divide-y divide-gray-100 text-sm text-left">
                  <thead className="bg-gray-50 font-black uppercase text-[10px] tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4">Candidate Name</th>
                      <th className="px-6 py-4">Reg Number</th>
                      <th className="px-6 py-4">Program & Track</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-150 font-medium text-gray-700">
                    <AnimatePresence mode="popLayout">
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((candidate) => (
                          <motion.tr 
                            key={candidate.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="hover:bg-orange-50/20 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 font-extrabold flex items-center justify-center text-xs">
                                  {candidate.name?.charAt(0).toUpperCase() || 'C'}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{candidate.name}</p>
                                  <p className="text-xs text-gray-400">{candidate.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold tracking-widest text-gray-500">
                              {candidate.registrationNumber || 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <Badge className={`border uppercase text-[9px] font-black tracking-widest ${getProgramBadgeColor(candidate.program?.name || '')}`}>
                                  {candidate.program?.name || 'N/A'}
                                </Badge>
                                <p className="text-xs text-gray-500 italic truncate max-w-[150px]">{candidate.track?.name || 'General Track'}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                              {candidate.joinDate ? new Date(candidate.joinDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadgeColor(candidate.status || 'PENDING')}`}>
                                {candidate.status || 'PENDING'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full"
                                    style={{ width: `${candidate.progress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-black text-gray-900">{candidate.progress || 0}%</span>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                            <GraduationCap className="mx-auto w-12 h-12 mb-3 opacity-30 text-orange-500" />
                            <p className="font-bold">No candidates matched the filters</p>
                            <p className="text-xs mt-1 text-gray-400">Try adjusting your search criteria or program dropdown.</p>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
