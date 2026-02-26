'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Mail,
  Calendar,
  Award,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react';
import { ApiService } from '@/services/api';

interface StudentDetails {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  program: string;
  track: string;
  mentor: string;
  status: string;
  joinDate: string;
  lastActive: string;
  phone?: string; // Make optional
  address?: string; // Make optional
  avatar?: string; // Make optional
  progress: number;
  outcomes: {
    patents: number;
    papers: number;
    projects: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get current tab from URL
  const currentTab = pathname.split('/').pop() || 'overview';
  const validTabs = ['overview', 'progress', 'outcomes', 'activity', 'settings'];
  const activeTab = validTabs.includes(currentTab) ? currentTab : 'overview';
  
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await ApiService.getStudentById(params.id as string);
        if (data) {
          const [outcomes, activities] = await Promise.all([
            ApiService.getOutcomes({ studentId: data.id }),
            ApiService.getRecentActivities(5)
          ]);
          
          setStudent({
            ...data,
            phone: data.phone || '', // Provide default empty string
            address: data.address || '',
            avatar: data.avatar,
            outcomes: {
              patents: outcomes.filter(o => o.type === 'patent').length,
              papers: outcomes.filter(o => o.type === 'paper').length,
              projects: outcomes.filter(o => o.type === 'project').length,
            },
            recentActivity: activities
              .filter(a => a.userId === data.id)
              .map(a => ({
                id: a.id,
                type: a.type,
                description: a.description,
                date: a.date || new Date().toISOString().split('T')[0],
              })),
          });
        }
      } catch (error) {
        console.error('Error fetching student:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Student not found</h2>
        <Link
          href="/admin/students"
          className="text-primary-600 hover:text-primary-700"
        >
          Back to Students
        </Link>
      </div>
    );
  }

  // Rest of the component remains the same...
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/students"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-500">{student.registrationNumber}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Mail size={18} className="mr-2" />
            Send Email
          </button>
          <Link
            href={`/admin/students/${student.id}/edit`}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Edit size={18} className="mr-2" />
            Edit Student
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
          student.status === 'active' ? 'bg-green-100 text-green-700' :
          student.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {student.status}
        </span>
        <span className="text-sm text-gray-500 flex items-center">
          <Calendar size={16} className="mr-1" />
          Joined {new Date(student.joinDate).toLocaleDateString()}
        </span>
        <span className="text-sm text-gray-500 flex items-center">
          <Clock size={16} className="mr-1" />
          Last active {new Date(student.lastActive).toLocaleDateString()}
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <Link
            href={`/admin/students/${params.id}`}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </Link>
          <Link
            href={`/admin/students/${params.id}/progress`}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === 'progress'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Progress
          </Link>
          <Link
            href={`/admin/students/${params.id}/outcomes`}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === 'outcomes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Outcomes
          </Link>
          <Link
            href={`/admin/students/${params.id}/activity`}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === 'activity'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity
          </Link>
          <Link
            href={`/admin/students/${params.id}/settings`}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === 'settings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </Link>
        </nav>
      </div>

      {/* Tab Content - Render based on URL */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">{student.progress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary-600 rounded-full h-2"
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Program</p>
                <p className="text-lg font-semibold text-gray-900">{student.program}</p>
                <p className="text-sm text-gray-500 mt-1">{student.track}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Mentor</p>
                <p className="text-lg font-semibold text-gray-900">{student.mentor}</p>
                <p className="text-sm text-primary-600 mt-1 cursor-pointer">View Profile</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{student.phone || 'Not provided'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">{student.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Outcomes Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Outcomes</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award size={18} className="text-purple-500 mr-2" />
                    <span>Patents</span>
                  </div>
                  <span className="font-semibold">{student.outcomes.patents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText size={18} className="text-green-500 mr-2" />
                    <span>Papers</span>
                  </div>
                  <span className="font-semibold">{student.outcomes.papers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp size={18} className="text-primary-500 mr-2" />
                    <span>Projects</span>
                  </div>
                  <span className="font-semibold">{student.outcomes.projects}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {student.recentActivity.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    {activity.type === 'progress' && (
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TrendingUp size={12} className="text-primary-600" />
                      </div>
                    )}
                    {activity.type === 'outcome' && (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Award size={12} className="text-green-600" />
                      </div>
                    )}
                    {activity.type === 'session' && (
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={12} className="text-purple-600" />
                      </div>
                    )}
                    {activity.type === 'enrollment' && (
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users size={12} className="text-yellow-600" />
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Progress Tracking</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Weekly Progress</p>
                <p className="text-sm text-gray-500">Week 12 - Mar 15 to Mar 21</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">85%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Module Completion</p>
                <p className="text-sm text-gray-500">Patent Drafting Module</p>
              </div>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">In Progress</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Mentor Sessions</p>
                <p className="text-sm text-gray-500">8 sessions completed</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">75%</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'outcomes' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Outcomes Portfolio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Award size={20} className="text-purple-500 mr-2" />
                <h4 className="font-medium">Patents</h4>
              </div>
              <p className="text-sm text-gray-600">{student?.outcomes.patents} filed • 0 granted</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <FileText size={20} className="text-green-500 mr-2" />
                <h4 className="font-medium">Research Papers</h4>
              </div>
              <p className="text-sm text-gray-600">{student?.outcomes.papers} published</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
          <div className="space-y-4">
            {student?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 border-b border-gray-100 pb-4 last:border-0">
                <div className="flex-shrink-0">
                  {activity.type === 'progress' && (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <TrendingUp size={16} className="text-primary-600" />
                    </div>
                  )}
                  {activity.type === 'outcome' && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Award size={16} className="text-green-600" />
                    </div>
                  )}
                  {activity.type === 'session' && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock size={16} className="text-purple-600" />
                    </div>
                  )}
                  {activity.type === 'enrollment' && (
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-yellow-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Student Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-gray-500">Manage student account status</p>
              </div>
              <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                Deactivate Account
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Reset Progress</p>
                <p className="text-sm text-gray-500">Clear all progress data</p>
              </div>
              <button className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}