// packages/web/app/admin/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, Mail, Calendar, Shield, Edit2, CheckCircle,
  GraduationCap, Award, BookOpen, TrendingUp, Users, 
  RefreshCw, Settings, FileText, ArrowRight, Briefcase
} from 'lucide-react';
import { useAdminStudents, useAdminProfile, useUpdateAdminProfile } from '@/hooks/api/useAdmin';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoaderOne from "@/components/ui/loader-one";

export default function AdminProfilePage() {
  const { data: userData, isLoading: profileLoading, refetch: refetchProfile } = useAdminProfile();
  const { data: students = [] as any[], isLoading: studentsLoading, refetch: refetchStudents } = useAdminStudents();
  const updateProfileMutation = useUpdateAdminProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

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

  const isLoading = profileLoading || studentsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <LoaderOne />
        <p className="text-slate-500 font-medium animate-pulse">Loading your profile & portal data...</p>
      </div>
    );
  }

  const adminName = userData?.profile?.name || userData?.email?.split('@')[0] || 'Administrator';
  const adminEmail = userData?.email || 'admin@dmif.org';
  const joinedDate = userData?.profile?.createdAt 
    ? new Date(userData.profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'May 18, 2026';

  // Count candidates by program
  const ggmpCount = students.filter((s: any) => s.program === 'G-GMP').length;
  const gcmpCount = students.filter((s: any) => s.program === 'G-CMP').length;
  const etipCount = students.filter((s: any) => s.program === 'E-TIP').length;
  const pcpCount = students.filter((s: any) => s.program === 'PCP').length;

  const adminPortalLinks = [
    {
      title: 'Students Directory',
      description: 'Manage enrolled candidates, track daily progress logs, and supervise academic portfolio outcomes.',
      icon: Users,
      badge: `${students.length} Candidates Enrolled`,
      path: '/admin/students',
      color: 'from-orange-500 to-amber-500 shadow-orange-500/10',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-100/50',
      accentColor: 'orange'
    },
    {
      title: 'Mentor Directory',
      description: 'Supervise professional mentor profiles, select research expertise fields, and audit schedules.',
      icon: GraduationCap,
      badge: 'Manage Expert Mentors',
      path: '/admin/mentors',
      color: 'from-emerald-500 to-teal-500 shadow-emerald-500/10',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100/50',
      accentColor: 'emerald'
    },
    {
      title: 'Analytics & Streaks',
      description: 'Inspect live enrollment demographics, cohort milestones, active streaks, and grading reports.',
      icon: TrendingUp,
      badge: 'Live Operations Metric',
      path: '/admin/analytics',
      color: 'from-blue-500 to-indigo-500 shadow-blue-500/10',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-100/50',
      accentColor: 'blue'
    },
    {
      title: 'Programs & Tracks',
      description: 'Configure and design courses across G-GMP, G-CMP, E-TIP, and self-paced PCP curricula.',
      icon: BookOpen,
      badge: '4 Active Main Curriculum Types',
      path: '/admin/programs',
      color: 'from-purple-500 to-pink-500 shadow-purple-500/10',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-100/50',
      accentColor: 'purple'
    },
    {
      title: 'Document & Resource Library',
      description: 'Manage pre-read assignments, share core learning content resources, and configure files.',
      icon: FileText,
      badge: 'Shared Collaborative Spaces',
      path: '/admin/documents',
      color: 'from-rose-500 to-red-500 shadow-rose-500/10',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-100/50',
      accentColor: 'rose'
    },
    {
      title: 'System Settings',
      description: 'Configure automated email templates, schedule server database backups, and fine-tune preferences.',
      icon: Settings,
      badge: 'Full Root Access Config',
      path: '/admin/settings',
      color: 'from-slate-600 to-stone-700 shadow-slate-600/10',
      textColor: 'text-slate-600',
      bgColor: 'bg-slate-50 border-slate-200/50',
      accentColor: 'slate'
    }
  ];

  return (
    <div className="space-y-8 p-6 md:p-8 bg-gradient-to-br from-slate-50 via-orange-50/10 to-stone-50 min-h-screen">
      {/* Header title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-montserrat text-slate-900 bg-clip-text bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900">
            Administrative Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-md font-medium">Manage root access parameters and route to tracking directories.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => { refetchProfile(); refetchStudents(); toast.success('Dashboard metrics refreshed!'); }}
            className="border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200 font-bold rounded-2xl active:scale-[0.98] transition-all"
          >
            <RefreshCw className="mr-2 h-4 w-4 stroke-[2.2px]" /> Refresh Live Counts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Admin profile card & Stats info */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="border border-slate-200/60 shadow-md bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg relative group">
            {/* Ambient glowing card background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500" />
            
            <div className="h-32 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 rounded-3xl border-4 border-white bg-gradient-to-br from-orange-600 to-amber-500 text-white font-black flex items-center justify-center text-4xl shadow-md transform hover:rotate-6 transition-transform duration-300">
                  {adminName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <CardContent className="pt-16 pb-8 px-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{adminName}</h2>
                  {!isEditing && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                      className="text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                    >
                      <Edit2 size={15} className="stroke-[2.2px]" />
                    </Button>
                  )}
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-orange-600 mt-1">System Administrator</p>
              </div>

              <AnimatePresence>
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 bg-orange-50/40 p-4 rounded-2xl border border-orange-100"
                  >
                    <label className="text-[10px] font-black uppercase text-orange-800 tracking-wider">Update Profile Name</label>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-sm font-semibold bg-white text-slate-800 transition-all"
                      placeholder="Enter new name"
                    />
                    <div className="flex space-x-2 pt-1">
                      <Button 
                        size="sm" 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-orange-500/10"
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Name'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => { setIsEditing(false); setEditedName(adminName); }}
                        className="text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-100"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="border-t border-slate-100 my-4" />

              <div className="space-y-5 text-sm text-slate-600">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <Mail className="w-4.5 h-4.5 stroke-[2.2px]" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                    <p className="font-bold text-slate-800 truncate">{adminEmail}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-purple-50 border border-purple-100/50 rounded-xl flex items-center justify-center text-purple-400">
                    <Shield className="w-4.5 h-4.5 stroke-[2.2px]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Access Level</p>
                    <Badge className="bg-purple-100 border border-purple-200 text-purple-800 font-bold uppercase text-[9px] tracking-wider mt-0.5 shadow-sm rounded-lg px-2 py-0.5">
                      Full Root Access
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                    <Calendar className="w-4.5 h-4.5 stroke-[2.2px]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Member Since</p>
                    <p className="font-bold text-slate-800">{joinedDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Cohort breakdown stats */}
          <Card className="border border-slate-200/60 shadow-md bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg p-6 space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Academic Cohort Sizes</h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Active enrollments count classified by track.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100/30 border border-orange-100 rounded-2xl p-4 transition-transform duration-300 hover:scale-[1.02]">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">G-GMP Candidates</p>
                <p className="text-3xl font-black text-orange-950 mt-1.5">{ggmpCount}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-100 rounded-2xl p-4 transition-transform duration-300 hover:scale-[1.02]">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">G-CMP Candidates</p>
                <p className="text-3xl font-black text-amber-950 mt-1.5">{gcmpCount}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 border border-blue-100 rounded-2xl p-4 transition-transform duration-300 hover:scale-[1.02]">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">E-TIP Candidates</p>
                <p className="text-3xl font-black text-blue-950 mt-1.5">{etipCount}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 border border-purple-100 rounded-2xl p-4 transition-transform duration-300 hover:scale-[1.02]">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">PCP Candidates</p>
                <p className="text-3xl font-black text-purple-950 mt-1.5">{pcpCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: High-level Administrative Hub (Quick Actions & Shortcuts) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/60 shadow-md bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg relative group">
            {/* Decorative background light elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <CardHeader className="p-8 pb-4 border-b border-slate-100 relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Badge className="bg-orange-50 border border-orange-200 text-orange-600 font-black uppercase text-[9px] tracking-wider mb-2.5 shadow-sm rounded-lg px-2.5 py-0.5">
                    Root Control Center
                  </Badge>
                  <CardTitle className="text-3xl font-black text-slate-800 tracking-tight font-montserrat">
                    Administrative Navigation Hub
                  </CardTitle>
                  <CardDescription className="mt-1.5 text-slate-400 font-medium">
                    Monitor metrics, launch tracking, and route to database record directories.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Shortcut Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminPortalLinks.map((link, idx) => {
                  const IconComponent = link.icon;
                  return (
                    <Link key={idx} href={link.path}>
                      <motion.div 
                        whileHover={{ y: -4 }}
                        className="h-full border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50/20 active:scale-[0.99] transition-all duration-200 group/item flex flex-col justify-between relative overflow-hidden"
                      >
                        {/* Interactive glow effect */}
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${link.color} opacity-0 group-hover/item:opacity-[0.04] rounded-full blur-xl transition-all duration-300`} />
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-2xl bg-gradient-to-tr ${link.color} text-white shadow-md transition-transform duration-300 group-hover/item:scale-105`}>
                              <IconComponent size={20} className="stroke-[2.2px]" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border border-current/10 ${link.bgColor} ${link.textColor} shadow-sm`}>
                              {link.badge}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-[15px] font-black text-slate-800 group-hover/item:text-orange-600 transition-colors duration-200">
                              {link.title}
                            </h4>
                            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                              {link.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mt-5 pt-3 border-t border-slate-50 group-hover/item:text-orange-600 transition-colors duration-200">
                          Open Section <ArrowRight size={12} className="ml-1.5 stroke-[2.5px] transform group-hover/item:translate-x-1 transition-transform" />
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
