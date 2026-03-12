// packages/web/app/admin/reports/page.tsx

'use client';

import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  ChevronDown,
  TrendingUp,
  Users,
  Award,
  Clock,
  X,
  Edit,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv';
  size: string;
}

interface ScheduledReport {
  id: string;
  name: string;
  type: 'weekly' | 'monthly';
  schedule: string;
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  programs: string[];
  status: 'active' | 'paused';
  lastGenerated?: string;
  nextGeneration?: string;
}

export default function ReportsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedGenerator, setSelectedGenerator] = useState<string>('all');
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mock data - replace with API call
  const allReports: Report[] = [
    {
      id: '1',
      name: 'Weekly Progress Report - Week 12',
      type: 'weekly',
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'System',
      format: 'pdf',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Monthly Analytics - February 2024',
      type: 'monthly',
      generatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'Admin',
      format: 'excel',
      size: '1.8 MB',
    },
    {
      id: '3',
      name: 'Weekly Progress Report - Week 11',
      type: 'weekly',
      generatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'System',
      format: 'pdf',
      size: '2.3 MB',
    },
    {
      id: '4',
      name: 'Monthly Analytics - January 2024',
      type: 'monthly',
      generatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'Admin',
      format: 'excel',
      size: '1.9 MB',
    },
  ];

  // Mock scheduled reports data
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 'sched1',
      name: 'Weekly Progress Report',
      type: 'weekly',
      schedule: 'Every Monday',
      time: '09:00 AM',
      recipients: ['admin@dmif.org', 'mentors@dmif.org'],
      format: 'pdf',
      programs: ['G-GMP', 'G-CMP', 'E-TIP', 'PCP'],
      status: 'active',
      lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      nextGeneration: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'sched2',
      name: 'Monthly Analytics Report',
      type: 'monthly',
      schedule: '1st of every month',
      time: '12:00 PM',
      recipients: ['admin@dmif.org', 'leadership@dmif.org'],
      format: 'excel',
      programs: ['G-GMP', 'G-CMP', 'E-TIP', 'PCP'],
      status: 'active',
      lastGenerated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      nextGeneration: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  // Only two report templates as requested
  const reportTemplates = [
    {
      id: 'weekly-progress',
      name: 'Weekly Progress Report',
      description: 'Student progress, attendance, and activity for the week',
      icon: Clock,
      color: 'blue',
      href: '/admin/reports/generate?template=weekly-progress',
    },
    {
      id: 'monthly-analytics',
      name: 'Monthly Analytics Report',
      description: 'Comprehensive analytics including trends and outcomes',
      icon: TrendingUp,
      color: 'green',
      href: '/admin/reports/generate?template=monthly-analytics',
    },
  ];

  // Get unique values for filter options
  const uniqueGenerators = useMemo(() => {
    const generators = allReports.map(report => report.generatedBy);
    return ['all', ...Array.from(new Set(generators))];
  }, []);

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText size={16} className="text-red-500" />;
      case 'excel':
        return <FileText size={16} className="text-green-500" />;
      case 'csv':
        return <FileText size={16} className="text-orange-500" />;
      default:
        return <FileText size={16} />;
    }
  };

  // Format date helper for consistent rendering
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  // Filter reports based on selected filters
  const filteredReports = useMemo(() => {
    return allReports.filter(report => {
      if (selectedType !== 'all' && report.type !== selectedType) return false;
      if (selectedFormat !== 'all' && report.format !== selectedFormat) return false;
      if (selectedGenerator !== 'all' && report.generatedBy !== selectedGenerator) return false;

      if (dateRange !== 'all') {
        const reportDate = new Date(report.generatedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - reportDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const range = parseInt(dateRange);
        if (!isNaN(range) && diffDays > range) return false;
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return report.name.toLowerCase().includes(searchLower) ||
          report.generatedBy.toLowerCase().includes(searchLower);
      }

      return true;
    });
  }, [allReports, selectedType, selectedFormat, selectedGenerator, dateRange, searchTerm]);

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedFormat('all');
    setSelectedGenerator('all');
    setDateRange('30');
    setSearchTerm('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (selectedFormat !== 'all') count++;
    if (selectedGenerator !== 'all') count++;
    if (searchTerm) count++;
    if (dateRange !== '30') count++;
    return count;
  };

  const handleEditSchedule = (schedule: ScheduledReport) => {
    setEditingSchedule(schedule);
    setShowEditModal(true);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    if (confirm('Are you sure you want to delete this scheduled report?')) {
      setScheduledReports(scheduledReports.filter(s => s.id !== scheduleId));
    }
  };

  const handleToggleStatus = (scheduleId: string) => {
    setScheduledReports(scheduledReports.map(s =>
      s.id === scheduleId
        ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
        : s
    ));
  };

  const handleSaveSchedule = (updatedSchedule: ScheduledReport) => {
    setScheduledReports(scheduledReports.map(s =>
      s.id === updatedSchedule.id ? updatedSchedule : s
    ));
    setShowEditModal(false);
    setEditingSchedule(null);
  };

  // Don't render dynamic content until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-48 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <Link
          href="/admin/reports/generate">
          <Button className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
            <FileText size={18} className="mr-2" />
            Generate Report
          </Button>
        </Link>
      </div>

      {/* Report Templates - Only 2 templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTemplates.map((template) => {
          const Icon = template.icon;
          const colorClasses = {
            blue: 'bg-orange-50 text-orange-600 border-orange-200',
            green: 'bg-green-50 text-green-600 border-green-200',
          };

          return (
            <Link
              key={template.id}
              href={template.href}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer block"
            >
              <div
                className={`w-10 h-10 rounded-lg ${colorClasses[template.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}
              >
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{template.description}</p>
              <span className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                Generate →
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search reports by name or generator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10"
            />
            <FileText size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors relative ${showFilters || getActiveFilterCount() > 0
              ? 'bg-orange-50 border-orange-300 text-orange-600'
              : 'border-gray-300 hover:bg-gray-50'
              }`}
          >
            <Filter size={18} className="mr-2" />
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
                {getActiveFilterCount()}
              </span>
            )}
          </Button>

          {/* Clear Filters Button */}
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Types</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Format Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Formats</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              {/* Generated By Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Generated By
                </label>
                <select
                  value={selectedGenerator}
                  onChange={(e) => setSelectedGenerator(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {uniqueGenerators.map((generator) => (
                    <option key={generator} value={generator}>
                      {generator === 'all' ? 'All' : generator}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                  <option value="all">All time</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredReports.length}</span> of{' '}
          <span className="font-medium">{allReports.length}</span> reports
        </p>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Generated Reports</h2>
        </div>

        {filteredReports.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => {
              const formatted = formatDate(report.generatedAt);
              return (
                <div
                  key={report.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getFormatIcon(report.format)}
                    <div>
                      <h3 className="font-medium text-gray-900">{report.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="capitalize">{report.type}</span>
                        <span>•</span>
                        <span suppressHydrationWarning>
                          {formatted.date} {formatted.time}
                        </span>
                        <span>•</span>
                        <span>By {report.generatedBy}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Download size={18} className="text-gray-700" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronDown size={18} className="text-gray-700" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">
              {getActiveFilterCount() > 0
                ? 'No reports match your current filters. Try adjusting your criteria.'
                : 'Generate your first report to get started.'}
            </p>
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Scheduled Reports</h2>
          <Button className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
            + Add Schedule
          </Button>
        </div>
        <div className="space-y-4">
          {scheduledReports.map((schedule) => {
            const lastGenFormatted = schedule.lastGenerated ? formatDate(schedule.lastGenerated) : null;
            const nextGenFormatted = schedule.nextGeneration ? formatDate(schedule.nextGeneration) : null;

            return (
              <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${schedule.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <Calendar size={20} className={schedule.type === 'weekly' ? 'text-orange-500' : 'text-green-500'} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{schedule.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${schedule.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {schedule.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                      <span>{schedule.schedule} at {schedule.time}</span>
                      <span>•</span>
                      <span>Format: {schedule.format.toUpperCase()}</span>
                      <span>•</span>
                      <span>Programs: {schedule.programs.join(', ')}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                      <span suppressHydrationWarning>
                        Last: {lastGenFormatted ? `${lastGenFormatted.date} ${lastGenFormatted.time}` : 'Never'}
                      </span>
                      <span>•</span>
                      <span suppressHydrationWarning>
                        Next: {nextGenFormatted ? `${nextGenFormatted.date} ${nextGenFormatted.time}` : 'Not scheduled'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(schedule.id)}
                    className={`p-2 rounded-lg transition-colors ${schedule.status === 'active'
                      ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    title={schedule.status === 'active' ? 'Pause' : 'Resume'}
                  >
                    {schedule.status === 'active' ? <Clock size={16} /> : <Check size={16} />}
                  </button>
                  <button
                    onClick={() => handleEditSchedule(schedule)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-red-500"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Schedule Modal */}
      {showEditModal && editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          onClose={() => {
            setShowEditModal(false);
            setEditingSchedule(null);
          }}
          onSave={handleSaveSchedule}
        />
      )}
    </div>
  );
}

