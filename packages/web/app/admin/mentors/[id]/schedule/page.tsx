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
  GraduationCap
} from 'lucide-react';
import { ApiService } from '@/services/api';
import { MentorSchedule, AssignedStudent } from '@/services/mockData';


// Add this interface after imports
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
  const [loading, setLoading] = useState(true);
  const [mentor, setMentor] = useState<any>(null);
  const [schedules, setSchedules] = useState<MentorSchedule[]>([]);
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const mentorData = await ApiService.getMentorById(params.id as string);
        if (mentorData) {
          setMentor(mentorData);
          setStudents(mentorData.assignedStudents || []);
          
          // Generate mock schedule data based on mentor's availability and students
          const mockSchedules = generateMockSchedules(mentorData);
          setSchedules(mockSchedules);
        }
      } catch (error) {
        console.error('Error fetching mentor:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMentorData();
    }
  }, [params.id]);

  const generateMockSchedules = (mentorData: any): MentorSchedule[] => {
    const schedules: MentorSchedule[] = [];
    const now = new Date();
    const students = mentorData.assignedStudents || [];

    // Generate schedules for next 4 weeks based on program requirements
    students.forEach((student: AssignedStudent) => {
      // Skip PCP students (they don't have weekly meetings)
      if (student.program === 'PCP') return;

      // Determine day of week based on program
      let dayOfWeek = 1; // Default Monday
      if (student.program === 'G-GMP') dayOfWeek = 1; // Monday
      if (student.program === 'G-CMP') dayOfWeek = 3; // Wednesday
      if (student.program === 'E-TIP') dayOfWeek = 5; // Friday

      // Generate 4 weekly sessions
      for (let week = 0; week < 4; week++) {
        const sessionDate = new Date(now);
        // Calculate next occurrence of the required day
        const daysUntilNext = (dayOfWeek - now.getDay() + 7) % 7;
        sessionDate.setDate(now.getDate() + daysUntilNext + (week * 7));
        
        const startHour = 10 + week; // Different times for variety
        const endHour = startHour + 1;

        schedules.push({
          id: `s${student.id}-w${week}`,
          studentId: student.id,
          studentName: student.name,
          studentProgram: student.program,
          date: sessionDate.toISOString().split('T')[0],
          startTime: `${startHour.toString().padStart(2, '0')}:00`,
          endTime: `${endHour.toString().padStart(2, '0')}:00`,
          status: week === 0 ? 'scheduled' : 'scheduled',
          topic: `${student.track} - Weekly Review`,
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          notes: `Weekly mentoring session for ${student.name}`
        });
      }
    });

    return schedules.sort((a, b) => a.date.localeCompare(b.date));
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mentor not found</h2>
        <Link
          href="/admin/mentors"
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Mentors
        </Link>
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
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Schedule Session
          </button>
        </div>
      </div>

      {/* Program Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Weekly Meeting Schedule by Program</h3>
        <div className="flex space-x-6">
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
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-sm">PCP: No weekly meetings</span>
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
                    isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
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
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold">Upcoming Sessions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions scheduled</h3>
                <p className="text-gray-500">Schedule your first mentoring session.</p>
              </div>
            ) : (
              schedules.map((session) => (
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
                          {session.meetingLink && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-700"
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
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit size={16} className="text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Date Details */}
      {selectedDate && (
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

      {/* Schedule Session Modal */}
      {showAddModal && (
        <ScheduleSessionModal
          mentor={mentor}
          students={students}
          onClose={() => setShowAddModal(false)}
          onSchedule={(sessionData: SessionFormData) => {
            // Add new session
            const newSession: MentorSchedule = {
                id: Date.now().toString(),
                studentId: sessionData.studentId,
                studentName: students.find(s => s.id === sessionData.studentId)?.name || '',
                studentProgram: students.find(s => s.id === sessionData.studentId)?.program || 'G-GMP',
                date: sessionData.date,
                startTime: sessionData.startTime,
                endTime: sessionData.endTime,
                status: 'scheduled',
                topic: sessionData.topic,
                notes: sessionData.notes,
                meetingLink: sessionData.meetingLink
            };
            setSchedules([...schedules, newSession].sort((a, b) => a.date.localeCompare(b.date)));
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// Schedule Session Modal Component
function ScheduleSessionModal({ mentor, students, onClose, onSchedule }: any) {
  const [formData, setFormData] = useState<SessionFormData>({
    studentId: '',
    date: '',
    startTime: '',
    endTime: '',
    topic: '',
    notes: '',
    meetingLink: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule(formData);
  };

  const getProgramDayHint = (program: string) => {
    if (program === 'G-GMP') return ' (Recommended: Monday)';
    if (program === 'G-CMP') return ' (Recommended: Wednesday)';
    if (program === 'E-TIP') return ' (Recommended: Friday)';
    if (program === 'PCP') return ' (No weekly meetings required)';
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Schedule New Session</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Student *
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a student</option>
              {students.map((student: any) => (
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Schedule Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}