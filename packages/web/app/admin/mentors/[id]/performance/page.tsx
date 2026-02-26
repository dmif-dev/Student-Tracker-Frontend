'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  Star,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { ApiService } from '@/services/api';

export default function MentorPerformancePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mentor, setMentor] = useState<any>(null);
  const [timeframe, setTimeframe] = useState('month');

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const data = await ApiService.getMentorById(params.id as string);
        if (data) {
          setMentor(data);
        }
      } catch (error) {
        console.error('Error fetching mentor:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMentor();
    }
  }, [params.id]);

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
              {mentor.name}'s Performance
            </h1>
            <p className="text-gray-500 mt-1">Analytics and metrics</p>
          </div>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock size={20} className="text-blue-500" />
            <span className="text-xs text-green-600">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">24</p>
          <p className="text-sm text-gray-600">Sessions Completed</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users size={20} className="text-green-500" />
            <span className="text-xs text-green-600">+2</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mentor.students}</p>
          <p className="text-sm text-gray-600">Active Students</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Award size={20} className="text-purple-500" />
            <span className="text-xs text-green-600">+5</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">8</p>
          <p className="text-sm text-gray-600">Outcomes Achieved</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Star size={20} className="text-yellow-500" />
            <span className="text-xs text-green-600">+0.2</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mentor.rating}</p>
          <p className="text-sm text-gray-600">Avg. Rating</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Session Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <BarChart3 size={32} className="text-gray-400 mr-2" />
            <span className="text-gray-500">Session analytics chart will be displayed here</span>
          </div>
        </div>

        {/* Student Progress Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Student Progress Distribution</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <TrendingUp size={32} className="text-gray-400 mr-2" />
            <span className="text-gray-500">Progress distribution chart will be displayed here</span>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Metric</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Current Period</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Previous Period</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Change</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Session Completion Rate</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">94%</td>
                <td className="px-4 py-3 text-sm text-gray-600">89%</td>
                <td className="px-4 py-3 text-sm text-green-600">↑ 5%</td>
                <td className="px-4 py-3 text-sm text-gray-600">95%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Student Satisfaction</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">4.8</td>
                <td className="px-4 py-3 text-sm text-gray-600">4.7</td>
                <td className="px-4 py-3 text-sm text-green-600">↑ 0.1</td>
                <td className="px-4 py-3 text-sm text-gray-600">4.9</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Average Progress per Student</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">45%</td>
                <td className="px-4 py-3 text-sm text-gray-600">38%</td>
                <td className="px-4 py-3 text-sm text-green-600">↑ 7%</td>
                <td className="px-4 py-3 text-sm text-gray-600">60%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">On-time Session Start</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">88%</td>
                <td className="px-4 py-3 text-sm text-gray-600">85%</td>
                <td className="px-4 py-3 text-sm text-green-600">↑ 3%</td>
                <td className="px-4 py-3 text-sm text-gray-600">90%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}