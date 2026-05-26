'use client';

import { useState, useEffect } from 'react';
import { useAdminStudents } from '@/hooks/api/useAdmin';
import AdvancedFilters from '@/components/admin/AdvancedFilters';
import { filterData } from '@/utils/filterUtils';
import { useAdvancedFilters } from '@/hooks/useAdvancedFilters';
import Link from 'next/link';
import { Search, Plus, Filter, Download, Upload, Users, Activity, GraduationCap, Award } from 'lucide-react';
import StudentTable from '@/components/admin/StudentTable';
import LoaderOne from '@/components/ui/loader-one';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { data: students = [], isLoading: loading } = useAdminStudents();
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

  // Dynamic metrics for the KPI dashboard
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'active').length;
  const mentorLedStudents = students.filter((s) => s.program !== 'PCP').length;
  const selfPacedStudents = students.filter((s) => s.program === 'PCP').length;

  // Show loading state while filters are initializing
  if (loading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderOne />
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
    <div className="space-y-8 p-6 md:p-8 pb-24 bg-gradient-to-br from-slate-50 via-orange-50/10 to-stone-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 font-montserrat">
            Students Directory
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage, filter, and track enrollments across all academic programs.
          </p>
        </div>
        
        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200 active:scale-[0.98] transition-all font-bold text-sm shadow-sm"
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
          
          <Link
            href="/admin/students/import"
            className="flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200 active:scale-[0.98] transition-all font-bold text-sm shadow-sm"
          >
            <Upload size={16} className="mr-2" />
            Bulk Import
          </Link>
          
          <Link
            href="/admin/students/add"
            className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.97] hover:scale-[1.02] transition-all font-bold text-sm"
          >
            <Plus size={18} className="mr-1.5" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Dynamic Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Students',
            value: totalStudents,
            icon: Users,
            description: 'Active enrollments total',
            color: 'from-orange-500 to-amber-500',
            bg: 'bg-orange-50 text-orange-600 border-orange-100',
          },
          {
            title: 'Active Status',
            value: activeStudents,
            icon: Activity,
            description: 'Participating in programs',
            color: 'from-emerald-500 to-teal-500',
            bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            pulse: true,
          },
          {
            title: 'Mentor-Led Tracks',
            value: mentorLedStudents,
            icon: GraduationCap,
            description: 'G-GMP, G-CMP, E-TIP programs',
            color: 'from-blue-500 to-indigo-500',
            bg: 'bg-blue-50 text-blue-600 border-blue-100',
          },
          {
            title: 'Self-Paced Track',
            value: selfPacedStudents,
            icon: Award,
            description: 'PCP program participants',
            color: 'from-purple-500 to-pink-500',
            bg: 'bg-purple-50 text-purple-600 border-purple-100',
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group"
          >
            {/* Accent light blob decoration */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-orange-100/15 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{card.title}</p>
                <h4 className="text-3xl font-black tracking-tight text-slate-800 mt-2 font-montserrat">
                  {card.value}
                </h4>
              </div>
              <div className={`p-2.5 rounded-2xl border ${card.bg} transition-all duration-300 group-hover:scale-110`}>
                <card.icon size={22} className="stroke-[2.2px]" />
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-400 font-medium">
              {card.pulse && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <span>{card.description}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search Bar & Basic Filters Toolbar */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full relative group">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-2xl placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white transition-all shadow-inner font-medium text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center px-6 py-3 border rounded-2xl transition-all font-bold text-sm shadow-sm w-full md:w-auto ${showFilters
              ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'
              : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200 hover:text-orange-600 hover:bg-orange-50/30'
              }`}
          >
            <Filter size={16} className="mr-2" />
            Quick Filters
          </button>
        </div>

        {/* Quick Filters Panel Expansion */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 mt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Program</label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white text-slate-700 font-semibold text-sm transition-all"
                  >
                    <option value="all">All Programs</option>
                    <option value="G-GMP">G-GMP</option>
                    <option value="G-CMP">G-CMP</option>
                    <option value="E-TIP">E-TIP</option>
                    <option value="PCP">PCP</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 focus:bg-white text-slate-700 font-semibold text-sm transition-all"
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
                    className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-orange-500 active:scale-[0.98] transition-all w-full md:w-auto text-left"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-slate-200/60 p-6">
        <AdvancedFilters context="students" />
      </div>

      {/* Custom Students Data Table */}
      <div className="rounded-3xl border border-slate-200/60 overflow-hidden bg-white/70 backdrop-blur-md shadow-sm">
        <StudentTable students={filteredStudents} />
      </div>
    </div>
  );
}

