// packages/web/app/mentor/schedule/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  GraduationCap,
  FileText,
  ChevronLeftCircle,
  ChevronRightCircle
} from 'lucide-react';
import { ApiService } from '@/services/api';
import { SessionService } from '@/services/sessionService';
import SessionNotesModal from '@/components/mentor/SessionNotesModal';
import { Session, SessionNote } from '@student-tracker/shared/models/Session';
import { AssignedStudent as MockAssignedStudent } from '@/services/mockData';

interface AssignedStudent {
  id: string;
  name: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP';
  track: string;
  progress: number;
  lastSession?: string;
}

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
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showSessionModal, setShowSessionModal] = useState<Session | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  
  // Session notes state
  const [selectedSessionForNotes, setSelectedSessionForNotes] = useState<Session | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);

  // Pagination state
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);
  const [pastCurrentPage, setPastCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit/Delete state
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Mock mentor ID - replace with actual auth
  const MENTOR_ID = '1';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedule, mentor] = await Promise.all([
        ApiService.getMentorSchedule(MENTOR_ID),
        ApiService.getMentorById(MENTOR_ID)
      ]);
      
      // Transform the schedule data to match Session interface
      const transformedSessions: Session[] = schedule.map((s: any) => ({
        id: s.id,
        studentId: s.studentId,
        studentName: s.studentName,
        studentProgram: s.studentProgram as 'G-GMP' | 'G-CMP' | 'E-TIP',
        studentTrack: s.studentTrack || '',
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
        topic: s.topic,
        meetingLink: s.meetingLink,
        notes: s.notes || [],
        createdAt: s.createdAt || new Date().toISOString(),
        updatedAt: s.updatedAt || new Date().toISOString(),
      }));
      
      setSessions(transformedSessions);
      
      // Get assigned students and filter out PCP, then map to our local type
      const assignedStudents = (mentor?.assignedStudents || [])
        .filter((s: MockAssignedStudent) => s.program !== 'PCP')
        .map((s: MockAssignedStudent) => ({
          id: s.id,
          name: s.name,
          program: s.program as 'G-GMP' | 'G-CMP' | 'E-TIP',
          track: s.track,
          progress: s.progress,
          lastSession: s.lastSession,
        }));
      
      setStudents(assignedStudents);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    return sessions.filter(s => s.date === date);
  };

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700 border-purple-200',
      'G-CMP': 'bg-green-100 text-green-700 border-green-200',
      'E-TIP': 'bg-blue-100 text-blue-700 border-blue-200',
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

  const handleScheduleSession = async (sessionData: SessionFormData) => {
    try {
      // Find the selected student
      const selectedStudent = students.find(s => s.id === sessionData.studentId);
      if (!selectedStudent) return;

      // Create new session
      const newSession: Session = {
        id: Date.now().toString(),
        studentId: sessionData.studentId,
        studentName: selectedStudent.name,
        studentProgram: selectedStudent.program,
        studentTrack: selectedStudent.track,
        date: sessionData.date,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        status: 'scheduled',
        topic: sessionData.topic,
        notes: [],
        meetingLink: sessionData.meetingLink || 'https://meet.google.com/abc-defg-hij',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In a real app, this would call an API
      // await ApiService.scheduleSession(newSession);

      // Update local state
      setSessions([...sessions, newSession].sort((a, b) => a.date.localeCompare(b.date)));
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Error scheduling session:', error);
      alert('Failed to schedule session. Please try again.');
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setShowEditModal(true);
  };

  const handleUpdateSession = async (updatedData: Partial<Session>) => {
    if (!editingSession) return;

    try {
      // In a real app, this would call an API
      // await ApiService.updateSession(editingSession.id, updatedData);

      // Update local state
      setSessions(prev => prev.map(s => 
        s.id === editingSession.id 
          ? { ...s, ...updatedData, updatedAt: new Date().toISOString() }
          : s
      ));
      
      setShowEditModal(false);
      setEditingSession(null);
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Failed to update session. Please try again.');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      // In a real app, this would call an API
      // await ApiService.deleteSession(sessionId);

      // Update local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  const handleAddNotes = async (sessionId: string, noteData: any) => {
    try {
      const newNote = await SessionService.addSessionNotes(
        sessionId,
        noteData,
        MENTOR_ID
      );
      
      // Update the session in the list
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return {
            ...s,
            status: 'completed',
            notes: [...(s.notes || []), newNote]
          };
        }
        return s;
      }));
      
      setShowNotesModal(false);
      setSelectedSessionForNotes(null);
      setSessionNotes([]);
    } catch (error) {
      console.error('Error adding session notes:', error);
      alert('Failed to add session notes. Please try again.');
    }
  };

  const handleViewNotes = (session: Session) => {
    setSelectedSessionForNotes(session);
    setSessionNotes(session.notes || []);
    setShowNotesModal(true);
  };

  // Filter sessions
  const upcomingSessions = sessions
    .filter(s => new Date(s.date) >= new Date() && s.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastSessions = sessions
    .filter(s => new Date(s.date) < new Date() || s.status !== 'scheduled')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination calculations
  const upcomingTotalPages = Math.ceil(upcomingSessions.length / itemsPerPage);
  const pastTotalPages = Math.ceil(pastSessions.length / itemsPerPage);

  const upcomingPaginatedSessions = upcomingSessions.slice(
    (upcomingCurrentPage - 1) * itemsPerPage,
    upcomingCurrentPage * itemsPerPage
  );

  const pastPaginatedSessions = pastSessions.slice(
    (pastCurrentPage - 1) * itemsPerPage,
    pastCurrentPage * itemsPerPage
  );

  // Reset pagination when sessions change
  useEffect(() => {
    setUpcomingCurrentPage(1);
    setPastCurrentPage(1);
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your mentoring sessions</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {view === 'calendar' ? 'List View' : 'Calendar View'}
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus size={18} className="mr-2" />
            Schedule Session
          </button>
        </div>
      </div>

      {/* Upcoming Sessions Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-600 mb-1">Upcoming Sessions</p>
            <p className="text-2xl font-bold text-primary-700">{upcomingSessions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-600 mb-1">Next Session</p>
            {upcomingSessions.length > 0 ? (
              <p className="text-sm font-medium text-primary-700">
                {upcomingSessions[0].studentName} • {new Date(upcomingSessions[0].date).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-sm text-primary-500">No upcoming sessions</p>
            )}
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
              const daySessions = getSessionsForDate(date);
              const isSelected = selectedDate === date;
              const isToday = new Date().toDateString() === new Date(date).toDateString();

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`bg-white p-2 h-32 overflow-y-auto cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'ring-2 ring-primary-500 ring-inset' : ''
                  } ${isToday ? 'bg-primary-50' : ''}`}
                >
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-primary-600' : isToday ? 'text-primary-600' : 'text-gray-700'
                  }`}>
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {daySessions.map(session => (
                      <div
                        key={session.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSessionModal(session);
                        }}
                        className={`text-xs p-1 rounded ${getProgramColor(session.studentProgram)} truncate cursor-pointer`}
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

      {/* ========== LIST VIEW SECTION WITH PAGINATION ========== */}
      {view === 'list' && (
        <div className="space-y-8">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold">Upcoming Sessions ({upcomingSessions.length})</h2>
            </div>
            
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
                <p className="text-gray-500">Schedule your next mentoring session.</p>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus size={18} className="mr-2" />
                  Schedule Session
                </button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {upcomingPaginatedSessions.map((session) => (
                    <div key={session.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        {/* Left side - Session info */}
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-10 h-10 rounded-lg ${getProgramColor(session.studentProgram)} flex items-center justify-center flex-shrink-0`}>
                            <Users size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                              <h3 className="font-medium text-gray-900">{session.studentName}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgramColor(session.studentProgram)}`}>
                                {session.studentProgram}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                {session.status}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 flex-wrap gap-y-2">
                              <span className="flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {new Date(session.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                {formatTime(session.startTime)} - {formatTime(session.endTime)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Topic:</span> {session.topic}
                            </p>
                            
                            {session.meetingLink && session.status === 'scheduled' && (
                              <a
                                href={session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-2 text-sm text-primary-600 hover:text-primary-700"
                              >
                                <Video size={14} className="mr-1" />
                                Join Meeting
                              </a>
                            )}

                            {/* Show note preview if exists */}
                            {session.notes && session.notes.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                <span className="font-medium">Last session notes:</span>{' '}
                                {session.notes[session.notes.length - 1].content.substring(0, 100)}
                                {session.notes[session.notes.length - 1].content.length > 100 ? '...' : ''}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right side - Action buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          {session.status === 'completed' ? (
                            <button
                              onClick={() => handleViewNotes(session)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title="View Notes"
                            >
                              <FileText size={16} className="text-gray-600" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedSessionForNotes(session);
                                setShowNotesModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg text-green-600"
                              title="Mark as Completed & Add Notes"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditSession(session)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Edit Session"
                          >
                            <Edit size={16} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(session.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-red-500"
                            title="Delete Session"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination for Upcoming Sessions */}
                {upcomingTotalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">{(upcomingCurrentPage - 1) * itemsPerPage + 1}</span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(upcomingCurrentPage * itemsPerPage, upcomingSessions.length)}
                        </span>{' '}
                        of <span className="font-medium">{upcomingSessions.length}</span> sessions
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setUpcomingCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={upcomingCurrentPage === 1}
                          className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                          <ChevronLeft size={16} className="mr-1" />
                          Previous
                        </button>
                        <button
                          onClick={() => setUpcomingCurrentPage(prev => Math.min(prev + 1, upcomingTotalPages))}
                          disabled={upcomingCurrentPage === upcomingTotalPages}
                          className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                        >
                          Next
                          <ChevronRight size={16} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold">Past Sessions ({pastSessions.length})</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {pastPaginatedSessions.map((session) => (
                  <div key={session.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg ${getProgramColor(session.studentProgram)} flex items-center justify-center opacity-60 flex-shrink-0`}>
                          <Users size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                            <h3 className="font-medium text-gray-900">{session.studentName}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgramColor(session.studentProgram)}`}>
                              {session.studentProgram}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                              {session.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 flex-wrap gap-y-2">
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(session.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Topic:</span> {session.topic}
                          </p>

                          {/* Show note preview if exists */}
                          {session.notes && session.notes.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                              <span className="font-medium">Session notes:</span>{' '}
                              {session.notes[session.notes.length - 1].content.substring(0, 100)}
                              {session.notes[session.notes.length - 1].content.length > 100 ? '...' : ''}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* For past sessions, show view notes button */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedSessionForNotes(session);
                            setSessionNotes(session.notes || []);
                            setShowNotesModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="View Notes"
                        >
                          <FileText size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination for Past Sessions */}
              {pastTotalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(pastCurrentPage - 1) * itemsPerPage + 1}</span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pastCurrentPage * itemsPerPage, pastSessions.length)}
                      </span>{' '}
                      of <span className="font-medium">{pastSessions.length}</span> sessions
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPastCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={pastCurrentPage === 1}
                        className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        <ChevronLeft size={16} className="mr-1" />
                        Previous
                      </button>
                      <button
                        onClick={() => setPastCurrentPage(prev => Math.min(prev + 1, pastTotalPages))}
                        disabled={pastCurrentPage === pastTotalPages}
                        className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Next
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Schedule Session Modal */}
      {showScheduleModal && (
        <ScheduleSessionModal
          students={students}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleScheduleSession}
        />
      )}

      {/* Edit Session Modal */}
      {showEditModal && editingSession && (
        <EditSessionModal
          session={editingSession}
          students={students}
          onClose={() => {
            setShowEditModal(false);
            setEditingSession(null);
          }}
          onSave={handleUpdateSession}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Delete Session</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this session? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSession(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Details Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Session Details</h3>
              <button onClick={() => setShowSessionModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProgramColor(showSessionModal.studentProgram)}`}>
                  {showSessionModal.studentProgram}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(showSessionModal.status)}`}>
                  {showSessionModal.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-medium">{showSessionModal.studentName}</p>
                <p className="text-xs text-gray-500">{showSessionModal.studentTrack}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">
                  {new Date(showSessionModal.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  {formatTime(showSessionModal.startTime)} - {formatTime(showSessionModal.endTime)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Topic</p>
                <p className="font-medium">{showSessionModal.topic}</p>
              </div>

              {showSessionModal.notes && showSessionModal.notes.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Session Notes</p>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {showSessionModal.notes.map((note, index) => (
                      <div key={note.id || index} className="mb-2 last:mb-0">
                        <p className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-700">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showSessionModal.meetingLink && showSessionModal.status === 'scheduled' && (
                <a
                  href={showSessionModal.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Join Meeting
                </a>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSessionModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Notes Modal */}
      {showNotesModal && selectedSessionForNotes && (
        <SessionNotesModal
          session={selectedSessionForNotes}
          existingNotes={sessionNotes}
          onClose={() => {
            setShowNotesModal(false);
            setSelectedSessionForNotes(null);
            setSessionNotes([]);
          }}
          onSave={handleAddNotes}
        />
      )}
    </div>
  );
}

// ==================== ScheduleSessionModal Component ====================

function ScheduleSessionModal({ students, onClose, onSchedule }: { 
  students: AssignedStudent[]; 
  onClose: () => void; 
  onSchedule: (sessionData: SessionFormData) => void;
}) {
  const [formData, setFormData] = useState<SessionFormData>({
    studentId: '',
    date: '',
    startTime: '',
    endTime: '',
    topic: '',
    notes: '',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule(formData);
  };

  const getProgramDayHint = (program: string) => {
    if (program === 'G-GMP') return ' (Recommended: Monday)';
    if (program === 'G-CMP') return ' (Recommended: Wednesday)';
    if (program === 'E-TIP') return ' (Recommended: Friday)';
    return '';
  };

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700',
      'G-CMP': 'bg-green-100 text-green-700',
      'E-TIP': 'bg-blue-100 text-blue-700',
    };
    return colors[program as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const selectedStudent = students.find(s => s.id === formData.studentId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Schedule New Session</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Student *
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Choose a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.program} - {student.track})
                </option>
              ))}
            </select>
            {selectedStudent && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedStudent.program} student • Last session: {selectedStudent.lastSession || 'None'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            {formData.studentId && (
              <p className="text-xs text-gray-500 mt-1">
                {getProgramDayHint(students.find(s => s.id === formData.studentId)?.program || '')}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://meet.google.com/..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Default: Google Meet link (you can change it)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Any additional notes or agenda items..."
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
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Schedule Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== EditSessionModal Component ====================

function EditSessionModal({ session, students, onClose, onSave }: {
  session: Session;
  students: AssignedStudent[];
  onClose: () => void;
  onSave: (updatedData: Partial<Session>) => void;
}) {
  const [formData, setFormData] = useState({
    studentId: session.studentId,
    date: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    topic: session.topic,
    meetingLink: session.meetingLink || '',
    notes: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Session</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.program} - {student.track})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://meet.google.com/..."
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
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}