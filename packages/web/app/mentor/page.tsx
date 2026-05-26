// packages/web/app/mentor/page.tsx

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Users,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  BookOpen,
  ChevronRight,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { useCurrentMentor, useMentorSchedule, useMentorStudents, useMentorDocuments } from '@/hooks/api/useMentor';
import LoaderOne from "@/components/ui/loader-one";

interface RecentActivity {
  id: string;
  type: 'student_joined' | 'document_uploaded' | 'session_completed' | 'assignment_submitted';
  title: string;
  time: string;
  student?: string;
}

export default function MentorDashboard() {
  const { data: mentor, isLoading: mentorLoading } = useCurrentMentor();
  const { data: students = [], isLoading: studentsLoading } = useMentorStudents(mentor?.id);
  const { data: schedule = [], isLoading: scheduleLoading } = useMentorSchedule(mentor?.id);
  const { data: documents = [], isLoading: documentsLoading } = useMentorDocuments();

  const loading = mentorLoading || studentsLoading || scheduleLoading || documentsLoading;

  const stats = useMemo(() => {
    const activeStudents = students.filter((s: any) => s.progress < 100).length;
    const upcomingSessions = schedule.filter((s: any) =>
      new Date(s.date) > new Date() && s.status === 'scheduled'
    ).length;
    const completedSessions = schedule.filter((s: any) => s.status === 'completed').length;
    
    return {
      totalStudents: students.length,
      activeStudents,
      totalDocuments: documents.length,
      upcomingSessions,
      completedSessions,
      pendingAssignments: documents.filter((d: any) =>
        d.type === 'assignment_material' && d.metadata?.dueDate
      ).length,
    };
  }, [students, schedule, documents]);

  const upcomingSessions = useMemo(() => {
    return schedule
      .filter((s: any) => new Date(s.date) > new Date())
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [schedule]);

  const recentDocuments = useMemo(() => {
    return documents
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [documents]);

  const recentActivity = useMemo(() => {
    const activities: RecentActivity[] = [];
    
    documents.forEach((doc: any) => {
      activities.push({
        id: `doc-${doc.id}`,
        type: 'document_uploaded',
        title: `Uploaded ${doc.title}`,
        time: doc.createdAt,
        date: new Date(doc.createdAt)
      } as any);
    });

    schedule.forEach((session: any) => {
      if (session.status === 'completed') {
        activities.push({
          id: `session-comp-${session.id}`,
          type: 'session_completed',
          title: `Completed session with ${session.studentName}`,
          time: session.updatedAt || session.date,
          date: new Date(session.updatedAt || session.date),
          student: session.studentName
        } as any);
      } else if (session.status === 'scheduled') {
        activities.push({
          id: `session-sched-${session.id}`,
          type: 'student_joined',
          title: `Scheduled session with ${session.studentName}`,
          time: session.createdAt || session.date,
          date: new Date(session.createdAt || session.date),
          student: session.studentName
        } as any);
      }
    });

    students.forEach((student: any) => {
      if (student.joinDate) {
        activities.push({
          id: `student-${student.id}`,
          type: 'student_joined',
          title: `New student assigned: ${student.name}`,
          time: student.joinDate,
          date: new Date(student.joinDate),
          student: student.name
        } as any);
      }
    });

    return activities
      .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
      .slice(0, 3)
      .map((activity: any) => ({
        ...activity,
        time: formatDistanceToNow(activity.date, { addSuffix: true })
      }));
  }, [students, schedule, documents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderOne />
      </div>
    );
  }

  const mentorName = mentor?.name || 'Mentor';

  return (
    <div className="space-y-8 p-6 pb-20 bg-gradient-to-br from-white via-orange-50/5 to-white min-h-screen">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-montserrat text-gray-900">Welcome back, {mentorName}!</h1>
          <p className="text-muted-foreground mt-2 text-lg">Here's what's happening with your students today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/mentor/schedule">
            <Button variant="outline" className="font-montserrat font-bold border-orange-200 text-orange-600 hover:bg-orange-50">
              <Calendar className="mr-2 h-4 w-4" /> View Full Schedule
            </Button>
          </Link>
          <Link href="/mentor/documents/upload">
            <Button className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
              <FileText className="mr-2 h-4 w-4" /> Upload Material
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm transition-all hover:translate-y-[-4px] hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
                <Users size={24} />
              </div>
              <div className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest">
                {stats.activeStudents} Active
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground font-montserrat uppercase tracking-wider">My Students</p>
              <p className="text-3xl font-extrabold tracking-tighter">{stats.totalStudents}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm transition-all hover:translate-y-[-4px] hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
                <FileText size={24} />
              </div>
              <div className="px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                {stats.pendingAssignments} Pending
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground font-montserrat uppercase tracking-wider">My Documents</p>
              <p className="text-3xl font-extrabold tracking-tighter">{stats.totalDocuments}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm transition-all hover:translate-y-[-4px] hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                <Calendar size={24} />
              </div>
              <div className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                {stats.completedSessions} Completed
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground font-montserrat uppercase tracking-wider">Sessions</p>
              <p className="text-3xl font-extrabold tracking-tighter">{stats.upcomingSessions}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-xl border-none overflow-hidden bg-card/70 backdrop-blur-md h-full">
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-extrabold tracking-tight font-montserrat">Upcoming Sessions</CardTitle>
                  <CardDescription className="mt-1">Your next scheduled mentoring calls.</CardDescription>
                </div>
                <Link href="/mentor/schedule" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center transition-colors">
                  View all <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 border-2 border-dashed rounded-2xl">
                  <Calendar size={40} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">No upcoming sessions</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {upcomingSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 bg-white/50 hover:bg-white rounded-2xl border border-transparent hover:border-orange-100 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 font-montserrat">{session.studentName}</p>
                          <p className="text-sm text-gray-500 font-medium">{session.topic}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900">{new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">{session.startTime} - {session.endTime}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-xl border-none overflow-hidden bg-gray-900 p-8">
            <h2 className="text-xl font-black font-montserrat mb-6 uppercase tracking-wider flex items-center gap-2 text-white">
              <TrendingUp className="text-orange-500 w-5 h-5" />
              Quick Actions
            </h2>
            <div className="grid gap-3">
              <Link
                href="/mentor/documents/upload"
                className="group flex items-center justify-between p-4 bg-white/10 hover:bg-orange-500 rounded-2xl transition-all duration-300 text-white"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-orange-500 group-hover:text-white" />
                  <span className="font-bold text-sm tracking-wide">Upload Material</span>
                </div>
                <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/mentor/schedule"
                className="group flex items-center justify-between p-4 bg-white/10 hover:bg-orange-500 rounded-2xl transition-all duration-300 text-white"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-orange-500 group-hover:text-white" />
                  <span className="font-bold text-sm tracking-wide">Weekly Schedule</span>
                </div>
                <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/mentor/students"
                className="group flex items-center justify-between p-4 bg-white/10 hover:bg-orange-500 rounded-2xl transition-all duration-300 text-white"
              >
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-orange-500 group-hover:text-white" />
                  <span className="font-bold text-sm tracking-wide">My Students</span>
                </div>
                <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </Card>

          {/* Activity Mini-View */}
          <Card className="rounded-2xl shadow-lg border-none bg-white p-6">
            <h2 className="text-lg font-black font-montserrat mb-4 text-gray-900">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className={cn(
                    "w-2 mt-1.5 h-2 rounded-full shrink-0",
                    activity.type === 'student_joined' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" :
                      activity.type === 'document_uploaded' ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" :
                        "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  )} />
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-tight">{activity.title}</p>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Documents Section */}
      <Card className="rounded-2xl shadow-xl border-none overflow-hidden bg-card/70 backdrop-blur-md">
        <CardHeader className="p-8 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-extrabold tracking-tight font-montserrat">Recent Documents</CardTitle>
              <CardDescription className="mt-1">Learning materials and assignments shared with students.</CardDescription>
            </div>
            <Link href="/mentor/documents" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center transition-colors">
              View all <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {recentDocuments.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 border-2 border-dashed rounded-2xl">
              <FileText size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 font-medium mb-4">No documents yet</p>
              <Link href="/mentor/documents/upload">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">
                  Upload First Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="group p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-50 group-hover:bg-orange-50 rounded-xl transition-colors">
                      <FileText size={20} className="text-gray-400 group-hover:text-orange-500" />
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" title="Preview">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" title="Download">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">{doc.title}</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {doc.type === 'learning_material' ? 'Learning' : doc.type === 'assignment_material' ? 'Assignment' : 'Pre-Reading'}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                      <ChevronRight size={14} className="text-orange-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
