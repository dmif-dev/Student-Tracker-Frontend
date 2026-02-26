'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { ApiService } from '@/services/api';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalMentors: number;
  programsCount: number;
  pendingReviews: number;
  outcomesThisMonth: number;
  totalOutcomes?: number;
  patentsCount?: number;
  papersCount?: number;
  averageProgress?: number;
  engagementRate?: number;
}

interface ActivityItem {
  id: string;
  type: 'student_registered' | 'progress_submitted' | 'report_generated' | 'outcome_achieved';
  title: string;
  time: string;
  user?: string;
}

// Map mock activity types to expected types
const mapActivityType = (type: string): ActivityItem['type'] => {
  switch (type) {
    case 'enrollment':
      return 'student_registered';
    case 'progress':
      return 'progress_submitted';
    case 'outcome':
      return 'outcome_achieved';
    case 'report_generated':
      return 'report_generated';
    default:
      return 'progress_submitted';
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalMentors: 0,
    programsCount: 0,
    pendingReviews: 0,
    outcomesThisMonth: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, activities] = await Promise.all([
          ApiService.getDashboardStats(),
          ApiService.getRecentActivities(4)
        ]);
        
        setStats(statsData);
        setRecentActivity(activities.map(a => ({
          id: a.id,
          type: mapActivityType(a.type),
          title: a.title,
          time: a.time,
          user: a.user,
        })));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingUp size={12} className="mr-1" />
              {trend} from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Admin!</h2>
        <p className="text-primary-100">Here's what's happening with your programs today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="bg-primary-500"
          trend="+12%"
        />
        <StatCard
          title="Active Students"
          value={stats.activeStudents}
          icon={GraduationCap}
          color="bg-green-500"
          trend="+8%"
        />
        <StatCard
          title="Active Mentors"
          value={stats.totalMentors}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Programs"
          value={stats.programsCount}
          icon={Award}
          color="bg-yellow-500"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Outcomes This Month"
          value={stats.outcomesThisMonth}
          icon={CheckCircle}
          color="bg-teal-500"
          trend="+25%"
        />
      </div>

      {/* Weekly Schedule Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">This Week's Mentoring Sessions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-purple-700">G-GMP</h4>
              <span className="text-sm bg-purple-200 text-purple-700 px-2 py-1 rounded-full">Mondays</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">12</p>
            <p className="text-sm text-purple-600">sessions scheduled</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-green-700">G-CMP</h4>
              <span className="text-sm bg-green-200 text-green-700 px-2 py-1 rounded-full">Wednesdays</span>
            </div>
            <p className="text-2xl font-bold text-green-700">8</p>
            <p className="text-sm text-green-600">sessions scheduled</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-700">E-TIP</h4>
              <span className="text-sm bg-blue-200 text-blue-700 px-2 py-1 rounded-full">Fridays</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">5</p>
            <p className="text-sm text-blue-600">sessions scheduled</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Today's Sessions</h4>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">John Doe with Dr. Smith</p>
                <p className="text-xs text-gray-500">G-GMP • Patent Track</p>
              </div>
            </div>
            <span className="text-sm text-gray-600">10:00 AM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Jane Smith with Prof. Johnson</p>
                <p className="text-xs text-gray-500">G-CMP • AI Product Development</p>
              </div>
            </div>
            <span className="text-sm text-gray-600">2:00 PM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Alex Chen with Dr. Smith</p>
                <p className="text-xs text-gray-500">G-GMP • Research Paper Track</p>
              </div>
            </div>
            <span className="text-sm text-gray-600">3:30 PM</span>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {activity.type === 'student_registered' && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users size={16} className="text-green-600" />
                    </div>
                  )}
                  {activity.type === 'progress_submitted' && (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <TrendingUp size={16} className="text-primary-600" />
                    </div>
                  )}
                  {activity.type === 'outcome_achieved' && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award size={16} className="text-purple-600" />
                    </div>
                  )}
                  {activity.type === 'report_generated' && (
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-yellow-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  {activity.user && (
                    <p className="text-xs text-gray-500">by {activity.user}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/admin/students/add"
              className="block w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              Add New Student
            </Link>
            <Link
              href="/admin/mentors/add"
              className="block w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              Add New Mentor
            </Link>
            <Link
              href="/admin/mentors"
              className="block w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              View Mentor Schedules
            </Link>
            <Link
              href="/admin/analytics"
              className="block w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-center"
            >
              View Analytics
            </Link>
            <Link
              href="/admin/students/import"
              className="block w-full px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              Bulk Import Students
            </Link>
          </div>

          {/* Alerts */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <AlertCircle size={16} className="mr-2 text-orange-500" />
              Alerts
            </h4>
            <div className="space-y-2">
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-700">
                  <span className="font-medium">5 students</span> haven't submitted progress in 7 days
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-700">
                  <span className="font-medium">3 mentor sessions</span> need rescheduling
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}