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
  Download
} from 'lucide-react';
import { ApiService } from '@/services/api';

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
}

export default function MentorStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mentor, setMentor] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');

  useEffect(() => {
    const fetchMentorAndStudents = async () => {
      try {
        const mentorData = await ApiService.getMentorById(params.id as string);
        if (mentorData) {
          setMentor(mentorData);
          
          // Mock students data - replace with actual API call
          const mockStudents: Student[] = [
            {
              id: '1',
              name: 'John Doe',
              email: 'john.doe@example.com',
              registrationNumber: 'DMIF2024001',
              program: 'G-GMP',
              track: 'Patent Track',
              progress: 75,
              joinDate: '2024-01-15',
              lastSession: '2024-03-20',
              nextSession: '2024-03-27',
              outcomes: { patents: 1, papers: 0, projects: 2 }
            },
            {
              id: '5',
              name: 'Alex Chen',
              email: 'alex.chen@example.com',
              registrationNumber: 'DMIF2024005',
              program: 'G-GMP',
              track: 'Research Paper Track',
              progress: 45,
              joinDate: '2024-01-20',
              lastSession: '2024-03-19',
              nextSession: '2024-03-26',
              outcomes: { patents: 0, papers: 1, projects: 1 }
            },
            {
              id: '6',
              name: 'Emily Brown',
              email: 'emily.b@example.com',
              registrationNumber: 'DMIF2024006',
              program: 'G-CMP',
              track: 'Full Stack Development',
              progress: 30,
              joinDate: '2024-02-15',
              lastSession: '2024-03-18',
              nextSession: '2024-03-25',
              outcomes: { patents: 0, papers: 0, projects: 1 }
            }
          ];
          
          setStudents(mockStudents);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMentorAndStudents();
    }
  }, [params.id]);

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700',
      'G-CMP': 'bg-green-100 text-green-700',
      'E-TIP': 'bg-blue-100 text-blue-700',
      'PCP': 'bg-orange-100 text-orange-700'
    };
    return colors[program as keyof typeof colors] || 'bg-gray-100 text-gray-700';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Mentor not found</h2>
        <Link
          href="/admin/mentors"
          className="text-primary-600 hover:text-primary-700"
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
              Managing {students.length} assigned students
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Programs</option>
            <option value="G-GMP">G-GMP</option>
            <option value="G-CMP">G-CMP</option>
            <option value="E-TIP">E-TIP</option>
            <option value="PCP">PCP</option>
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
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgramColor(student.program)}`}>
                          {student.program}
                        </span>
                        <div className="text-sm text-gray-600">{student.track}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 rounded-full h-2"
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
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
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
            <h4 className="font-medium text-purple-700 mb-2">G-GMP Students</h4>
            <p className="text-2xl font-bold text-purple-700">
              {students.filter(s => s.program === 'G-GMP').length}
            </p>
            <p className="text-sm text-purple-600 mt-1">Sessions on Mondays</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">G-CMP Students</h4>
            <p className="text-2xl font-bold text-green-700">
              {students.filter(s => s.program === 'G-CMP').length}
            </p>
            <p className="text-sm text-green-600 mt-1">Sessions on Wednesdays</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2">E-TIP Students</h4>
            <p className="text-2xl font-bold text-blue-700">
              {students.filter(s => s.program === 'E-TIP').length}
            </p>
            <p className="text-sm text-blue-600 mt-1">Sessions on Fridays</p>
          </div>
        </div>
      </div>
    </div>
  );
}