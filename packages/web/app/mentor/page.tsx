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
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

import { useCurrentMentor, useMentorSchedule, useMentorStudents, useMentorDocuments } from '@/hooks/api/useMentor';
import DocumentViewer from '@/components/common/DocumentViewer';
import { DocumentViewerService } from '@/services/documentViewerService';
import { FileHandlerService } from '@/services/fileHandlerService';

interface ViewerDocument {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
}

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
  
  const [selectedDocument, setSelectedDocument] = useState<ViewerDocument | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  const loading = mentorLoading || studentsLoading || scheduleLoading || documentsLoading;

  const handleView = async (doc: any) => {
    setSelectedDocument({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
    });
    setShowViewer(true);
    
    if (mentor?.id) {
      await DocumentViewerService.trackView(doc.id, mentor.id, 'mentor');
    }
  };

  const handleDownload = async (doc: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (mentor?.id) {
        await DocumentViewerService.trackDownload(doc.id, mentor.id, 'mentor');
      }
      
      await FileHandlerService.downloadFile({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

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

  const chartData = useMemo(() => {
    // 1. Student Progress
    let notStarted = 0;
    let inProgress = 0;
    let completed = 0;
    
    students.forEach((s: any) => {
      const progress = s.progress || 0;
      if (progress === 0) notStarted++;
      else if (progress < 100) inProgress++;
      else completed++;
    });

    const studentProgressData = [
      { name: 'Completed (100%)', value: completed, color: '#22c55e' }, // green-500
      { name: 'In Progress (1-99%)', value: inProgress, color: '#f97316' }, // orange-500
      { name: 'Not Started (0%)', value: notStarted, color: '#94a3b8' }, // slate-400
    ].filter(d => d.value > 0);

    // 2. Document Types
    const typeCount: Record<string, number> = {};
    documents.forEach((d: any) => {
      const type = d.type === 'learning_material' ? 'Learning' : 
                   d.type === 'assignment_material' ? 'Assignment' : 
                   d.type === 'pre_reading_material' ? 'Pre-Reading' : 'Other';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const documentTypeData = Object.entries(typeCount).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);

    const documentColors = ['#f97316', '#3b82f6', '#8b5cf6', '#eab308']; // orange, blue, purple, yellow

    // 3. Sessions
    const sessionCount: Record<string, number> = {
      Scheduled: 0,
      Completed: 0,
      Cancelled: 0,
    };
    
    schedule.forEach((s: any) => {
      const status = s.status === 'scheduled' ? 'Scheduled' :
                     s.status === 'completed' ? 'Completed' :
                     s.status === 'cancelled' ? 'Cancelled' : 'Other';
      if (sessionCount[status] !== undefined) {
        sessionCount[status]++;
      } else {
        sessionCount[status] = 1;
      }
    });

    const sessionStatusData = Object.entries(sessionCount).map(([name, count]) => ({
      name,
      count
    }));

    return { studentProgressData, documentTypeData, documentColors, sessionStatusData };
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
            <Button variant="outline" className="font-montserrat font-bold border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-500">
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Progress Chart */}
        <Card className="border-none shadow-md bg-white transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-extrabold font-montserrat">Student Progress</CardTitle>
            <CardDescription>Distribution of student completion</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {chartData.studentProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.studentProgressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.studentProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} Students`, '']}
                    separator=""
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No student data available</div>
            )}
          </CardContent>
        </Card>

        {/* Document Types Chart */}
        <Card className="border-none shadow-md bg-white transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-extrabold font-montserrat">Materials Posted</CardTitle>
            <CardDescription>Breakdown of shared materials</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {chartData.documentTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.documentTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return percent > 0.05 ? (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      ) : null;
                    }}
                  >
                    {chartData.documentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartData.documentColors[index % chartData.documentColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} Documents`, '']}
                    separator=""
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No document data available</div>
            )}
          </CardContent>
        </Card>

        {/* Session Status Chart */}
        <Card className="border-none shadow-md bg-white transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-extrabold font-montserrat">Session Overview</CardTitle>
            <CardDescription>Status of all mentor sessions</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {chartData.sessionStatusData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.sessionStatusData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: any) => [`${value} Sessions`, '']}
                    separator=""
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.sessionStatusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'Completed' ? '#22c55e' : entry.name === 'Scheduled' ? '#e55a2b' : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No session data available</div>
            )}
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
          <Card className="rounded-2xl shadow-xl border-none overflow-hidden bg-white p-8">
            <h2 className="text-xl font-black font-montserrat mb-6 uppercase tracking-wider flex items-center gap-2 text-gray-900">
              <TrendingUp className="text-orange-500 w-5 h-5" />
              Quick Actions
            </h2>
            <div className="grid gap-3">
              <Link
                href="/mentor/documents/upload"
                className="group flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all duration-300 text-gray-900 shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-all">
                    <FileText size={20} className="text-orange-500" />
                  </div>
                  <span className="font-bold text-sm tracking-wide">Upload Material</span>
                </div>
                <ChevronRight size={18} className="text-orange-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/mentor/schedule"
                className="group flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all duration-300 text-gray-900 shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-all">
                    <Calendar size={20} className="text-orange-500" />
                  </div>
                  <span className="font-bold text-sm tracking-wide">Weekly Schedule</span>
                </div>
                <ChevronRight size={18} className="text-orange-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/mentor/students"
                className="group flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all duration-300 text-gray-900 shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-all">
                    <Users size={20} className="text-orange-500" />
                  </div>
                  <span className="font-bold text-sm tracking-wide">My Students</span>
                </div>
                <ChevronRight size={18} className="text-orange-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
                <div key={doc.id} className="group p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-100 transition-all cursor-pointer" onClick={() => handleView(doc)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gray-50 group-hover:bg-orange-50 rounded-xl transition-colors">
                      <FileText size={20} className="text-gray-400 group-hover:text-orange-500" />
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleView(doc); }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" 
                        title="Preview"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDownload(doc, e)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors" 
                        title="Download"
                      >
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

      {/* Document Viewer Modal */}
      {showViewer && (
        <DocumentViewer
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      )}
    </div>
  );
}