// Edit Schedule Modal Component
function EditScheduleModal({ schedule, onClose, onSave }: {
  schedule: ScheduledReport;
  onClose: () => void;
  onSave: (updated: ScheduledReport) => void;
}) {
  const [formData, setFormData] = useState({
    name: schedule.name,
    type: schedule.type,
    schedule: schedule.schedule,
    time: schedule.time,
    format: schedule.format,
    programs: schedule.programs,
    recipients: schedule.recipients.join(', '),
    status: schedule.status,
  });

  const programs = ['G-GMP', 'G-CMP', 'E-TIP', 'PCP'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: ScheduledReport = {
      ...schedule,
      name: formData.name,
      type: formData.type as 'weekly' | 'monthly',
      schedule: formData.schedule,
      time: formData.time,
      format: formData.format as 'pdf' | 'excel' | 'csv',
      programs: formData.programs,
      recipients: formData.recipients.split(',').map(r => r.trim()),
      status: formData.status as 'active' | 'paused',
    };

    onSave(updated);
  };

  const toggleProgram = (program: string) => {
    setFormData(prev => ({
      ...prev,
      programs: prev.programs.includes(program)
        ? prev.programs.filter(p => p !== program)
        : [...prev.programs, program]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Scheduled Report</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'weekly' | 'monthly' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value as 'pdf' | 'excel' | 'csv' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule
              </label>
              <select
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Every Monday">Every Monday</option>
                <option value="Every Tuesday">Every Tuesday</option>
                <option value="Every Wednesday">Every Wednesday</option>
                <option value="Every Thursday">Every Thursday</option>
                <option value="Every Friday">Every Friday</option>
                <option value="1st of every month">1st of every month</option>
                <option value="15th of every month">15th of every month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Programs
            </label>
            <div className="flex flex-wrap gap-2">
              {programs.map((program) => (
                <button
                  key={program}
                  type="button"
                  onClick={() => toggleProgram(program)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${formData.programs.includes(program)
                    ? program === 'G-GMP' ? 'bg-purple-100 text-purple-700' :
                      program === 'G-CMP' ? 'bg-green-100 text-green-700' :
                        program === 'E-TIP' ? 'bg-orange-100 text-orange-700' :
                          'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {program}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Recipients
            </label>
            <input
              type="text"
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple emails with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.status === 'active'}
                  onChange={() => setFormData({ ...formData, status: 'active' })}
                  className="mr-2"
                />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.status === 'paused'}
                  onChange={() => setFormData({ ...formData, status: 'paused' })}
                  className="mr-2"
                />
                <span className="text-sm">Paused</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

