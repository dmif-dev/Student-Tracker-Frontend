// packages/web/app/mentor/students/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  FileText,
  BookOpen,
  Code,
  Brain,
  GraduationCap,
  Download,
  Eye,
  Plus,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  X,
  Video,
  Users,
  Edit,
  Trash2
} from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import { DocumentService } from '@/services/documentService';
import DocumentViewer from '@/components/common/DocumentViewer';
import { DocumentViewerService } from '@/services/documentViewerService';
import { FileHandlerService } from '@/services/fileHandlerService';
import { mapStudent } from '@/utils/dataMappers';
import { useCurrentMentor } from '@/hooks/api/useMentor';
import MessageModal from '@/components/mentor/MessageModal';
import LoaderOne from '@/components/ui/loader-one';

interface Student {
  id: string;
  name: string;
  email: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP';
  track: string;
  progress: number;
  joinDate: string;
  lastActive: string;
  phone?: string;
  documents?: {
    viewed: number;
    downloaded: number;
  };
  assignments?: {
    completed: number;
    pending: number;
    total: number;
  };
  rawActivities?: any[];
  rawAssignments?: any[];
}

interface Session {
  id: string;
  studentId: string;
  studentName: string;
  studentProgram: 'G-GMP' | 'G-CMP' | 'E-TIP';
  studentTrack: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  topic: string;
  notes?: any; // Can be string or array of note objects
  meetingLink?: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  viewed: boolean;
  downloaded: boolean;
  fileUrl?: string;
  fileType?: string;
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

export default function MentorStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'documents' | 'assignments'>('overview');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  
  const { data: mentor } = useCurrentMentor();

  useEffect(() => {
    fetchStudentData();
  }, [params.id]);

  const fetchStudentData = async () => {
    try {
      const studentData = await apiClient.get<any>(`mentor/students/${params.id}`);
      
      // Fetch mentor's schedule to get sessions for this student
      const schedule = await apiClient.get<any[]>('mentor/sessions');
      const studentSessions = schedule
        .filter((s: any) => s.studentId === params.id || s.student?.id === params.id)
        .map((s: any) => ({
          id: s.id,
          studentId: s.student?.id || s.studentId,
          studentName: s.student?.name || 'Unknown',
          studentProgram: (s.student?.programId || 'G-GMP') as 'G-GMP' | 'G-CMP' | 'E-TIP',
          studentTrack: s.student?.track?.name || s.student?.trackId || '',
          date: s.date ? new Date(s.date).toISOString().split('T')[0] : '',
          startTime: s.startTime,
          endTime: s.endTime,
          status: s.status?.toLowerCase() || 'scheduled',
          topic: s.topic,
          meetingLink: s.meetingLink,
          notes: s.notes,
        }));
      
      // Map documents accessible to this student from real backend data
      const studentDocs = (studentData.documentPermissions || []).map((p: any) => p.document).filter(Boolean);
      
      const myDocuments = studentDocs.map((d: any) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        fileName: d.fileName,
        fileSize: d.fileSize,
        fileUrl: d.fileUrl,
        fileType: d.fileType,
        uploadedAt: d.createdAt,
        viewed: true, // Backend logic for tracking individual user view status will be needed
        downloaded: false,
      }));
      
      const mappedStudent = mapStudent(studentData);
      
      // Compute actual assignments stats from backend data
      const studentSubmissions = studentData.submissions || [];
      const completedAssignments = studentSubmissions.filter((s: any) => s.status === 'GRADED' || s.status === 'SUBMITTED').length;
      
