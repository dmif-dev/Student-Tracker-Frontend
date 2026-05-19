// packages/web/app/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Users, GraduationCap, Award, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAdminDashboardStats, useSystemActivities } from '@/hooks/api/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalMentors: number;
  programsCount: number;
  pendingReviews: number;
  outcomesThisMonth: number;
  totalOutcomes?: number;
  patentsCount?: number;
  papersCount?: number;
  averageProgress?: number;
  engagementRate?: number;
}

interface ActivityItem {
  id: string;
  type: 'student_registered' | 'progress_submitted' | 'report_generated' | 'outcome_achieved' | 'certification_completed';
  title: string;
  time: string;
  user?: string;
  program?: string;
}

// Map mock activity types to expected types
const mapActivityType = (type: string, program?: string): ActivityItem['type'] => {
  if (type === 'outcome') {
    return program === 'PCP' ? 'certification_completed' : 'outcome_achieved';
  }
  switch (type) {
    case 'enrollment':
      return 'student_registered';
    case 'progress':
      return 'progress_submitted';
    case 'report_generated':
      return 'report_generated';
    default:
      return 'progress_submitted';
  }
};

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: activitiesData, isLoading: activitiesLoading } = useSystemActivities(20);

  const loading = statsLoading || activitiesLoading;

  const stats: DashboardStats = {
    totalStudents: statsData?.stats?.totalStudents || 0,
    activeStudents: statsData?.stats?.activeStudents || 0,
    totalMentors: statsData?.stats?.totalMentors || 0,
    programsCount: statsData?.stats?.totalPrograms || 0,
    pendingReviews: statsData?.stats?.pendingReviews || 0,
    outcomesThisMonth: statsData?.stats?.totalOutcomes || 0,
  };

  const activitySource = statsData?.recentActivity || activitiesData || [];

  const recentActivity: ActivityItem[] = activitySource.map((a: any) => ({
    id: a.id,
    type: mapActivityType(a.type || a.action, a.program),
    title: a.title || `${a.action || 'Activity'} - ${a.details || ''}`,
    time: a.createdAt ? new Date(a.createdAt).toLocaleString() : a.time || 'Just now',
    user: a.user?.name || a.user?.email || a.user,
    program: a.program,
  }));

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card className="border border-gray-100 shadow-md bg-white transition-all hover:translate-y-[-4px] hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-3 rounded-2xl bg-orange-100 text-orange-600", color.replace('bg-', 'text-').replace('-500', '-600'))}>
            <Icon size={24} />
          </div>
          {trend && (
            <div className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest flex items-center">
              <TrendingUp size={10} className="mr-1" />
              {trend}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 font-montserrat uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold tracking-tighter text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 pb-20 bg-gradient-to-br from-white via-orange-50/5 to-white min-h-screen">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-montserrat text-gray-900">Welcome back, Admin!</h1>
          <p className="text-muted-foreground mt-2 text-lg">Here's what's happening across your programs today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/analytics">
            <Button variant="outline" className="font-montserrat font-bold border-orange-200 text-orange-600 hover:bg-orange-50">
              <TrendingUp className="mr-2 h-4 w-4" /> Comprehensive Analytics
            </Button>
          </Link>
          <Link href="/admin/students/add">
            <Button className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
              <Users className="mr-2 h-4 w-4" /> Add New Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="bg-orange-500"
          trend="+12%"
        />
        <StatCard
          title="Active Students"
          value={stats.activeStudents}
          icon={GraduationCap}
          color="bg-amber-500"
          trend="+8%"
        />
        <StatCard
          title="Active Mentors"
          value={stats.totalMentors}
          icon={Users}
          color="bg-orange-600"
        />
        <StatCard
          title="Active Programs"
          value={stats.programsCount}
          icon={Award}
          color="bg-amber-600"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={Clock}
          color="bg-orange-400"
        />
        <StatCard
          title="Outcomes This Month"
          value={stats.outcomesThisMonth}
          icon={CheckCircle}
          color="bg-amber-400"
          trend="+25%"
        />
      </div>

      {/* Weekly Schedule Overview */}
      <Card className="rounded-2xl shadow-xl border-none overflow-hidden bg-card/70 backdrop-blur-md">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-extrabold tracking-tight font-montserrat">This Week's Mentoring Sessions</CardTitle>
          <CardDescription>Scheduled active sessions across all major programs.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 group hover:bg-orange-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-orange-700 tracking-wider">G-GMP</h4>
                <span className="text-[10px] font-black bg-orange-200 text-orange-800 px-2 py-1 rounded-full uppercase">Mondays</span>
              </div>
              <p className="text-3xl font-black text-orange-900 tracking-tighter">12</p>
              <p className="text-sm font-bold text-orange-600/70">active sessions</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 group hover:bg-amber-100 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-amber-700 tracking-wider">G-CMP</h4>
                <span className="text-[10px] font-black bg-amber-200 text-amber-800 px-2 py-1 rounded-full uppercase">Wednesdays</span>
              </div>
              <p className="text-3xl font-black text-amber-900 tracking-tighter">8</p>
              <p className="text-sm font-bold text-amber-600/70">active sessions</p>
            </div>

            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-5 group hover:bg-gray-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-black text-gray-700 tracking-wider">E-TIP</h4>
                <span className="text-[10px] font-black bg-gray-300 text-gray-800 px-2 py-1 rounded-full uppercase">Fridays</span>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">5</p>
              <p className="text-sm font-bold text-gray-600">active sessions</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Today's Active Pipeline</h4>
            <div className="grid gap-3">
              {[
                { name: "John Doe with Dr. Smith", prog: "G-GMP • Patent Track", time: "10:00 AM" },
                { name: "Jane Smith with Prof. Johnson", prog: "G-CMP • AI Product", time: "02:00 PM" },
                { name: "Alex Chen with Dr. Smith", prog: "G-GMP • Research Track", time: "03:30 PM" }
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/50 hover:bg-white rounded-2xl border border-transparent hover:border-orange-100 transition-all shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{session.name}</p>
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{session.prog}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">{session.time}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-xl border-none bg-white p-8">
            <h3 className="text-2xl font-black font-montserrat mb-6 tracking-tight">System Activity</h3>
            <div
              className="space-y-6 overflow-y-auto pr-2"
              style={{
                maxHeight: '30rem', /* ~7 items at ~68px each */
                scrollbarWidth: 'thin',
                scrollbarColor: '#f97316 #f3f4f6',
              }}
            >
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No recent activity yet.</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        activity.type === 'student_registered' ? "bg-green-100 text-green-600" :
                          activity.type === 'progress_submitted' ? "bg-orange-100 text-orange-600" :
                            activity.type === 'outcome_achieved' ? "bg-purple-100 text-purple-600" :
                              activity.type === 'certification_completed' ? "bg-amber-100 text-amber-600" :
                                "bg-gray-100 text-gray-600"
                      )}>
                        {activity.type === 'student_registered' && <Users size={18} />}
                        {activity.type === 'progress_submitted' && <TrendingUp size={18} />}
                        {activity.type === 'outcome_achieved' && <Award size={18} />}
                        {activity.type === 'certification_completed' && <GraduationCap size={18} />}
                        {activity.type === 'report_generated' && <CheckCircle size={18} />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{activity.title}</p>
                        <span className="text-[10px] font-bold text-gray-400 ml-2 flex-shrink-0">{activity.time}</span>
                      </div>
                      {activity.user && (
                        <p className="text-xs font-medium text-gray-500">by {activity.user}</p>
                      )}
                      {activity.program && (
                        <span className={cn(
                          "inline-block mt-2 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
                          activity.program === 'G-GMP' ? "bg-orange-50 text-orange-700 border-orange-100" :
                            activity.program === 'G-CMP' ? "bg-amber-50 text-amber-700 border-amber-100" :
                              "bg-gray-50 text-gray-700 border-gray-200"
                        )}>
                          {activity.program}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-xl border-none overflow-hidden bg-gray-900 p-8">
            <h3 className="text-xl font-black font-montserrat mb-6 uppercase tracking-wider flex items-center gap-2 text-white">
              <TrendingUp className="text-orange-500 w-5 h-5" />
              Administrative
            </h3>
            <div className="grid gap-3">
              <Link
                href="/admin/students/add"
                className="group flex items-center justify-between p-4 bg-white/10 hover:bg-orange-500 text-white rounded-2xl transition-all duration-300"
              >
                <span className="font-bold text-sm tracking-wide">Add Student</span>
                <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/admin/mentors/add"
                className="group flex items-center justify-between p-4 bg-white/10 hover:bg-orange-500 text-white rounded-2xl transition-all duration-300"
              >
                <span className="font-bold text-sm tracking-wide">Assign Mentor</span>
                <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/admin/analytics"
                className="group flex items-center justify-between p-4 bg-white/10 hover:bg-orange-500 text-white rounded-2xl transition-all duration-300"
              >
                <span className="font-bold text-sm tracking-wide">View Analytics</span>
                <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/admin/students/import"
                className="group flex items-center justify-between p-4 bg-white/10 hover:bg-orange-500 text-white rounded-2xl transition-all duration-300"
              >
                <span className="font-bold text-sm tracking-wide">Bulk Import</span>
                <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </Card>

          <Card className="rounded-2xl shadow-lg border-none bg-orange-50 p-6 border-l-4 border-orange-500">
            <h4 className="font-black text-orange-900 text-sm uppercase tracking-widest mb-2">Notice</h4>
            <p className="text-xs font-medium text-orange-700 leading-relaxed">
              Global programs (G-GMP/G-CMP) currently have 100% capacity. Please review waitlists before adding new students.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

