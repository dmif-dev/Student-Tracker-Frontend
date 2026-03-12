// packages/web/app/mentor/students/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Calendar,
  Clock,
  Mail,
  ChevronRight,
  BookOpen,
  Code,
  Brain,
  Award,
  Download,
  Eye
} from 'lucide-react';
import { ApiService } from '@/services/api';

interface Student {
  id: string;
  name: string;
  email: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP';
  track: string;
  progress: number;
  joinDate: string;
  lastSession?: string;
  nextSession?: string;
  documents?: number;
  assignments?: number;
}

export default function MentorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock mentor ID - replace with actual auth
  const MENTOR_ID = '1';

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedProgram, students]);

  const fetchStudents = async () => {
    try {
      const mentor = await ApiService.getMentorById(MENTOR_ID);
      const assignedStudents = mentor?.assignedStudents || [];
      
      // Enhance student data with additional info
      const enhancedStudents = assignedStudents.map((s: any) => ({
        ...s,
        email: `${s.name.toLowerCase().replace(' ', '.')}@example.com`,
        documents: Math.floor(Math.random() * 10) + 5,
        assignments: Math.floor(Math.random() * 5) + 1,
      }));
      
      setStudents(enhancedStudents);
      setFilteredStudents(enhancedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.track.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedProgram !== 'all') {
      filtered = filtered.filter(s => s.program === selectedProgram);
    }

    setFilteredStudents(filtered);
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

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700',
      'G-CMP': 'bg-green-100 text-green-700',
      'E-TIP': 'bg-blue-100 text-blue-700',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor your assigned students
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          <Users size={16} />
          <span>{students.length} students</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search students by name, email, or track..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-orange-50 border-orange-300 text-orange-600' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Programs</option>
                <option value="G-GMP">G-GMP</option>
                <option value="G-CMP">G-CMP</option>
                <option value="E-TIP">E-TIP</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          const sessionStatus = getSessionStatus(student.nextSession);
          
          return (
            <Link
              key={student.id}
              href={`/mentor/students/${student.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-lg">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getProgramColor(student.program)}`}>
                  {student.program}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  {getProgramIcon(student.program)}
                  <span className="ml-2 text-gray-600">{student.track}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{student.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`rounded-full h-2 ${
                        student.program === 'G-GMP' ? 'bg-purple-500' :
                        student.program === 'G-CMP' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-100 pt-3">
                <div>
                  <p className="text-gray-500 mb-1">Next Session</p>
                  {student.nextSession ? (
                    <>
                      <p className="font-medium">{new Date(student.nextSession).toLocaleDateString()}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full ${sessionStatus.color}`}>
                        {sessionStatus.label}
                      </span>
                    </>
                  ) : (
                    <p className="text-gray-400">Not scheduled</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Documents</p>
                  <p className="font-medium">{student.documents} available</p>
                  <p className="text-xs text-gray-400 mt-1">{student.assignments} pending</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                  <Mail size={14} className="mr-1" />
                  Message
                </button>
                <span className="text-orange-600 text-sm flex items-center">
                  View Profile
                  <ChevronRight size={16} className="ml-1" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedProgram !== 'all'
              ? 'No students match your search criteria'
              : "You don't have any students assigned yet."}
          </p>
        </div>
      )}
    </div>
  );
}
