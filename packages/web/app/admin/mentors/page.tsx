'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiService } from '@/services/api';
import { 
  Search, 
  Plus, 
  Filter,
  Star,
  Mail,
  Calendar,
  Users
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  students: number;
  programs: string[];
  rating: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
  const fetchMentors = async () => {
    try {
      const data = await ApiService.getMentors();
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchMentors();
}, []);

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTodaySessions = (mentor: Mentor) => {
    // Mock function to get today's session count
    return Math.floor(Math.random() * 3) + 1;
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Mentors</h1>
        <Link
          href="/admin/mentors/add"
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Add Mentor
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search mentors by name, email, or expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-lg">
                  {mentor.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                  <p className="text-sm text-gray-500">{mentor.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                mentor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {mentor.status}
              </span>
            </div>

            {/* Today's Sessions Badge */}
            <div className="mb-3">
              <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                <Calendar size={12} className="mr-1" />
                {getTodaySessions(mentor)} session{getTodaySessions(mentor) !== 1 ? 's' : ''} today
              </span>
            </div>

            {/* Expertise Tags */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((exp, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Students</p>
                <p className="text-lg font-semibold text-gray-900">{mentor.students}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rating</p>
                <div className="flex items-center">
                  <Star size={14} className="text-yellow-400 mr-1" />
                  <p className="text-lg font-semibold text-gray-900">{mentor.rating}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Programs</p>
                <p className="text-lg font-semibold text-gray-900">{mentor.programs.length}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Link
                href={`/admin/mentors/${mentor.id}`}
                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center text-sm"
              >
                View Profile
              </Link>
              <Link
                href={`/admin/mentors/${mentor.id}/schedule`}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="View Schedule"
              >
                <Calendar size={18} />
              </Link>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}