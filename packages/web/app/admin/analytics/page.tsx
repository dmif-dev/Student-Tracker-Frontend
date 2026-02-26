'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  Users,
  Award,
  BookOpen
} from 'lucide-react';

interface AnalyticsData {
  enrollmentTrend: Array<{ month: string; students: number }>;
  programDistribution: Array<{ name: string; value: number }>;
  trackPerformance: Array<{ track: string; progress: number; completion: number }>;
  outcomesByMonth: Array<{ month: string; patents: number; papers: number }>;
  engagementMetrics: Array<{ week: string; active: number; submissions: number }>;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6m');
  const [selectedProgram, setSelectedProgram] = useState('all');

  useEffect(() => {
    const fetchAnalytics = async () => {
        try {
        const data = await ApiService.getAnalytics(dateRange, selectedProgram);
        setData(data);
        } catch (error) {
        console.error('Error fetching analytics:', error);
        } finally {
        setLoading(false);
        }
    };

    fetchAnalytics();
    }, [dateRange, selectedProgram]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Programs</option>
            <option value="g-gmp">G-GMP</option>
            <option value="g-cmp">G-CMP</option>
            <option value="e-tip">E-TIP</option>
            <option value="pcp">PCP</option>
          </select>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">523</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">412</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">78% engagement rate</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Outcomes</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">35 patents, 54 papers</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg. Progress</p>
              <p className="text-2xl font-bold text-gray-900">68%</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-orange-600 rounded-full h-2" style={{ width: '68%' }}></div>
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="students" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Program Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Program Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.programDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                    // Safely handle percent which could be undefined
                    const percentage = percent ? Math.round(percent * 100) : 0;
                    return `${name} ${percentage}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                >
                {data?.programDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Outcomes by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Outcomes by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.outcomesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="patents" fill="#4F46E5" />
              <Bar dataKey="papers" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.engagementMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="active" stroke="#4F46E5" />
              <Line type="monotone" dataKey="submissions" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Track Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Track Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Track</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Completion</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {data?.trackPerformance.map((track, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">{track.track}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 rounded-full h-2"
                            style={{ width: `${track.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{track.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 rounded-full h-2"
                            style={{ width: `${track.completion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{track.completion}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        track.progress > 75 ? 'bg-green-100 text-green-700' :
                        track.progress > 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {track.progress > 75 ? 'Excellent' : track.progress > 50 ? 'Good' : 'Needs Attention'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}