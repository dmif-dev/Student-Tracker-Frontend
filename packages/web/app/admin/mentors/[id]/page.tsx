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
import { useAdminMentor, useDeleteMentor } from '@/hooks/api/useAdmin';
import LoaderOne from '@/components/ui/loader-one';

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
  const deleteMentorMutation = useDeleteMentor();
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Get current tab from URL
  const currentTab = pathname.split('/').pop() || 'overview';
  const validTabs = ['overview', 'students', 'schedule', 'performance'];
  const activeTab = validTabs.includes(currentTab) ? currentTab : 'overview';

  useEffect(() => {
    if (mentor?.assignedStudents) {
      const sessions = generateUpcomingSessions(mentor);
      setUpcomingSessions(sessions);
    }
  }, [mentor]);

  const generateUpcomingSessions = (mentorData: any) => {
    const sessions: UpcomingSession[] = [];
    const now = new Date();
    const students = mentorData.assignedStudents || [];

    students.forEach((student: any, index: number) => {
      if (student.program === 'PCP') return;

      // Determine day of week based on program
      let dayOfWeek = 1; // Monday default
      if (student.program === 'G-GMP') dayOfWeek = 1; // Monday
      if (student.program === 'G-CMP') dayOfWeek = 3; // Wednesday
      if (student.program === 'E-TIP') dayOfWeek = 5; // Friday

      // Calculate next session date
      const sessionDate = new Date(now);
      const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7;
      sessionDate.setDate(now.getDate() + daysUntilNext);

      sessions.push({
        id: `s${student.id}`,
        studentName: student.name,
        studentProgram: student.program,
        studentTrack: student.track,
        date: sessionDate.toLocaleDateString(),
        time: '10:00 AM - 11:00 AM',
        topic: `${student.track} - Weekly Review`
      });
    });

    return sessions.slice(0, 3); // Show only next 3 sessions
  };

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
          <Link
            href={`/admin/mentors/${params.id}`}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === 'overview'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </Link>
          <Link
            href={`/admin/mentors/${params.id}/students`}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === 'students'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Students
          </Link>
          <Link
            href={`/admin/mentors/${params.id}/schedule`}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === 'schedule'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Schedule
          </Link>
          <Link
            href={`/admin/mentors/${params.id}/performance`}
            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
              activeTab === 'performance'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Performance
          </Link>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${getProgramColor(student.program)}`}>
                        {student.program}
                      </span>
                      <span className="text-xs text-gray-500">{student.track}</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Weekly Schedule</h3>
            <Link
              href={`/admin/mentors/${mentor.id}/schedule`}
              className="text-orange-600 hover:text-orange-700 flex items-center"
            >
              View Full Calendar
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
          <p className="text-gray-500">View and manage all mentoring sessions in the detailed schedule view.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-700 mb-2">G-GMP Sessions</h4>
              <p className="text-2xl font-bold text-purple-700">
                {mentor.assignedStudents?.filter((s: any) => s.program === 'G-GMP').length || 0}
              </p>
              <p className="text-sm text-purple-600">Mondays</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-700 mb-2">G-CMP Sessions</h4>
              <p className="text-2xl font-bold text-green-700">
                {mentor.assignedStudents?.filter((s: any) => s.program === 'G-CMP').length || 0}
              </p>
              <p className="text-sm text-green-600">Wednesdays</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">E-TIP Sessions</h4>
              <p className="text-2xl font-bold text-blue-700">
                {mentor.assignedStudents?.filter((s: any) => s.program === 'E-TIP').length || 0}
              </p>
              <p className="text-sm text-blue-600">Fridays</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Session Completion</p>
              <p className="text-2xl font-bold text-blue-700">94%</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Student Satisfaction</p>
              <p className="text-2xl font-bold text-green-700">4.8/5</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">Total Sessions</p>
              <p className="text-2xl font-bold text-purple-700">156</p>
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