// packages/web/app/mentor/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { ApiService } from '@/services/api';
import { DocumentService } from '@/services/documentService';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalDocuments: number;
  upcomingSessions: number;
  completedSessions: number;
  pendingAssignments: number;
}

interface RecentActivity {
  id: string;
  type: 'student_joined' | 'document_uploaded' | 'session_completed' | 'assignment_submitted';
  title: string;
  time: string;
  student?: string;
}

export default function MentorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalDocuments: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    pendingAssignments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock mentor ID - replace with actual auth
  const MENTOR_ID = '1';
  const MENTOR_NAME = 'Dr. Smith';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch mentor's students
      const mentor = await ApiService.getMentorById(MENTOR_ID);
      const students = mentor?.assignedStudents || [];
      
      // Fetch mentor's documents
      const documents = await DocumentService.getMentorDocuments(MENTOR_ID);
      
      // Fetch mentor's schedule
      const schedule = await ApiService.getMentorSchedule(MENTOR_ID);
      
      // Calculate stats
      const activeStudents = students.filter((s: any) => s.progress < 100).length;
      const upcomingSessions = schedule.filter((s: any) => 
        new Date(s.date) > new Date() && s.status === 'scheduled'
      ).length;
      const completedSessions = schedule.filter((s: any) => s.status === 'completed').length;
      
      setStats({
        totalStudents: students.length,
        activeStudents,
        totalDocuments: documents.length,
        upcomingSessions,
        completedSessions,
        pendingAssignments: documents.filter((d: any) => 
          d.type === 'assignment_material' && d.metadata?.dueDate
        ).length,
      });

      // Set upcoming sessions (next 3)
      setUpcomingSessions(
        schedule
          .filter((s: any) => new Date(s.date) > new Date())
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3)
      );

      // Set recent documents (last 3)
      setRecentDocuments(
        documents
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
      );

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'student_joined',
          title: 'New student assigned',
          time: '2 hours ago',
          student: 'Robert Kim',
        },
        {
          id: '2',
          type: 'document_uploaded',
          title: 'Uploaded learning material',
          time: '5 hours ago',
        },
        {
          id: '3',
          type: 'session_completed',
          title: 'Completed session with Jane Smith',
          time: '1 day ago',
          student: 'Jane Smith',
        },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {MENTOR_NAME}!</h1>
        <p className="text-primary-100">Here's what's happening with your students today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">My Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              <p className="text-xs text-green-600 mt-2">{stats.activeStudents} active</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">My Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              <p className="text-xs text-orange-600 mt-2">{stats.pendingAssignments} pending assignments</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</p>
              <p className="text-xs text-blue-600 mt-2">{stats.completedSessions} completed</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
            <Link href="/mentor/schedule" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
              View all
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No upcoming sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Users size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{session.studentName}</p>
                      <p className="text-xs text-gray-500">{session.topic}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(session.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{session.startTime} - {session.endTime}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/mentor/documents/upload"
              className="block w-full px-4 py-3 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-center"
            >
              <FileText size={18} className="inline mr-2" />
              Upload New Document
            </Link>
            <Link
              href="/mentor/schedule"
              className="block w-full px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <Calendar size={18} className="inline mr-2" />
              View Schedule
            </Link>
            <Link
              href="/mentor/students"
              className="block w-full px-4 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <Users size={18} className="inline mr-2" />
              View All Students
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {activity.type === 'student_joined' && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-green-600" />
                    </div>
                  )}
                  {activity.type === 'document_uploaded' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText size={16} className="text-blue-600" />
                    </div>
                  )}
                  {activity.type === 'session_completed' && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock size={16} className="text-purple-600" />
                    </div>
                  )}
                  {activity.type === 'assignment_submitted' && (
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <BookOpen size={16} className="text-yellow-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  {activity.student && (
                    <p className="text-xs text-gray-500">{activity.student}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Recent Documents</h2>
            <Link href="/mentor/documents" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
              View all
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-3">No documents yet</p>
              <Link
                href="/mentor/documents/upload"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
              >
                Upload your first document
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                      <p className="text-xs text-gray-500">
                        {doc.type === 'learning_material' && 'Learning Material'}
                        {doc.type === 'assignment_material' && 'Assignment'}
                        {doc.type === 'pre_reading_material' && 'Pre-Reading'}
                        {' • '}
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 hover:bg-gray-200 rounded" title="Preview">
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded" title="Download">
                      <Download size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}