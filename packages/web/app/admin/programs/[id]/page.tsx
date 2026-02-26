'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Download,
  Edit,
  BarChart3
} from 'lucide-react';
import { ApiService } from '@/services/api';
import type { Program, Track, Activity } from '@/services/mockData';

interface ProgramDetails extends Program {
  recentActivity: Activity[];
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<ProgramDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const data = await ApiService.getProgramById(params.id as string);
        if (data) {
          const activities = await ApiService.getRecentActivities(3);
          setProgram({
            ...data,
            recentActivity: activities,
          });
        }
      } catch (error) {
        console.error('Error fetching program:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProgram();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Program not found</h2>
        <Link
          href="/admin/programs"
          className="text-primary-600 hover:text-primary-700"
        >
          Back to Programs
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
            href="/admin/programs"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
            <p className="text-gray-500 mt-1">{program.description}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} className="mr-2" />
            Export Report
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Edit size={18} className="mr-2" />
            Edit Program
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{program.totalStudents}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {program.activeStudents} active
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{program.completionRate}%</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Award size={20} className="text-green-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 rounded-full h-2"
              style={{ width: `${program.completionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Tracks</p>
              <p className="text-2xl font-bold text-gray-900">{program.tracks.length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Outcomes</p>
              <p className="text-2xl font-bold text-gray-900">
                {program.tracks.reduce((sum, track) => sum + track.outcomes, 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Program Tracks</h2>
          <button className="text-primary-600 hover:text-primary-700 text-sm">
            Manage Tracks
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {program.tracks.map((track) => (
            <div
              key={track.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{track.name}</h3>
                <Link
                  href={`/admin/programs/${program.id}/tracks/${track.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Students</p>
                  <p className="text-sm font-semibold">{track.students}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Mentors</p>
                  <p className="text-sm font-semibold">{track.mentors}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Outcomes</p>
                  <p className="text-sm font-semibold">{track.outcomes}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{track.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-primary-600 rounded-full h-1.5"
                    style={{ width: `${track.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {program.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {activity.type === 'enrollment' && (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-green-600" />
                  </div>
                )}
                {activity.type === 'outcome' && (
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Award size={16} className="text-purple-600" />
                  </div>
                )}
                {activity.type === 'completion' && (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <TrendingUp size={16} className="text-primary-600" />
                  </div>
                )}
                {(activity.type === 'progress' || activity.type === 'session') && (
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Calendar size={16} className="text-yellow-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}