'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminMentors } from '@/hooks/api/useAdmin';
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
  const { data: mentors = [], isLoading: loading } = useAdminMentors();
  const [searchTerm, setSearchTerm] = useState('');

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 pb-20 bg-gradient-to-br from-white via-orange-50/5 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-montserrat text-gray-900">Mentors</h1>
          <p className="text-muted-foreground mt-1">Manage your team of specialized mentors and their assigned students.</p>
        </div>
        <Link
          href="/admin/mentors/add"
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all font-bold text-sm"
        >
          <Plus size={18} className="mr-2" />
          Add New Mentor
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white p-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, expertise, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl placeholder:text-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-white p-6 hover:shadow-xl transition-all hover:translate-y-[-4px]"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-xl shadow-inner">
                  {mentor.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="font-extrabold text-gray-900 font-montserrat">{mentor.name}</h3>
                  <p className="text-xs text-gray-400 font-medium">{mentor.email}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${mentor.status === 'active' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                {mentor.status}
              </span>
            </div>

            {/* Today's Sessions Badge */}
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 bg-orange-50 border border-orange-100 text-orange-600 rounded-xl text-xs font-bold">
                <Calendar size={14} className="mr-2" />
                {getTodaySessions(mentor)} sessions today
              </span>
            </div>

            {/* Expertise Tags */}
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Expertise</p>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((exp, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 pt-4 border-t border-gray-50">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Students</p>
                <div className="flex items-center text-gray-900">
                  <Users size={14} className="mr-1 text-orange-400" />
                  <p className="text-lg font-black">{mentor.students}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Rating</p>
                <div className="flex items-center text-gray-900">
                  <Star size={14} className="text-amber-400 mr-1" fill="currentColor" />
                  <p className="text-lg font-black">{mentor.rating}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Impact</p>
                <p className="text-lg font-black text-gray-900">{mentor.programs.length} <span className="text-[10px] font-bold text-gray-400">Prg.</span></p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <Link
                href={`/admin/mentors/${mentor.id}`}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-md shadow-orange-500/10 transition-all text-center text-sm font-bold"
              >
                Profile Details
              </Link>
              <Link
                href={`/admin/mentors/${mentor.id}/schedule`}
                className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-orange-50 hover:text-orange-600 border border-gray-100 transition-all"
                title="View Schedule"
              >
                <Calendar size={18} />
              </Link>
              <a 
                href={`mailto:${mentor.email}`}
                title="Send Email"
                className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-orange-50 hover:text-orange-600 border border-gray-100 transition-all inline-block"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

