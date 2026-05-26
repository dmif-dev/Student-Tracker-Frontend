// packages/web/app/admin/programs/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Download,
  Edit,
  BarChart3,
  Clock,
  CheckCircle,
  Target,
  Brain,
  Code,
  GraduationCap,
  BookOpen,
  FileText,
  Briefcase,
  UserCheck,
  Activity,
  PieChart,
  Star,
  ChevronRight
} from 'lucide-react';
import { ApiService } from '@/services/api';
import LoaderOne from '@/components/ui/loader-one';
import { Activity as ActivityType } from '@/services/mockData';

interface ProgramDetails {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tracks: Track[];
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  hasMentors: boolean;
  hasOutcomes: boolean;
  outcomeCount?: number;
  duration?: string;
  schedule?: {
    dayOfWeek: string;
    time: string;
  };
}

interface Track {
  id: string;
  name: string;
  description?: string;
  students: number;
  mentors: number;
  progress: number;
  outcomes: number;
  requiresMentor: boolean;
}

interface LocalActivity {
  id: string;
  type: string;
  description: string;
  user: string;
  time: string;
}

interface Outcome {
  id: string;
  type: string;
  title: string;
  student: string;
  date: string;
  status: string;
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [recentActivity, setRecentActivity] = useState<LocalActivity[]>([]);
  const [recentOutcomes, setRecentOutcomes] = useState<Outcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'outcomes' | 'students'>('overview');

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const data = await ApiService.getProgramById(params.id as string);
        if (data) {
          const metrics = await ApiService.getProgramMetrics(params.id as string);
          const activities = await ApiService.getRecentActivities(5);
          
          // Filter activities for this program and map to LocalActivity type
          const programActivities = activities
            .filter(a => a.program === data.name)
            .map(a => ({
              id: a.id,
              type: a.type,
              description: a.description,
              user: a.user || 'System',
              time: a.time,
            }));
          
          // Mock recent outcomes for G-GMP and PCP
          let outcomes: Outcome[] = [];
          if (data.hasOutcomes) {
            if (data.id === 'g-gmp') {
              outcomes = [
                { id: '1', type: 'patent', title: 'AI-based Patent Search System', student: 'John Doe', date: '2024-03-20', status: 'filed' },
                { id: '2', type: 'paper', title: 'Advances in Agentic AI Systems', student: 'Jane Smith', date: '2024-03-15', status: 'published' },
                { id: '3', type: 'startup', title: 'AI-powered Education Platform', student: 'John Doe', date: '2024-03-18', status: 'pending' },
              ];
            } else if (data.id === 'pcp') {
              outcomes = [
                { id: '4', type: 'certification', title: 'Agentic AI Specialist', student: 'Sarah Wilson', date: '2024-03-05', status: 'completed' },
                { id: '5', type: 'certification', title: 'AI Product Development Professional', student: 'Emily Brown', date: '2024-02-28', status: 'completed' },
              ];
            }
          }
          
          setProgram({
            ...data,
            ...metrics,
            schedule: data.id === 'g-gmp' ? { dayOfWeek: 'Mondays', time: '10:00 AM' } :
                     data.id === 'g-cmp' ? { dayOfWeek: 'Wednesdays', time: '2:00 PM' } :
                     data.id === 'e-tip' ? { dayOfWeek: 'Fridays', time: '11:00 AM' } :
                     undefined,
          });
          setRecentActivity(programActivities);
          setRecentOutcomes(outcomes);
        }
      } catch (error) {
        console.error('Error fetching program:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProgram();
    }
  }, [params.id]);

  const getProgramIcon = () => {
    if (!program) return Brain;
    switch (program.id) {
      case 'g-gmp': return Brain;
      case 'g-cmp': return Code;
      case 'e-tip': return Award;
      case 'pcp': return GraduationCap;
      default: return BookOpen;
    }
  };

  const getProgramColor = () => {
    if (!program) return 'primary';
    switch (program.id) {
      case 'g-gmp': return 'purple';
      case 'g-cmp': return 'green';
      case 'e-tip': return 'blue';
      case 'pcp': return 'orange';
      default: return 'primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'published':
      case 'granted':
        return 'bg-green-100 text-green-700';
      case 'filed':
        return 'bg-primary-100 text-primary-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getOutcomeIcon = (type: string) => {
    switch (type) {
      case 'patent':
        return <FileText size={16} className="text-purple-500" />;
      case 'paper':
        return <BookOpen size={16} className="text-blue-500" />;
      case 'startup':
        return <Briefcase size={16} className="text-green-500" />;
      case 'certification':
        return <Award size={16} className="text-orange-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderOne />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Program not found</h2>
        <Link
          href="/admin/programs"
          className="text-primary-600 hover:text-primary-700"
        >
          Back to Programs
        </Link>
      </div>
    );
  }

  const Icon = getProgramIcon();
  const color = getProgramColor();
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/programs"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
              <Icon size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
              <p className="text-gray-500 mt-1">{program.description}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} className="mr-2" />
            Export Report
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Edit size={18} className="mr-2" />
            Edit Program
          </button>
        </div>
      </div>

      {/* Program Type Banner */}
      <div className={`p-4 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">
              {program.id === 'g-gmp' ? '🎯 Innovation Program' :
               program.id === 'g-cmp' ? '💻 Coding Program' :
               program.id === 'e-tip' ? '👔 Executive Program' :
               '📜 Certification Program'}
            </h3>
            <p className="text-sm mt-1">
              {program.id === 'g-gmp' ? 'Tracks patents, research papers, and startup concepts' :
               program.id === 'g-cmp' ? 'Focus on coding skills and project completion' :
               program.id === 'e-tip' ? 'Executive technology leadership training' :
               'Self-paced professional certifications'}
            </p>
          </div>
          {program.schedule && (
            <div className="flex items-center space-x-2 bg-white/50 px-3 py-1 rounded-full">
              <Calendar size={14} />
              <span className="text-sm">Sessions: {program.schedule.dayOfWeek} at {program.schedule.time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tracks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tracks'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tracks ({program.tracks.length})
          </button>
          {program.hasOutcomes && (
            <button
              onClick={() => setActiveTab('outcomes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'outcomes'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {program.id === 'g-gmp' ? 'Outcomes' : 'Certifications'}
            </button>
          )}
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Students
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Users size={20} className="text-primary-500" />
                <span className="text-xs text-green-600">
                  {Math.round((program.activeStudents / program.totalStudents) * 100)}% active
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{program.totalStudents}</p>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-xs text-gray-400 mt-2">{program.activeStudents} active</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={20} className="text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{program.completionRate}%</p>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className={`rounded-full h-1.5 ${
                    program.id === 'g-gmp' ? 'bg-purple-500' :
                    program.id === 'pcp' ? 'bg-orange-500' :
                    'bg-primary-500'
                  }`}
                  style={{ width: `${program.completionRate}%` }}
                />
              </div>
            </div>

            {program.hasMentors && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <UserCheck size={20} className="text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {program.id === 'g-gmp' ? '18' : 
                   program.id === 'g-cmp' ? '19' : 
                   program.id === 'e-tip' ? '10' : '0'}
                </p>
                <p className="text-sm text-gray-600">Active Mentors</p>
                <p className="text-xs text-gray-400 mt-2">
                  Avg {Math.round(program.totalStudents / (program.id === 'g-gmp' ? 18 : program.id === 'g-cmp' ? 19 : 10))} students per mentor
                </p>
              </div>
            )}

            {program.hasOutcomes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  {program.id === 'g-gmp' ? (
                    <Target size={20} className="text-purple-500" />
                  ) : (
                    <Award size={20} className="text-orange-500" />
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">{program.outcomeCount}</p>
                <p className="text-sm text-gray-600">
                  {program.id === 'g-gmp' ? 'Total Outcomes' : 'Certifications'}
                </p>
                {program.id === 'g-gmp' && (
                  <p className="text-xs text-gray-400 mt-2">
                    12 patents • 15 papers • 8 startups
                  </p>
                )}
                {program.id === 'pcp' && (
                  <p className="text-xs text-gray-400 mt-2">
                    25 associate • 12 specialist • 5 professional
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Program Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">About the Program</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{program.duration || (program.id === 'pcp' ? 'Self-paced' : '6-12 months')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tracks</p>
                    <p className="font-medium">{program.tracks.length} specialized tracks</p>
                  </div>
                  {program.schedule && (
                    <div>
                      <p className="text-sm text-gray-500">Weekly Sessions</p>
                      <p className="font-medium">{program.schedule.dayOfWeek} at {program.schedule.time}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Mentor Required</p>
                    <p className="font-medium">{program.hasMentors ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Track Progress */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Track Performance</h3>
                <div className="space-y-4">
                  {program.tracks.map((track) => (
                    <div key={track.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{track.name}</span>
                        <span className="text-sm text-gray-600">{track.progress}%</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`rounded-full h-2 ${
                              program.id === 'g-gmp' ? 'bg-purple-500' :
                              program.id === 'pcp' ? 'bg-orange-500' :
                              'bg-primary-500'
                            }`}
                            style={{ width: `${track.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {track.students} students
                        </span>
                      </div>
                      {program.hasOutcomes && (
                        <div className="flex items-center space-x-2 text-xs">
                          {track.outcomes > 0 && (
                            <span className={`px-2 py-0.5 rounded-full ${
                              program.id === 'g-gmp' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {track.outcomes} {program.id === 'g-gmp' ? 'outcomes' : 'certifications'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Students</span>
                    <span className="font-semibold">{program.activeStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completion Rate</span>
                    <span className="font-semibold">{program.completionRate}%</span>
                  </div>
                  {program.hasMentors && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Student/Mentor Ratio</span>
                      <span className="font-semibold">
                        {Math.round(program.totalStudents / (program.id === 'g-gmp' ? 18 : program.id === 'g-cmp' ? 19 : 10))}:1
                      </span>
                    </div>
                  )}
                  {program.hasOutcomes && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Outcome Rate</span>
                      <span className="font-semibold">
                        {Math.round((program.outcomeCount || 0) / program.totalStudents * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <Activity size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                          <p className="text-xs text-gray-400">by {activity.user}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tracks' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Program Tracks</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Track Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentors</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  {program.hasOutcomes && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {program.id === 'g-gmp' ? 'Outcomes' : 'Certifications'}
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {program.tracks.map((track) => (
                  <tr key={track.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{track.name}</p>
                        {track.description && (
                          <p className="text-xs text-gray-500 mt-1">{track.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{track.students}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{track.mentors}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`rounded-full h-2 ${
                              program.id === 'g-gmp' ? 'bg-purple-500' :
                              program.id === 'pcp' ? 'bg-orange-500' :
                              'bg-primary-500'
                            }`}
                            style={{ width: `${track.progress}%` }}
                          />
                        </div>
                        <span className="text-sm">{track.progress}%</span>
                      </div>
                    </td>
                    {program.hasOutcomes && (
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          program.id === 'g-gmp' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {track.outcomes}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        track.requiresMentor ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {track.requiresMentor ? 'Mentor-led' : 'Self-paced'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'outcomes' && program.hasOutcomes && (
        <div className="space-y-6">
          {/* Outcome Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {program.id === 'g-gmp' ? (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <FileText size={20} className="text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">12</p>
                  <p className="text-sm text-gray-600">Patents Filed</p>
                  <p className="text-xs text-gray-400 mt-2">3 filed this month</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen size={20} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">15</p>
                  <p className="text-sm text-gray-600">Research Papers</p>
                  <p className="text-xs text-gray-400 mt-2">4 published this month</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Briefcase size={20} className="text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">8</p>
                  <p className="text-sm text-gray-600">Startup Concepts</p>
                  <p className="text-xs text-gray-400 mt-2">2 in validation</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Associate Level</p>
                  <p className="text-2xl font-bold text-orange-600">25</p>
                  <p className="text-xs text-gray-400 mt-2">Foundation certifications</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Specialist Level</p>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                  <p className="text-xs text-gray-400 mt-2">Advanced certifications</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 mb-1">Professional Level</p>
                  <p className="text-2xl font-bold text-orange-600">5</p>
                  <p className="text-xs text-gray-400 mt-2">Expert certifications</p>
                </div>
              </>
            )}
          </div>

          {/* Recent Outcomes/Certifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Recent {program.id === 'g-gmp' ? 'Outcomes' : 'Certifications'}
            </h3>
            <div className="space-y-3">
              {recentOutcomes.map((outcome) => (
                <div key={outcome.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getOutcomeIcon(outcome.type)}
                    <div>
                      <p className="text-sm font-medium">{outcome.title}</p>
                      <p className="text-xs text-gray-500">
                        {outcome.student} • {new Date(outcome.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(outcome.status)}`}>
                    {outcome.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link
                href={`/admin/outcomes?program=${program.id}`}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View all {program.id === 'g-gmp' ? 'outcomes' : 'certifications'} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Enrolled Students</h3>
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Student Management</h3>
            <p className="text-gray-500 mb-4">View and manage students enrolled in this program.</p>
            <Link
              href={`/admin/students?program=${program.name}`}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              View All Students
              <ChevronRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}