// packages/web/app/admin/mentors/[id]/students/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  GraduationCap,
  Calendar,
  TrendingUp,
  Award,
  Mail,
  Clock,
  Filter,
  Download,
  Info,
  UserCheck,
  BookOpen,
  Code,
  Brain
} from 'lucide-react';
import { useAdminMentor } from '@/hooks/api/useAdmin';

interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
  track: string;
  progress: number;
  joinDate: string;
  lastSession?: string;
  nextSession?: string;
  outcomes: {
    patents: number;
    papers: number;
    projects: number;
  };
  hasMentor: boolean;
}

// Interface for assigned student from mentor data
interface AssignedStudent {
  id: string;
  name: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
  track: string;
  joinDate: string;
  lastSession?: string;
  nextSession?: string;
  progress: number;
  hasMentor: boolean;
}

export default function MentorStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: mentorData, isLoading: loading } = useAdminMentor(params.id as string);
  const mentor = mentorData;
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');

  useEffect(() => {
    if (mentorData) {
      try {
        // Filter out PCP students from assigned students
          
          // Filter out PCP students from assigned students
          const nonPCPStudents = (mentorData.assignedStudents || []).filter(
            (s: AssignedStudent) => s.program !== 'PCP'
          );
          
          // Map AssignedStudent to Student type
          const mappedStudents: Student[] = nonPCPStudents.map((s: AssignedStudent) => ({
            id: s.id,
            name: s.name,
            email: `${s.name.toLowerCase().replace(' ', '.')}@example.com`, // Generate email
            registrationNumber: `DMIF2024${s.id.padStart(3, '0')}`, // Generate registration number
            program: s.program,
            track: s.track,
            progress: s.progress,
            joinDate: s.joinDate,
            lastSession: s.lastSession,
            nextSession: s.nextSession,
            outcomes: {
              patents: 0, // Default values
              papers: 0,
              projects: 0
            },
            hasMentor: s.hasMentor
          }));
          
          // Set actual assigned students from API
          setStudents(mappedStudents);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  }, [mentorData]);

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
        return <Brain size={16} className="text-purple-500" />;
      case 'G-CMP':
        return <Code size={16} className="text-green-500" />;
      case 'E-TIP':
        return <Award size={16} className="text-blue-500" />;
      default:
        return <BookOpen size={16} className="text-gray-500" />;
    }
  };

  const getSessionStatus = (nextSession?: string) => {
    if (!nextSession) return { label: 'Not scheduled', color: 'bg-gray-100 text-gray-600' };
    
    const today = new Date();
    const sessionDate = new Date(nextSession);
    const diffDays = Math.ceil((sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-600' };
    if (diffDays === 0) return { label: 'Today', color: 'bg-green-100 text-green-600' };
    if (diffDays <= 2) return { label: 'Upcoming', color: 'bg-yellow-100 text-yellow-600' };
    return { label: 'Scheduled', color: 'bg-blue-100 text-blue-600' };
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProgram = selectedProgram === 'all' || student.program === selectedProgram;
    
    return matchesSearch && matchesProgram;
  });

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Program', 'Track', 'Progress', 'Last Session', 'Next Session', 'Patents', 'Papers', 'Projects'];
    const csvData = filteredStudents.map(s => [
      s.name,
      s.email,
      s.program,
      s.track,
      `${s.progress}%`,
      s.lastSession || 'N/A',
      s.nextSession || 'N/A',
      s.outcomes.patents,
      s.outcomes.papers,
      s.outcomes.projects
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentor-${params.id}-students.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
            href={`/admin/mentors/${params.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mentor.name}'s Students
            </h1>
            <p className="text-gray-500 mt-1">
              Managing {students.length} students across G-GMP, G-CMP, and E-TIP programs
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download size={18} className="mr-2" />
          Export List
        </button>
      </div>

      {/* PCP Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> PCP (Professional Certification Program) students are self-paced and 
              do not require mentor assignment. They are not shown in this list.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{students.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">G-GMP Students</p>
          <p className="text-2xl font-bold text-purple-600">
            {students.filter(s => s.program === 'G-GMP').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">G-CMP Students</p>
          <p className="text-2xl font-bold text-green-600">
            {students.filter(s => s.program === 'G-CMP').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">E-TIP Students</p>
          <p className="text-2xl font-bold text-blue-600">
            {students.filter(s => s.program === 'E-TIP').length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search students by name, email, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Programs</option>
            <option value="G-GMP">G-GMP</option>
            <option value="G-CMP">G-CMP</option>
            <option value="E-TIP">E-TIP</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program & Track</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outcomes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const sessionStatus = getSessionStatus(student.nextSession);
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          {getProgramIcon(student.program)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgramColor(student.program)}`}>
                            {student.program}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{student.track}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-orange-600 rounded-full h-2"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.lastSession ? (
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {new Date(student.lastSession).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">No sessions</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.nextSession ? (
                        <div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock size={14} className="mr-1 text-gray-400" />
                            {new Date(student.nextSession).toLocaleDateString()}
                          </div>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${sessionStatus.color}`}>
                            {sessionStatus.label}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-3 text-sm">
                        <span className="text-purple-600" title="Patents">{student.outcomes.patents} 📄</span>
                        <span className="text-green-600" title="Papers">{student.outcomes.papers} 📝</span>
                        <span className="text-blue-600" title="Projects">{student.outcomes.projects} 🚀</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedProgram !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'This mentor has no students assigned yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Weekly Schedule Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Session Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Brain size={18} className="text-purple-700" />
              <h4 className="font-medium text-purple-700">G-GMP Students</h4>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {students.filter(s => s.program === 'G-GMP').length}
            </p>
            <p className="text-sm text-purple-600 mt-1">Sessions on Mondays</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Code size={18} className="text-green-700" />
              <h4 className="font-medium text-green-700">G-CMP Students</h4>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {students.filter(s => s.program === 'G-CMP').length}
            </p>
            <p className="text-sm text-green-600 mt-1">Sessions on Wednesdays</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Award size={18} className="text-blue-700" />
              <h4 className="font-medium text-blue-700">E-TIP Students</h4>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {students.filter(s => s.program === 'E-TIP').length}
            </p>
            <p className="text-sm text-blue-600 mt-1">Sessions on Fridays</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 flex items-center">
            <Info size={16} className="mr-2 text-gray-400" />
            PCP students are self-paced and do not require weekly mentoring sessions.
          </p>
        </div>
      </div>
    </div>
  );
}