      // Build activities list by merging outcomes and daily progress
      const mergedActivities = [
        ...(studentData.dailyProgress || []).map((p: any) => ({ ...p, activityType: 'progress', date: p.date })),
        ...(studentData.outcomes || []).map((o: any) => ({ ...o, activityType: 'outcome', date: o.date })),
        ...(studentData.submissions || []).map((s: any) => ({ ...s, activityType: 'submission', date: s.submittedAt }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setStudent({
        ...mappedStudent,
        documents: {
          viewed: studentData._count?.documentPermissions || 0,
          downloaded: 0,
        },
        assignments: {
          completed: completedAssignments,
          pending: studentData._count?.submissions ? studentData._count.submissions - completedAssignments : 0,
          total: studentData._count?.submissions || 0,
        },
        rawActivities: mergedActivities,
        rawAssignments: studentSubmissions,
      } as any);
      
      setSessions(studentSessions);
      setDocuments(myDocuments);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = async (sessionData: SessionFormData) => {
    try {
      if (!student) return;

      // Create new session
      const newSession: Session = {
        id: Date.now().toString(),
        studentId: student.id,
        studentName: student.name,
        studentProgram: student.program,
        studentTrack: student.track,
        date: sessionData.date,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        status: 'scheduled',
        topic: sessionData.topic,
        notes: sessionData.notes,
        meetingLink: sessionData.meetingLink || 'https://meet.google.com/abc-defg-hij',
      };

      // Real API call
      await apiClient.post('mentor/sessions', {
        studentId: student.id,
        date: sessionData.date,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        topic: sessionData.topic,
        meetingLink: sessionData.meetingLink,
      });

      // Update local state
      setSessions([...sessions, newSession].sort((a, b) => a.date.localeCompare(b.date)));
      setShowScheduleModal(false);
    } catch (error) {
      console.error('Error scheduling session:', error);
      alert('Failed to schedule session. Please try again.');
    }
  };

  const handleViewDocument = async (doc: Document) => {
    setSelectedDocument(doc);
    setShowViewer(true);
    
    // Track the view
    if (mentor?.id) {
      await DocumentViewerService.trackView(doc.id, mentor.id, 'mentor');
    }
  };

  const handleDownloadDocument = async (doc: Document, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    try {
      // Track the download
      if (mentor?.id) {
        await DocumentViewerService.trackDownload(doc.id, mentor.id, 'mentor');
      }
      
      // Download the file
      await FileHandlerService.downloadFile({
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        fileType: doc.fileType || 'application/octet-stream',
        fileSize: doc.fileSize,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getProgramIcon = (program: string) => {
    switch (program) {
      case 'G-GMP': return <Brain size={20} className="text-purple-500" />;
      case 'G-CMP': return <Code size={20} className="text-green-500" />;
      case 'E-TIP': return <Award size={20} className="text-blue-500" />;
      default: return <GraduationCap size={20} className="text-gray-500" />;
    }
  };

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700',
      'G-CMP': 'bg-green-100 text-green-700',
      'E-TIP': 'bg-blue-100 text-blue-700',
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
        <Link href="/mentor/students" className="text-orange-600 hover:text-orange-700">
          Back to My Students
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
            href="/mentor/students"
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
            <p className="text-gray-500 mt-1">{student.email}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => { window.location.href = `mailto:${student.email}`; }}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Mail size={18} className="mr-2" />
            Send Email
          </button>
          <button
            onClick={() => setShowMessageModal(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <MessageCircle size={18} className="mr-2" />
            Message
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Progress</p>
          <p className="text-2xl font-bold text-gray-900">{student.progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`rounded-full h-2 ${
                student.program === 'G-GMP' ? 'bg-purple-500' :
                student.program === 'G-CMP' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${student.progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Track</p>
          <p className="text-lg font-semibold text-gray-900">{student.track}</p>
          <p className="text-xs text-gray-500 mt-2">
            Joined {new Date(student.joinDate).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Documents</p>
          <p className="text-2xl font-bold text-gray-900">{student.documents?.viewed || 0}</p>
          <p className="text-xs text-gray-500 mt-2">
            {student.documents?.downloaded || 0} downloads
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Assignments</p>
          <p className="text-2xl font-bold text-gray-900">
            {student.assignments?.completed || 0}/{student.assignments?.total || 0}
          </p>
          <p className="text-xs text-orange-600 mt-2">
            {student.assignments?.pending || 0} pending
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sessions'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Documents ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assignments
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
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
                <div>
                  <p className="text-sm text-gray-500">Last Active</p>
                  <p className="text-gray-900">{new Date(student.lastActive).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="text-gray-900">{student.program}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {student.rawActivities && student.rawActivities.length > 0 ? (
                  student.rawActivities.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      {activity.activityType === 'progress' && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <TrendingUp size={16} className="text-blue-600" />
                        </div>
                      )}
                      {activity.activityType === 'outcome' && (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle size={16} className="text-green-600" />
                        </div>
                      )}
                      {activity.activityType === 'submission' && (
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <FileText size={16} className="text-purple-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {activity.activityType === 'progress' && `Progress: ${activity.status || activity.category}`}
                          {activity.activityType === 'outcome' && `Outcome Achieved: ${activity.title}`}
                          {activity.activityType === 'submission' && `Submitted Assignment`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Next Session */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Next Session</h3>
              {sessions.filter(s => new Date(s.date) > new Date()).length > 0 ? (
                <div>
                  <p className="text-sm font-medium">
                    {new Date(sessions[0].date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {sessions[0].startTime} - {sessions[0].endTime}
                  </p>
                  <p className="text-sm mt-3">{sessions[0].topic}</p>
                  <button
                    onClick={() => {
                      const link = sessions[0].meetingLink;
                      if (link) {
                        window.open(link, '_blank', 'noopener,noreferrer');
                      } else {
                        alert('No meeting link available for this session.');
                      }
                    }}
                    className="mt-4 w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Join Session
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500">No upcoming sessions</p>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Schedule Session
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/mentor/documents/upload?student=${student.id}`}
                  className="block w-full px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 text-center text-sm"
                >
                  <Plus size={16} className="inline mr-2" />
                  Upload Document
                </Link>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="block w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-center text-sm"
                >
                  Schedule Session
                </button>
                <button className="block w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 text-center text-sm">
                  Send Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Session History</h3>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus size={18} className="mr-2" />
              Schedule New Session
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
              <p className="text-gray-500">Schedule your first session with this student.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      session.status === 'completed' ? 'bg-green-500' :
                      session.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">{session.topic}</p>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </span>
                      </div>
                      {session.notes && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          {Array.isArray(session.notes) ? (
                            session.notes.length > 0 ? (
                              <>
                                <span className="font-medium">Last session notes:</span>{' '}
                                {session.notes[session.notes.length - 1].content?.substring(0, 100) || ''}
                                {session.notes[session.notes.length - 1].content?.length > 100 ? '...' : ''}
                              </>
                            ) : null
                          ) : (
                            <>{session.notes}</>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'completed' ? 'bg-green-100 text-green-700' :
                      session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {session.status}
                    </span>
                    {session.meetingLink && session.status === 'scheduled' && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-200 rounded-lg"
                        title="Join Meeting"
                      >
                        <Video size={16} className="text-orange-600" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Shared Documents</h3>
            <Link
              href={`/mentor/documents/upload?student=${student.id}`}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus size={18} className="mr-2" />
              Upload New
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-500">Share your first document with this student.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText size={20} className="text-gray-500" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span>
                          {doc.type === 'learning_material' && 'Learning Material'}
                          {doc.type === 'assignment_material' && 'Assignment'}
                          {doc.type === 'pre_reading_material' && 'Pre-Reading'}
                        </span>
                        <span>•</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.viewed && (
                      <span className="text-xs text-green-600">Viewed</span>
                    )}
                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                      title="Preview"
                    >
                      <Eye size={18} className="text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => handleDownloadDocument(doc, e)}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                      title="Download"
                    >
                      <Download size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Assignments</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-700">{student.assignments?.completed || 0}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">{student.assignments?.pending || 0}</p>
            </div>
          </div>

          <div className="space-y-4">
            {student.rawAssignments && student.rawAssignments.length > 0 ? (
              student.rawAssignments.map((submission: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{submission.assignment?.title || 'Assignment Submission'}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      submission.status === 'GRADED' || submission.status === 'SUBMITTED' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {submission.status || 'PENDING'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button className="text-sm text-orange-600 hover:text-orange-700">View Submission</button>
                    {submission.status === 'GRADED' ? (
                      <button className="text-sm text-orange-600 hover:text-orange-700">View Feedback</button>
                    ) : (
                      <button className="text-sm text-orange-600 hover:text-orange-700">Add Feedback</button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No assignments submitted yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showScheduleModal && student && (
        <ScheduleSessionModal
          student={student}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleScheduleSession}
        />
      )}

      {/* Document Viewer Modal */}
      {showViewer && selectedDocument && (
        <DocumentViewer
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setSelectedDocument(null);
          }}
          document={{
            id: selectedDocument.id,
            title: selectedDocument.title,
            fileName: selectedDocument.fileName,
            fileType: selectedDocument.fileType || 'application/pdf',
            fileUrl: selectedDocument.fileUrl || '',
            fileSize: selectedDocument.fileSize,
          }}
        />
      )}

      {/* Message Modal */}
      {student && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          studentId={student.id}
          studentName={student.name}
        />
      )}
    </div>
  );
}

// ==================== ScheduleSessionModal Component ====================

function ScheduleSessionModal({ student, onClose, onSchedule }: { 
  student: Student; 
  onClose: () => void; 
  onSchedule: (sessionData: SessionFormData) => void;
}) {
  const [formData, setFormData] = useState<SessionFormData>({
    studentId: student.id,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Schedule Session with {student.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
              {student.name} ({student.program} - {student.track})
            </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {getProgramDayHint(student.program)}
            </p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Schedule Session
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}