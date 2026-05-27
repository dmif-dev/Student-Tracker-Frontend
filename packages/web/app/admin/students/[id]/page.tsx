// packages/web/app/admin/students/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Users,
  BookOpen,
  Code,
  Brain,
  GraduationCap,
  Info,
  Briefcase // Add this import
} from 'lucide-react';
import { 
  useAdminStudent, 
  useSystemActivities, 
  useAdminOutcomes,
  useAdminStudentProgress,
  useAdminStudentProgressStats,
  useAdminStudentSessions,
  useUpdateStudent,
  useToggleStudentStatus,
  useResetStudentProgress
} from '@/hooks/api/useAdmin';
import { Outcome } from '@/services/mockData';
import LoaderOne from "@/components/ui/loader-one";

interface StudentDetails {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  program: string;
  track: string;
  mentor?: string;
  status: string;
  joinDate: string;
  lastActive: string;
  phone?: string;
  address?: string;
  notes?: string;
  avatar?: string;
  progress: number;
  // Outcomes only for G-GMP students
  outcomes?: {
    patents?: number;
    papers?: number;
    projects?: number;
    startups?: number;
  };
  // For G-CMP students
  projects?: {
    completed: number;
    inProgress: number;
  };
  // For PCP students
  certifications?: {
    completed: number;
    inProgress: number;
  };
  sessionStats?: {
    completed: number;
    total: number;
    attendance: number;
  };
  accountActive?: boolean;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'outcomes' | 'activity' | 'settings'>('overview');
  
  const studentId = params.id as string;
  const { data: baseStudent, isLoading: studentLoading } = useAdminStudent(studentId);
  const { data: activities = [], isLoading: activitiesLoading } = useSystemActivities(20);
  const { data: outcomes = [], isLoading: outcomesLoading } = useAdminOutcomes(studentId);
  const { data: progressData = [], isLoading: progressLoading } = useAdminStudentProgress(studentId);
  const { data: progressStats, isLoading: progressStatsLoading } = useAdminStudentProgressStats(studentId);
  const { data: sessionsData = [], isLoading: sessionsLoading } = useAdminStudentSessions(studentId);
  const toggleStatusMutation = useToggleStudentStatus();
  const resetProgressMutation = useResetStudentProgress();
  
  const loading = studentLoading || activitiesLoading || outcomesLoading || progressLoading || progressStatsLoading || sessionsLoading;

  const handleStatusToggle = () => {
    if (!student) return;
    toggleStatusMutation.mutate(studentId);
  };

  const handleResetProgress = () => {
    if (!student) return;
    if (window.confirm('Are you sure you want to reset this student\'s progress to 0%?')) {
      resetProgressMutation.mutate(studentId);
    }
  };
  
  const student: StudentDetails | null = baseStudent ? {
    ...baseStudent,
    phone: baseStudent.phone || '',
    address: baseStudent.address || '',
    notes: baseStudent.notes || '',
    avatar: baseStudent.avatar,
    recentActivity: activities
      .filter((a: any) => a.userId === baseStudent.id || a.user === baseStudent.name)
      .map((a: any) => ({
        id: a.id,
        type: a.type,
        description: a.description || a.title || 'Action performed',
        date: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : a.time || new Date().toISOString().split('T')[0],
      })),
  } : null;

