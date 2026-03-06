'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/api';
import AdvancedFilters from '@/components/admin/AdvancedFilters';
import { filterData } from '@/utils/filterUtils';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';
import Link from 'next/link';
import { Search, Plus, Filter, Download, Upload } from 'lucide-react';
import StudentTable from '@/components/admin/StudentTable';

interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
  track: string;
  mentor: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
  progress: number;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  // Get filters from AdvancedFilters with the correct storage key
  const { filters, isInitialized } = useAdvancedFilters({ 
    storageKey: 'studentsFilters' // Make sure this matches your localStorage key
  });

  // Mark filters as loaded after first render
  useEffect(() => {
    setFiltersLoaded(true);
  }, []);

  // Log filters to debug
  useEffect(() => {
    if (filtersLoaded) {
      console.log('Current filters:', filters);
    }
  }, [filters, filtersLoaded]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await ApiService.getStudents();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Debug logging
  useEffect(() => {
    if (isInitialized) {
      console.log('Filters are initialized:', filters);
    }
  }, [filters, isInitialized]);

  // Apply filters only after initialization
  const filteredStudents = students.filter((student) => {
    // Local filters
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProgram = selectedProgram === 'all' || student.program === selectedProgram;
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

    if (!matchesSearch || !matchesProgram || !matchesStatus) return false;

    // Advanced filters - only apply if initialized and have filters
    if (isInitialized && Object.keys(filters).length > 0) {
      return filterData([student], filters).length > 0;
    }

    return true;
  });

  // Show loading state while filters are initializing
  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleExport = () => {
    const headers = [
      'Name',
      'Email',
      'Registration #',
      'Program',
      'Track',
      'Mentor',
      'Status',
      'Join Date',
      'Progress',
    ];
    const csvData = filteredStudents.map((s) => [
      s.name,
      s.email,
      s.registrationNumber,
      s.program,
      s.track,
      s.mentor,
      s.status,
      s.joinDate,
      `${s.progress}%`,
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug info - remove after fixing
      <div className="bg-gray-100 p-4 rounded-lg text-xs">
        <p>Filters loaded: {JSON.stringify(filters)}</p>
        <p>Filtered count: {filteredStudents.length}</p>
        <p>Total students: {students.length}</p>
      </div> */}
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>
          <Link
            href="/admin/students/import"
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Upload size={18} className="mr-2" />
            Import
          </Link>
          <Link
            href="/admin/students/add"
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Search and Basic Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search students by name, email, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary-50 border-primary-300 text-primary-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} className="mr-2" />
            Basic Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Programs</option>
                <option value="G-GMP">G-GMP</option>
                <option value="G-CMP">G-CMP</option>
                <option value="E-TIP">E-TIP</option>
                <option value="PCP">PCP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedProgram('all');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900"
              >
                Clear Basic Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters context="students" />

      {/* Students Table */}
      <StudentTable students={filteredStudents} />
    </div>
  );
}
