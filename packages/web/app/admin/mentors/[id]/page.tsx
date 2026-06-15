'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Star,
  Users,
  Edit,
  Award,
  Clock,
  Phone,
  MapPin,
  Briefcase,
  Video,
  ChevronRight,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAdminMentor, useDeleteMentor, useAdminMentorSessions, useAdminMentorPerformance } from '@/hooks/api/useAdmin';
import LoaderOne from '@/components/ui/loader-one';
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';

interface MentorDetails {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  students: number;
  programs: string[];
  rating: number;
  status: 'active' | 'inactive';
  joinDate: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatar?: string;
  assignedStudents?: any[];
  availability?: any[];
}

// Add this interface after the imports
interface UpcomingSession {
  id: string;
  studentName: string;
  studentProgram: string;
  studentTrack: string;
  date: string;
  time: string;
  topic: string;
}

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: mentor, isLoading: loading } = useAdminMentor(params.id as string);
  const { data: sessions = [], isLoading: sessionsLoading } = useAdminMentorSessions(params.id as string);
  const { data: performance, isLoading: performanceLoading } = useAdminMentorPerformance(params.id as string);
  
  const deleteMentorMutation = useDeleteMentor();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMentorMutation.mutateAsync(params.id as string);
      router.push('/admin/mentors');
    } catch (error) {
      console.error('Error deleting mentor:', error);
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };



  const upcomingSessions: UpcomingSession[] = sessions
    .filter((s: any) => new Date(s.date) >= new Date(new Date().setHours(0,0,0,0)) && s.status !== 'CANCELLED')
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map((s: any) => ({
      id: s.id,
      studentName: s.student.name,
      studentProgram: s.student?.program?.name || s.student?.program || 'Unknown',
      studentTrack: s.student?.track?.name || s.student?.track || 'Unknown',
      date: new Date(s.date).toLocaleDateString(),
      time: `${s.startTime} - ${s.endTime}`,
      topic: s.topic
    }));

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700',
      'G-CMP': 'bg-green-100 text-green-700',
      'E-TIP': 'bg-blue-100 text-blue-700',
      'PCP': 'bg-orange-100 text-orange-700'
    };
    return colors[program as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getProgramBadge = (program: string) => {
    if (program === 'PCP') {
      return <span className="text-xs text-gray-500">(No weekly meetings)</span>;
    }
    return <span className="text-xs text-green-600">Weekly meetings</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderOne />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mentor not found</h2>
        <Link
          href="/admin/mentors"
          className="text-orange-600 hover:text-orange-700"
        >
          Back to Mentors
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
            href="/admin/mentors"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mentor.name}</h1>
            <p className="text-gray-500">{mentor.email}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <a 
            href={`mailto:${mentor.email}`}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail size={18} className="mr-2" />
            Send Email
          </a>
          <Link
            href={`/admin/mentors/${mentor.id}/schedule`}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Calendar size={18} className="mr-2" />
            View Schedule
          </Link>
          <Link
            href={`/admin/mentors/${mentor.id}/edit`}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Edit size={18} className="mr-2" />
            Edit Mentor
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={18} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
          mentor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {mentor.status}
        </span>
        <span className="text-sm text-gray-500 flex items-center">
          <Calendar size={16} className="mr-1" />
          Joined {new Date(mentor.joinDate).toLocaleDateString()}
        </span>
        <span className="text-sm text-gray-500 flex items-center">
          <Star size={16} className="mr-1 text-yellow-400" />
          {mentor.rating} / 5.0
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
              activeTab === 'overview'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
              activeTab === 'students'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
              activeTab === 'schedule'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
              activeTab === 'performance'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Performance
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-gray-600">{mentor.bio || 'No bio provided.'}</p>
            </div>

            {/* Expertise */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((exp, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            {/* Programs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Associated Programs</h3>
              <div className="space-y-3">
                {mentor.programs.map((program) => (
                  <div key={program} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Briefcase size={16} className="text-gray-500 mr-3" />
                      <span className="font-medium">{program}</span>
                    </div>
                    {program === 'PCP' ? (
                      <span className="text-xs text-gray-500">No weekly meetings</span>
                    ) : (
                      <span className="text-xs text-green-600">Weekly meetings</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions Preview */}
            {upcomingSessions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
                  <Link
                    href={`/admin/mentors/${mentor.id}/schedule`}
                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center"
                  >
                    View Full Schedule
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {upcomingSessions.map((session, index) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          session.studentProgram === 'G-GMP' ? 'bg-purple-500' :
                          session.studentProgram === 'G-CMP' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{session.studentName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getProgramColor(session.studentProgram)}`}>
                              {session.studentProgram}
                            </span>
                            <span className="text-xs text-gray-500">{session.studentTrack}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.date}</p>
                        <p className="text-xs text-gray-500">{session.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail size={16} className="text-gray-400 mr-3" />
                  <span className="text-gray-600">{mentor.email}</span>
                </div>
                {mentor.phone && (
                  <div className="flex items-center">
                    <Phone size={16} className="text-gray-400 mr-3" />
                    <span className="text-gray-600">{mentor.phone}</span>
                  </div>
                )}
                {mentor.location && (
                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-400 mr-3" />
                    <span className="text-gray-600">{mentor.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users size={16} className="text-orange-500 mr-2" />
                    <span>Total Students</span>
                  </div>
                  <span className="font-semibold">{mentor.students}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award size={16} className="text-green-500 mr-2" />
                    <span>Programs</span>
                  </div>
                  <span className="font-semibold">{mentor.programs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock size={16} className="text-purple-500 mr-2" />
                    <span>Sessions (This Week)</span>
                  </div>
                  <span className="font-semibold">{upcomingSessions.length}</span>
                </div>
              </div>
            </div>

            {/* Availability Summary */}
            {mentor.availability && mentor.availability.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Availability</h3>
                <div className="space-y-2">
                  {mentor.availability.map((slot: any) => {
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    return (
                      <div key={slot.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{days[slot.dayOfWeek]}</span>
                        <span className="text-gray-900 font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Assigned Students</h3>
          {mentor.assignedStudents && mentor.assignedStudents.length > 0 ? (
            <div className="space-y-4">
              {mentor.assignedStudents.map((student: any) => (
                <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${getProgramColor(student.program?.name || student.program)}`}>
                        {student.program?.name || student.program}
                      </span>
                      <span className="text-xs text-gray-500">{student.track?.name || student.track}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Progress: {student.progress}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Next session: {student.nextSession || 'To be scheduled'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No students assigned to this mentor.</p>
          )}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Weekly Schedule Overview</h3>
              <p className="text-sm text-gray-500">Manage all mentoring sessions and track upcoming meetings.</p>
            </div>
            <Link
              href={`/admin/mentors/${mentor.id}/schedule`}
              className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center bg-orange-50 px-4 py-2 rounded-lg transition-colors border border-orange-100 hover:bg-orange-100"
            >
              View Full Calendar
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Sessions by Program</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-purple-50 rounded-xl border border-purple-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-purple-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                    <h4 className="font-semibold text-purple-800 mb-1">G-GMP</h4>
                    <p className="text-3xl font-black text-purple-900">
                      {sessions.filter((s: any) => s.student?.program?.name === 'G-GMP' || s.student?.program === 'G-GMP').length}
                    </p>
                    <p className="text-xs text-purple-600 font-medium mt-1">Total Scheduled</p>
                  </div>
                  <div className="p-5 bg-green-50 rounded-xl border border-green-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-green-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                    <h4 className="font-semibold text-green-800 mb-1">G-CMP</h4>
                    <p className="text-3xl font-black text-green-900">
                      {sessions.filter((s: any) => s.student?.program?.name === 'G-CMP' || s.student?.program === 'G-CMP').length}
                    </p>
                    <p className="text-xs text-green-600 font-medium mt-1">Total Scheduled</p>
                  </div>
                  <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                    <h4 className="font-semibold text-blue-800 mb-1">E-TIP</h4>
                    <p className="text-3xl font-black text-blue-900">
                      {sessions.filter((s: any) => s.student?.program?.name === 'E-TIP' || s.student?.program === 'E-TIP').length}
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-1">Total Scheduled</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Next Upcoming</h4>
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session, index) => (
                      <div key={session.id} className="relative pl-4 border-l-2 border-orange-200">
                        <div className="absolute w-2 h-2 bg-orange-500 rounded-full -left-[5px] top-1.5 ring-4 ring-white"></div>
                        <p className="text-xs font-bold text-orange-600 mb-1">{session.date} &bull; {session.time}</p>
                        <p className="text-sm font-semibold text-gray-900">{session.studentName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getProgramColor(session.studentProgram)}`}>
                            {session.studentProgram}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">{session.studentTrack}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Calendar className="text-gray-400" size={20} />
                    </div>
                    <p className="text-sm font-medium text-gray-600">No upcoming sessions</p>
                    <p className="text-xs text-gray-400 mt-1">The schedule is clear.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Completion Rate */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden group hover:border-orange-300 transition-colors">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Award size={20} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-600">Completion Rate</h4>
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <p className="text-3xl font-black text-gray-900">{performance?.completionRate || 0}%</p>
                </div>
                {/* Notice the custom indicator classes applied inline using style if the component supports it, otherwise generic styling */}
                <Progress value={performance?.completionRate || 0} className="h-2 bg-blue-100" />
              </div>
            </div>

            {/* Student Satisfaction */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden group hover:border-orange-300 transition-colors">
              <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <Star size={20} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-600">Satisfaction</h4>
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <p className="text-3xl font-black text-gray-900">{performance?.rating ? performance.rating.toFixed(1) : 'N/A'}</p>
                  <p className="text-sm font-medium text-gray-500 mb-1">/ 5.0</p>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} size={16} className={star <= (performance?.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
              </div>
            </div>

            {/* Total Sessions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden group hover:border-orange-300 transition-colors">
              <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-600">Total Sessions</h4>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-3xl font-black text-gray-900">{performance?.totalSessions || 0}</p>
                </div>
                <p className="text-sm text-gray-500 font-medium">Lifetime mentoring sessions</p>
              </div>
            </div>

            {/* Average Session Duration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden group hover:border-orange-300 transition-colors">
              <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <Clock size={20} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-600">Avg Duration</h4>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-3xl font-black text-gray-900">{performance?.averageSessionDuration || 0}</p>
                  <p className="text-sm font-medium text-gray-500 mb-1">mins</p>
                </div>
                <p className="text-sm text-gray-500 font-medium">Average time per session</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Session Activity Trend</h3>
              </div>
              <div className="h-[250px] w-full">
                {performance?.trend && performance.trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performance.trend}>
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} 
                        tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      />
                      <Area type="monotone" dataKey="sessions" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">Not enough data to display trend</div>
                )}
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Assigned Student Progress</h3>
              </div>
              <div className="h-[250px] w-full">
                {performance?.progressDistribution && performance.progressDistribution.some((d: any) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performance.progressDistribution} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} width={60} />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">No students assigned yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Mentor</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{mentor.name}</strong>? This will permanently remove their profile, sessions, and all associated data.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="scale-75 mr-2"><LoaderOne /></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Delete Mentor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}