'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  ChevronDown,
  PieChart,
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Clock,
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

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState('30');

  // Mock data - replace with API call
  const reports: Report[] = [
    {
      id: '1',
      name: 'Weekly Progress Report - Week 12',
      type: 'weekly',
      generatedAt: '2024-03-21T10:30:00',
      generatedBy: 'System',
      format: 'pdf',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Monthly Analytics - February 2024',
      type: 'monthly',
      generatedAt: '2024-03-01T00:00:00',
      generatedBy: 'Admin',
      format: 'excel',
      size: '1.8 MB',
    },
    {
      id: '3',
      name: 'Outcomes Summary - Q1 2024',
      type: 'quarterly',
      generatedAt: '2024-03-31T23:59:59',
      generatedBy: 'System',
      format: 'pdf',
      size: '3.1 MB',
    },
    {
      id: '4',
      name: 'Student Engagement Report',
      type: 'custom',
      generatedAt: '2024-03-20T15:45:00',
      generatedBy: 'Dr. Smith',
      format: 'csv',
      size: '856 KB',
    },
  ];

  const reportTemplates = [
    {
      id: 'weekly-progress',
      name: 'Weekly Progress Report',
      description: 'Student progress, attendance, and activity for the week',
      icon: Clock,
      color: 'blue',
    },
    {
      id: 'monthly-analytics',
      name: 'Monthly Analytics Report',
      description: 'Comprehensive analytics including trends and outcomes',
      icon: TrendingUp,
      color: 'green',
    },
    {
      id: 'outcomes-summary',
      name: 'Outcomes Summary',
      description: 'Patents, papers, and projects completed',
      icon: Award,
      color: 'purple',
    },
    {
      id: 'engagement-report',
      name: 'Engagement Report',
      description: 'Student engagement and activity metrics',
      icon: Users,
      color: 'orange',
    },
  ];

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText size={16} className="text-red-500" />;
      case 'excel':
        return <FileText size={16} className="text-green-500" />;
      case 'csv':
        return <FileText size={16} className="text-primary-500" />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <FileText size={18} className="mr-2" />
          Generate Report
        </button>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTemplates.map((template) => {
          const Icon = template.icon;
          const colorClasses = {
            blue: 'bg-primary-50 text-primary-600 border-primary-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            orange: 'bg-orange-50 text-orange-600 border-orange-200',
          };

          return (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-lg ${colorClasses[template.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}
              >
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{template.description}</p>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Generate →
              </button>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Report Types</option>
              <option value="weekly">Weekly Reports</option>
              <option value="monthly">Monthly Reports</option>
              <option value="quarterly">Quarterly Reports</option>
              <option value="custom">Custom Reports</option>
            </select>
          </div>
          <div className="flex-1">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            <Filter size={18} className="mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Generated Reports</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {reports.map((report) => (
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
                    <span>{new Date(report.generatedAt).toLocaleString()}</span>
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
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports generated</h3>
            <p className="text-gray-500">Generate your first report to get started.</p>
          </div>
        )}
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Scheduled Reports</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-primary-500" />
              <div>
                <p className="font-medium">Weekly Progress Report</p>
                <p className="text-sm text-gray-500">Every Monday at 9:00 AM</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Active
              </span>
              <button className="text-gray-600 hover:text-gray-700">Edit</button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-green-500" />
              <div>
                <p className="font-medium">Monthly Analytics</p>
                <p className="text-sm text-gray-500">1st of every month at 12:00 PM</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Active
              </span>
              <button className="text-gray-600 hover:text-gray-700">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
