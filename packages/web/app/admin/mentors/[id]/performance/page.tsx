'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Star,
  Users,
  BarChart3
} from 'lucide-react';
import { useAdminMentorPerformance } from '@/hooks/api/useAdmin';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function MentorPerformancePage() {
  const params = useParams();
  const [timeframe, setTimeframe] = useState('year');
  const { data: performance, isLoading: loading } = useAdminMentorPerformance(params.id as string, timeframe);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance data not found</h2>
        <Link
          href="/admin/mentors"
          className="text-orange-600 hover:text-orange-700"
        >
          Back to Mentors
        </Link>
      </div>
    );
  }

  const COLORS = ['#F97316', '#FB923C', '#FDBA74', '#FED7AA'];

  // Format date for chart
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-12">
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
              {performance.name}'s Performance
            </h1>
            <p className="text-gray-500 mt-1">Real-time analytics and metrics</p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['week', 'month', 'year'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                timeframe === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              This {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock size={20} className="text-orange-500" />
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{performance.summary.totalSessions}</p>
          <p className="text-sm text-gray-600">Total Sessions</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users size={20} className="text-green-500" />
            <span className="text-xs text-green-600 font-medium">Real-time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{performance.activeStudents}</p>
          <p className="text-sm text-gray-600">Active Students</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Award size={20} className="text-purple-500" />
            <span className="text-xs text-purple-600 font-medium">Outcomes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{performance.summary.outcomesAchieved}</p>
          <p className="text-sm text-gray-600">Outcomes Achieved</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Star size={20} className="text-yellow-500" />
            <span className="text-xs text-yellow-600 font-medium">Rating</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{performance.rating.toFixed(1)}</p>
          <p className="text-sm text-gray-600">Avg. Rating</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <BarChart3 size={20} className="mr-2 text-orange-500" />
              Session Trends
            </h3>
          </div>
          <div className="h-64 w-full">
            {performance.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={256}>
                <AreaChart data={performance.trend}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#F97316" 
                    fillOpacity={1} 
                    fill="url(#colorSessions)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 rounded-lg">
                <p>No session data available for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Student Progress Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <TrendingUp size={20} className="mr-2 text-green-500" />
              Student Progress Distribution
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={performance.progressDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {performance.progressDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CheckCircle size={20} className="mr-2 text-orange-500" />
          Detailed Performance Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metric</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Comparison</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Session Completion Rate</td>
                <td className="px-6 py-4 text-sm text-gray-600">{performance.summary.completionRate}%</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${performance.summary.completionRate >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {performance.summary.completionRate >= 80 ? 'Optimal' : 'Needs Attention'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">Target: 90%+</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Average Student Progress</td>
                <td className="px-6 py-4 text-sm text-gray-600">{Math.round(performance.summary.averageStudentProgress)}%</td>
                <td className="px-6 py-4">
                   <div className="w-24 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full" 
                      style={{ width: `${performance.summary.averageStudentProgress}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">Moving Average</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Student Success Rate</td>
                <td className="px-6 py-4 text-sm text-gray-600">{(performance.summary.outcomesAchieved / (performance.totalStudents || 1)).toFixed(1)} outcomes/student</td>
                <td className="px-6 py-4">
                  <span className="text-xs text-gray-500">Based on {performance.summary.outcomesAchieved} total outcomes</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">Goal: 1.0+</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">Avg. Session Duration</td>
                <td className="px-6 py-4 text-sm text-gray-600">{performance.averageSessionDuration} mins</td>
                <td className="px-6 py-4">
                  <span className="text-xs text-gray-500">Calculated from completed sessions</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">Target: 45-60m</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}