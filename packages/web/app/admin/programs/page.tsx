'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiService } from '@/services/api';
import { 
  GraduationCap, 
  Users, 
  TrendingUp,
  ArrowRight,
  BookOpen,
  Award,
  Code,
  Brain
} from 'lucide-react';

interface Program {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  tracks: Track[];
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
}

interface Track {
  id: string;
  name: string;
  students: number;
  outcomes: number;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchPrograms = async () => {
    try {
      const data = await ApiService.getPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchPrograms();
}, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Programs & Tracks</h1>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 gap-6">
        {programs.map((program) => {
          const Icon = program.icon;
          const colorClasses = {
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            blue: 'bg-primary-50 text-primary-600 border-primary-200',
            orange: 'bg-orange-50 text-orange-600 border-orange-200',
          };

          return (
            <div
              key={program.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Program Header */}
              <div className={`p-6 border-b border-gray-200 ${colorClasses[program.color as keyof typeof colorClasses]}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg ${colorClasses[program.color as keyof typeof colorClasses]} flex items-center justify-center`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{program.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/programs/${program.id}`}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    View Details
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                </div>

                {/* Program Stats */}
                <div className="grid grid-cols-3 gap-6 mt-6">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{program.totalStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Students</p>
                    <p className="text-2xl font-bold text-gray-900">{program.activeStudents}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{program.completionRate}%</p>
                  </div>
                </div>
              </div>

              {/* Tracks Table */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tracks</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Track Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Enrolled Students</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Outcomes</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {program.tracks.map((track) => (
                        <tr key={track.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{track.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{track.students}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{track.outcomes}</td>
                          <td className="px-4 py-3 text-sm">
                            <Link
                              href={`/admin/programs/${program.id}/tracks/${track.id}`}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}