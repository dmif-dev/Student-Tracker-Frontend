// packages/web/app/admin/mentors/[id]/schedule/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  GraduationCap,
  Info
} from 'lucide-react';
import { useAdminMentor, useAdminMentorSessions, useAdminCreateSession, useAdminUpdateSession, useAdminDeleteSession } from '@/hooks/api/useAdmin';
import { type MentorSchedule, type AssignedStudent } from '@/types/models';
import LoaderOne from '@/components/ui/loader-one';
import { toast } from "sonner";

interface SessionFormData {
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  notes: string;
  meetingLink: string;
}

export default function MentorSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const { data: mentorData, isLoading: loading } = useAdminMentor(params.id as string);
  const { data: serverSessions } = useAdminMentorSessions(params.id as string);
  const createSessionMutation = useAdminCreateSession();
  const updateSessionMutation = useAdminUpdateSession();
  const deleteSessionMutation = useAdminDeleteSession();
  const mentor = mentorData;
  const [schedules, setSchedules] = useState<MentorSchedule[]>([]);
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [activeListTab, setActiveListTab] = useState<'upcoming' | 'past'>('upcoming');
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState<SessionFormData>({
    studentId: '',
    date: '',
    startTime: '',
    endTime: '',
    topic: '',
    notes: '',
    meetingLink: ''
  });

  useEffect(() => {
    if (serverSessions) {
      const mappedSchedules = serverSessions.map((s: any) => ({
        id: s.id,
        studentId: s.studentId,
        studentName: s.student?.name || 'Unknown Student',
        studentProgram: s.student?.program?.name || s.student?.programId || 'G-GMP',
        date: s.date ? new Date(s.date).toISOString().split('T')[0] : '',
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status?.toLowerCase() || 'scheduled',
        topic: s.topic,
        meetingLink: s.meetingLink,
        notes: s.notes ? (Array.isArray(s.notes) ? s.notes[0]?.content : s.notes) : ''
      }));
      setSchedules(mappedSchedules);
    }
  }, [serverSessions]);

  useEffect(() => {
    if (mentorData) {
      // Only include non-PCP students in assigned students
      const nonPCPStudents = (mentorData.assignedStudents || []).filter(
        (student: AssignedStudent) => student.program !== 'PCP'
      );
      setStudents(nonPCPStudents);
    }
  }, [mentorData]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getSessionsForDate = (date: string) => {
    return schedules.filter(s => s.date === date);
  };

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700 border-purple-200',
      'G-CMP': 'bg-green-100 text-green-700 border-green-200',
      'E-TIP': 'bg-blue-100 text-blue-700 border-blue-200',
      'PCP': 'bg-orange-100 text-orange-700 border-orange-200'
    };
    return colors[program as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      rescheduled: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const now = new Date();
  const upcomingSchedules = schedules.filter(s => new Date(`${s.date}T${s.startTime || '00:00'}`) >= now);
  const pastSchedules = schedules.filter(s => new Date(`${s.date}T${s.startTime || '00:00'}`) < now);

  upcomingSchedules.sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime());
  pastSchedules.sort((a, b) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime());

  const displaySchedules = activeListTab === 'upcoming' ? upcomingSchedules : pastSchedules;
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(displaySchedules.length / ITEMS_PER_PAGE));
  const paginatedSchedules = displaySchedules.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleTabChange = (tab: 'upcoming' | 'past') => {
    setActiveListTab(tab);
    setCurrentPage(1);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    setIsDeletingSession(true);
    try {
      await deleteSessionMutation.mutateAsync({ sessionId: sessionToDelete, mentorId: params.id as string });
      setSessionToDelete(null);
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session. Please try again.');
    } finally {
      setIsDeletingSession(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={`/admin/mentors/${params.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mentor.name}'s Schedule</h1>
            <p className="text-gray-500 mt-1">Manage weekly mentoring sessions</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {view === 'calendar' ? 'List View' : 'Calendar View'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Plus size={18} className="mr-2" />
            Schedule Session
          </button>
        </div>
      </div>

      {/* PCP Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> PCP (Professional Certification Program) students are self-paced and 
              do not require mentor sessions. They are not shown in the schedule.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Currently managing {students.length} students across G-GMP, G-CMP, and E-TIP programs.
            </p>
          </div>
        </div>
      </div>

      {/* Program Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Weekly Meeting Schedule by Program</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-sm">G-GMP: Mondays</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm">G-CMP: Wednesdays</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm">E-TIP: Fridays</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            <span className="text-sm text-gray-500">PCP: No weekly meetings (self-paced)</span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{monthName}</h2>
            <div className="flex space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {/* Weekday Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month start */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white p-3 h-32" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const sessions = getSessionsForDate(date);
              const isSelected = selectedDate === date;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`bg-white p-2 h-32 overflow-y-auto cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'ring-2 ring-orange-500 ring-inset' : ''
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {sessions.map(session => (
                      <div
                        key={session.id}
                        className={`text-xs p-1 rounded ${getProgramColor(session.studentProgram)} truncate`}
                        title={`${session.studentName} - ${session.startTime} to ${session.endTime}`}
                      >
                        {session.startTime} - {session.studentName}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-6">
            <button
              onClick={() => handleTabChange('upcoming')}
              className={`font-semibold pb-4 -mb-4 border-b-2 transition-colors ${
                activeListTab === 'upcoming' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming Sessions ({upcomingSchedules.length})
            </button>
            <button
              onClick={() => handleTabChange('past')}
              className={`font-semibold pb-4 -mb-4 border-b-2 transition-colors ${
                activeListTab === 'past' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Past Sessions ({pastSchedules.length})
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {paginatedSchedules.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeListTab} sessions</h3>
                <p className="text-gray-500">
                  {activeListTab === 'upcoming' ? 'Schedule your first mentoring session.' : 'No past sessions to display.'}
                </p>
              </div>
            ) : (
              paginatedSchedules.map((session) => (
                <div key={session.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-lg ${getProgramColor(session.studentProgram)} flex items-center justify-center`}>
                          <GraduationCap size={20} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{session.studentName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgramColor(session.studentProgram)}`}>
                            {session.studentProgram}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </span>
                          {session.meetingLink && activeListTab !== 'past' && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-orange-600 hover:text-orange-700"
                            >
                              <Video size={14} className="mr-1" />
                              Join Meeting
                            </a>
                          )}
                        </div>
                        {session.topic && (
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Topic:</span> {session.topic}
                          </p>
                        )}
                        {session.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Notes:</span> {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setEditingSession(session)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Session"
                      >
                        <Edit size={16} className="text-gray-500" />
                      </button>
                      <button 
                        onClick={() => setSessionToDelete(session.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-red-500 transition-colors"
                        title="Cancel Session"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, displaySchedules.length)} of {displaySchedules.length} entries
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Date Details */}
      {view === 'calendar' && selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            Sessions on {new Date(selectedDate).toLocaleDateString()}
          </h3>
          <div className="space-y-3">
            {getSessionsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sessions scheduled for this date</p>
            ) : (
              getSessionsForDate(selectedDate).map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="font-medium">{session.studentName}</p>
                      <p className="text-sm text-gray-500">
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Schedule/Edit Session Modal */}
      {(showAddModal || editingSession) && (
        <ScheduleSessionModal
          mentor={mentor}
          students={students}
          editSession={editingSession}
          onClose={() => {
            setShowAddModal(false);
            setEditingSession(null);
          }}
          onSchedule={async (sessionData: SessionFormData) => {
            const selectedStudent = students.find(s => s.id === sessionData.studentId);
            if (!selectedStudent) return;
            
            if (editingSession) {
              await updateSessionMutation.mutateAsync({
                id: editingSession.id,
                data: {
                  mentorId: params.id as string,
                  studentId: sessionData.studentId,
                  date: sessionData.date,
                  startTime: sessionData.startTime,
                  endTime: sessionData.endTime,
                  topic: sessionData.topic,
                  notes: sessionData.notes,
                  meetingLink: sessionData.meetingLink || undefined,
                }
              });
            } else {
              await createSessionMutation.mutateAsync({
                mentorId: params.id as string,
                studentId: sessionData.studentId,
                date: sessionData.date,
                startTime: sessionData.startTime,
                endTime: sessionData.endTime,
                topic: sessionData.topic,
                notes: sessionData.notes,
                meetingLink: sessionData.meetingLink || undefined,
              });
            }
          }}
        />
      )}

      {/* Delete/Cancel Session Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Session</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to cancel this mentoring session? This action cannot be undone and the student will be notified automatically.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                disabled={isDeletingSession}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors disabled:opacity-50"
              >
                No, Keep it
              </button>
              <button
                type="button"
                onClick={confirmDeleteSession}
                disabled={isDeletingSession}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingSession ? (
                  <>
                    <span className="scale-75 mr-2"><LoaderOne /></span>
                    Canceling...
                  </>
                ) : (
                  'Yes, Cancel Session'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Schedule Session Modal Component
function ScheduleSessionModal({ mentor, students, onClose, onSchedule, editSession }: any) {
  const [formData, setFormData] = useState<SessionFormData>({
    studentId: editSession?.studentId || '',
    date: editSession?.date || '',
    startTime: editSession?.startTime || '',
    endTime: editSession?.endTime || '',
    topic: editSession?.topic || '',
    notes: editSession?.notes || '',
    meetingLink: editSession?.meetingLink || ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Time validation
    if (formData.startTime >= formData.endTime) {
      setError('End time must be strictly after start time.');
      return;
    }

    // Past time validation
    if (formData.date && formData.startTime) {
      const selectedDateTime = new Date(`${formData.date}T${formData.startTime}`);
      if (selectedDateTime < new Date()) {
        setError('Cannot schedule a session in the past. Please select a future date and time.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSchedule(formData);
      setSuccess(editSession ? 'Session updated successfully!' : 'Session scheduled successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to schedule session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgramDayHint = (program: string) => {
    if (program === 'G-GMP') return ' (Recommended: Monday)';
    if (program === 'G-CMP') return ' (Recommended: Wednesday)';
    if (program === 'E-TIP') return ' (Recommended: Friday)';
    if (program === 'PCP') return ' (No weekly meetings required - self-paced)';
    return '';
  };

  const selectedStudent = students.find((s: any) => s.id === formData.studentId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{editSession ? 'Edit Session' : 'Schedule New Session'}</h3>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start">
            <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center">
            <CheckCircle size={16} className="mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Student *
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Choose a student</option>
              {students.map((student: any) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.program} - {student.track})
                </option>
              ))}
            </select>
            {selectedStudent?.program === 'PCP' && (
              <p className="text-xs text-red-500 mt-1">
                Warning: PCP students are self-paced and don't require mentor sessions
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            {formData.studentId && (
              <p className="text-xs text-gray-500 mt-1">
                {getProgramDayHint(students.find((s: any) => s.id === formData.studentId)?.program)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Weekly Progress Review"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Link
            </label>
            <input
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://meet.google.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!success}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <span className="scale-75 mr-2"><LoaderOne /></span>
                  {editSession ? 'Updating...' : 'Scheduling...'}
                </>
              ) : (
                editSession ? 'Update Session' : 'Schedule Session'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}