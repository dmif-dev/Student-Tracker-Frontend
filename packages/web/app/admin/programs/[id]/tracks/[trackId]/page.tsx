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
  Edit,
  BarChart3,
  Clock,
  CheckCircle,
  Target
} from 'lucide-react';

interface TrackDetails {
  id: string;
  name: string;
  programId: string;
  programName: string;
  description: string;
  students: number;
  mentors: number;
  progress: number;
  outcomes: number;
  duration: string;
  modules: Module[];
  recentActivity: Activity[];
}

interface Module {
  id: string;
  name: string;
  completionRate: number;
  studentsEnrolled: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  student: string;
  date: string;
}

export default function TrackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [track, setTrack] = useState<TrackDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const fetchTrack = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setTrack({
          id: params.trackId as string,
          name: params.trackId === 'patent' ? 'Patent Track' :
                params.trackId === 'research' ? 'Research Paper Track' :
                params.trackId === 'ai-product' ? 'AI Product Development' :
                'Track Details',
          programId: params.id as string,
          programName: params.id === 'g-gmp' ? 'G-GMP' :
                      params.id === 'g-cmp' ? 'G-CMP' :
                      params.id === 'e-tip' ? 'E-TIP' : 'PCP',
          description: 'Comprehensive track covering all aspects of the domain with hands-on projects and mentor guidance.',
          students: 45,
          mentors: 5,
          progress: 75,
          outcomes: 12,
          duration: '6 months',
          modules: [
            { id: '1', name: 'Introduction & Fundamentals', completionRate: 85, studentsEnrolled: 45 },
            { id: '2', name: 'Advanced Concepts', completionRate: 70, studentsEnrolled: 42 },
            { id: '3', name: 'Project Phase 1', completionRate: 60, studentsEnrolled: 38 },
            { id: '4', name: 'Project Phase 2', completionRate: 45, studentsEnrolled: 35 },
            { id: '5', name: 'Final Assessment', completionRate: 30, studentsEnrolled: 30 },
          ],
          recentActivity: [
            {
              id: '1',
              type: 'enrollment',
              description: 'John Doe enrolled in the track',
              student: 'John Doe',
              date: '2024-03-21',
            },
            {
              id: '2',
              type: 'completion',
              description: 'Jane Smith completed Module 2',
              student: 'Jane Smith',
              date: '2024-03-20',
            },
            {
              id: '3',
              type: 'outcome',
              description: 'Mike Johnson filed a patent',
              student: 'Mike Johnson',
              date: '2024-03-19',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching track:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.trackId) {
      fetchTrack();
    }
  }, [params.trackId, params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Track not found</h2>
        <Link
          href={`/admin/programs/${params.id}`}
          className="text-primary-600 hover:text-primary-700"
        >
          Back to Program
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
            href={`/admin/programs/${params.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">{track.name}</h1>
              <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                {track.programName}
              </span>
            </div>
            <p className="text-gray-500 mt-1">{track.description}</p>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Edit size={18} className="mr-2" />
          Edit Track
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Enrolled Students</p>
              <p className="text-2xl font-bold text-gray-900">{track.students}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Mentors</p>
              <p className="text-2xl font-bold text-gray-900">{track.mentors}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">{track.progress}%</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-purple-600 rounded-full h-2"
              style={{ width: `${track.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Outcomes</p>
              <p className="text-2xl font-bold text-gray-900">{track.outcomes}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award size={20} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Track Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Module Progress</h3>
          <div className="space-y-4">
            {track.modules.map((module) => (
              <div key={module.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{module.name}</span>
                  <span className="text-sm text-gray-600">{module.completionRate}%</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 rounded-full h-2"
                      style={{ width: `${module.completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {module.studentsEnrolled} students
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Track Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Track Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Duration</span>
                </div>
                <span className="text-sm font-medium">{track.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Modules</span>
                </div>
                <span className="text-sm font-medium">{track.modules.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Completion Required</span>
                </div>
                <span className="text-sm font-medium">80%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-left">
                View All Students
              </button>
              <button className="w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-left">
                Assign Mentors
              </button>
              <button className="w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-left">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {track.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {activity.type === 'enrollment' && (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-green-600" />
                  </div>
                )}
                {activity.type === 'completion' && (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-primary-600" />
                  </div>
                )}
                {activity.type === 'outcome' && (
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Award size={16} className="text-purple-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.student} • {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}