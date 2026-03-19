'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/api';
import AdvancedFilters from '@/components/admin/AdvancedFilters';
import { filterData } from '@/utils/filterUtils';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';
import Link from 'next/link';
import { Search, Plus, Filter, Download, Upload } from 'lucide-react';
import StudentTable from '@/components/admin/StudentTable';
import { motion } from 'framer-motion';

interface Student {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  program: 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
  track: string;
  mentor?: string;
  status: 'active' | 'inactive' | 'pending' | 'completed';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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

  return (
    <div className="space-y-8 p-6 pb-20 bg-gradient-to-br from-white via-orange-50/5 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-montserrat text-gray-900">Students</h1>
          <p className="text-muted-foreground mt-1">Manage and track your student directory across all programs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 transition-all font-bold text-sm"
          >
            <Download size={18} className="mr-2" />
            Export CSV
          </button>
          <Link
            href="/admin/students/import"
            className="flex items-center px-4 py-2 border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 transition-all font-bold text-sm"
          >
            <Upload size={18} className="mr-2" />
            Bulk Import
          </Link>
          <Link
            href="/admin/students/add"
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all font-bold text-sm"
          >
            <Plus size={18} className="mr-2" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Search and Basic Filters */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative group">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, email, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl placeholder:text-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all shadow-inner"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-6 py-3 border rounded-2xl transition-all font-bold shadow-sm ${showFilters
              ? 'bg-orange-500 border-orange-500 text-white shadow-orange-500/20'
              : 'bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:text-orange-600'
              }`}
          >
            <Filter size={18} className="mr-2" />
            Basic Filters
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="all">All Programs</option>
                <option value="G-GMP">G-GMP</option>
                <option value="G-CMP">G-CMP</option>
                <option value="E-TIP">E-TIP</option>
                <option value="PCP">PCP</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
                className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-orange-500 transition-colors"
              >
                Clear All Filter Options
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="mt-4">
        <AdvancedFilters context="students" />
      </div>

      {/* Students Table */}
      <div className="mt-8 rounded-2xl shadow-xl border-none overflow-hidden bg-white/70 backdrop-blur-md">
        <StudentTable students={filteredStudents} />
      </div>
    </div>
  );
}