  if (student) {
    if (student.program === 'G-GMP') {
      student.outcomes = {
        patents: outcomes.filter((o: any) => o.type === 'patent').length,
        papers: outcomes.filter((o: any) => o.type === 'paper').length,
        projects: 0,
        startups: outcomes.filter((o: any) => o.type === 'startup').length,
      };
    }
  }

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700',
      'G-CMP': 'bg-green-100 text-green-700',
      'E-TIP': 'bg-blue-100 text-blue-700',
      'PCP': 'bg-orange-100 text-orange-700'
    };
    return colors[program as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getProgramIcon = (program: string) => {
    switch (program) {
      case 'G-GMP':
        return <Brain size={20} className="text-purple-500" />;
      case 'G-CMP':
        return <Code size={20} className="text-green-500" />;
      case 'E-TIP':
        return <Award size={20} className="text-blue-500" />;
      case 'PCP':
        return <GraduationCap size={20} className="text-orange-500" />;
      default:
        return <BookOpen size={20} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderOne />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Student not found</h2>
        <Link
          href="/admin/students"
          className="text-orange-600 hover:text-orange-700"
        >
          Back to Students
        </Link>
      </div>
    );
  }

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
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProgramColor(student.program)}`}>
                {student.program}
              </span>
            </div>
            <p className="text-gray-500">{student.registrationNumber}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <a 
            href={`mailto:${student.email}`}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail size={18} className="mr-2" />
            Send Email
          </a>
          <Link
            href={`/admin/students/${student.id}/edit`}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Edit size={18} className="mr-2" />
            Edit Student
          </Link>
        </div>
      </div>

      {/* Program Info Note */}
      <div className={`p-4 rounded-lg ${
        student.program === 'G-GMP' ? 'bg-purple-50 border-purple-200' :
        student.program === 'G-CMP' ? 'bg-green-50 border-green-200' :
        student.program === 'E-TIP' ? 'bg-blue-50 border-blue-200' :
        'bg-orange-50 border-orange-200'
      } border`}>
        <div className="flex items-start space-x-3">
          {getProgramIcon(student.program)}
          <div>
            <p className="text-sm font-medium">
              {student.program} Program - {
                student.program === 'G-GMP' ? 'Innovation & Outcomes Tracked' :
                student.program === 'G-CMP' ? 'Coding Learning Program' :
                student.program === 'E-TIP' ? 'Executive Learning Program' :
                'Self-paced Certification Program'
              }
            </p>
            <p className="text-xs mt-1">
              {student.program === 'G-GMP' ? 'This program tracks patents, papers, and startup outcomes.' :
               student.program === 'G-CMP' ? 'This program focuses on coding skills and project completion.' :
               student.program === 'E-TIP' ? 'This program focuses on executive technology leadership.' :
               'This program focuses on self-paced certification completion.'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
          student.status === 'active' ? 'bg-green-100 text-green-700' :
          student.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          student.status === 'completed' ? 'bg-indigo-100 text-indigo-700' :
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
          {(['overview', 'progress', ...(student.program === 'G-GMP' ? ['outcomes'] : []), 'activity', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
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
                    className={`rounded-full h-2 ${
                      student.program === 'G-GMP' ? 'bg-purple-600' :
                      student.program === 'G-CMP' ? 'bg-green-600' :
                      student.program === 'E-TIP' ? 'bg-blue-600' :
                      'bg-orange-600'
                    }`}
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
                {student.program === 'PCP' ? (
                  <p className="text-lg font-semibold text-gray-400">Self-paced</p>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-gray-900">{student.mentor || 'Not assigned'}</p>
                    {student.mentor && (
                      <p className="text-sm text-orange-600 mt-1 cursor-pointer">View Profile</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Program-specific Achievement Cards */}
            {student.program === 'G-GMP' && student.outcomes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Innovation Outcomes</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <FileText size={24} className="mx-auto text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-purple-700">{student.outcomes.patents || 0}</p>
                    <p className="text-xs text-purple-600">Patents Filed</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <BookOpen size={24} className="mx-auto text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-700">{student.outcomes.papers || 0}</p>
                    <p className="text-xs text-blue-600">Papers Published</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <Briefcase size={24} className="mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-700">{student.outcomes.startups || 0}</p>
                    <p className="text-xs text-green-600">Startup Concepts</p>
                  </div>
                </div>
              </div>
            )}

            {student.program === 'G-CMP' && student.projects && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 mb-1">Completed Projects</p>
                    <p className="text-3xl font-bold text-green-700">{student.projects.completed}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-yellow-700">{student.projects.inProgress}</p>
                  </div>
                </div>
              </div>
            )}

            {student.program === 'PCP' && student.certifications && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Certification Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-orange-700">{student.certifications.completed}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-yellow-700">{student.certifications.inProgress}</p>
                  </div>
                </div>
              </div>
            )}

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
                {student.notes && (
                  <div className="col-span-2 mt-2 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-semibold mb-1">Additional Notes</p>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {student.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Program Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Program Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getProgramIcon(student.program)}
                    <span className="ml-2">Program Type</span>
                  </div>
                  <span className="font-semibold">
                    {student.program === 'G-GMP' ? 'Innovation' :
                     student.program === 'G-CMP' ? 'Coding' :
                     student.program === 'E-TIP' ? 'Executive' :
                     'Certification'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp size={18} className="text-gray-500 mr-2" />
                    <span>Track</span>
                  </div>
                  <span className="font-semibold">{student.track}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock size={18} className="text-gray-500 mr-2" />
                    <span>Duration</span>
                  </div>
                  <span className="font-semibold">
                    {student.program === 'PCP' ? 'Self-paced' : '6-12 months'}
                  </span>
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
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TrendingUp size={12} className="text-orange-600" />
                      </div>
                    )}
                    {activity.type === 'outcome' && student.program === 'G-GMP' && (
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Award size={12} className="text-purple-600" />
                      </div>
                    )}
                    {activity.type === 'session' && (
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={12} className="text-blue-600" />
                      </div>
                    )}
                    {activity.type === 'completion' && (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle size={12} className="text-green-600" />
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
                <p className="font-medium">Total Progress</p>
                <p className="text-sm text-gray-500">Based on system metrics</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{student.progress}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Module Completion</p>
                <p className="text-sm text-gray-500">{student.track}</p>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                {student.progress >= 100 ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Mentor Sessions</p>
                <p className="text-sm text-gray-500">{student.program === 'PCP' ? 'Self-paced' : `${student.sessionStats?.completed || 0} sessions completed`}</p>
              </div>
              {student.program !== 'PCP' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{student.sessionStats?.attendance || 0}%</span>
              )}
            </div>
          </div>

          {/* Daily Progress Logs Timeline */}
          <div className="mt-8">
            <h4 className="text-md font-semibold mb-4 flex items-center">
              <Clock className="mr-2 text-orange-500" size={18} />
              Daily Progress Logs ({progressData?.length || 0})
            </h4>
            {progressData && progressData.length > 0 ? (
              <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {progressData.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.topic}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.hoursSpent} hrs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.attendanceStatus === 'PRESENT' ? 'bg-green-100 text-green-800' :
                            item.attendanceStatus === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.attendanceStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.performanceRating ? `${item.performanceRating}/5 ⭐` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={item.notes}>
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-gray-500">
                No progress log entries recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'outcomes' && student.program === 'G-GMP' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Outcomes Portfolio</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <FileText size={20} className="text-purple-500 mr-2" />
                <h4 className="font-medium">Patents</h4>
              </div>
              <p className="text-2xl font-bold text-purple-600">{student.outcomes?.patents || 0}</p>
              <p className="text-sm text-gray-500">filed</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <BookOpen size={20} className="text-blue-500 mr-2" />
                <h4 className="font-medium">Research Papers</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600">{student.outcomes?.papers || 0}</p>
              <p className="text-sm text-gray-500">published</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Briefcase size={20} className="text-green-500 mr-2" />
                <h4 className="font-medium">Startup Concepts</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">{student.outcomes?.startups || 0}</p>
              <p className="text-sm text-gray-500">developed</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
          <div className="space-y-4">
            {student.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 border-b border-gray-100 pb-4 last:border-0">
                <div className="flex-shrink-0">
                  {activity.type === 'progress' && (
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp size={16} className="text-orange-600" />
                    </div>
                  )}
                  {activity.type === 'outcome' && student.program === 'G-GMP' && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award size={16} className="text-purple-600" />
                    </div>
                  )}
                  {activity.type === 'session' && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock size={16} className="text-blue-600" />
                    </div>
                  )}
                  {activity.type === 'completion' && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600" />
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
                <p className="text-sm text-gray-500">
                  Current status: <span className="font-semibold capitalize text-orange-600">{student.status}</span>
                </p>
              </div>
              <button 
                onClick={handleStatusToggle}
                disabled={toggleStatusMutation.isPending}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  student.accountActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {toggleStatusMutation.isPending 
                  ? 'Updating...' 
                  : student.accountActive 
                    ? 'Deactivate Account' 
                    : 'Activate Account'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Reset Progress</p>
                <p className="text-sm text-gray-500">Clear and reset progress percentage to 0%</p>
              </div>
              <button 
                onClick={handleResetProgress}
                disabled={resetProgressMutation.isPending}
                className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors font-medium disabled:opacity-50"
              >
                {resetProgressMutation.isPending ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}