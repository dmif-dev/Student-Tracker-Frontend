// packages/web/app/admin/outcomes/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  FileText,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Search,
  ChevronDown,
  BookOpen,
  Briefcase,
  Brain,
  Info
} from 'lucide-react';
import { ApiService } from '@/services/api';
import { Outcome } from '@/services/mockData';

// interface Outcome {
//   id: string;
//   type: 'patent' | 'paper' | 'startup' | 'project' | 'certification';
//   title: string;
//   student: string;
//   studentId: string;
//   status: 'pending' | 'filed' | 'published' | 'granted' | 'completed';
//   date: string;
//   mentor?: string;
//   program: string;
// }

export default function OutcomesPage() {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchOutcomes = async () => {
      try {
        const data = await ApiService.getOutcomes();
        // Filter to only show G-GMP outcomes (patents, papers, startups)
        // and PCP certifications
        const filteredData = data.filter((o: Outcome) => 
          o.program === 'G-GMP' || o.type === 'certification'
        );
        setOutcomes(filteredData);
      } catch (error) {
        console.error('Error fetching outcomes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOutcomes();
  }, []);

  const getTypeIcon = (type: string, program: string) => {
    if (program === 'G-GMP') {
      switch (type) {
        case 'patent':
          return <FileText size={16} className="text-purple-500" />;
        case 'paper':
          return <BookOpen size={16} className="text-blue-500" />;
        case 'startup':
          return <Briefcase size={16} className="text-green-500" />;
        default:
          return <Award size={16} className="text-gray-500" />;
      }
    } else if (type === 'certification') {
      return <Award size={16} className="text-orange-500" />;
    }
    return <Award size={16} className="text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'granted':
      case 'published':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'filed':
        return 'bg-primary-100 text-primary-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOutcomes = outcomes.filter((outcome) => {
    const matchesSearch =
      outcome.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      outcome.student.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || outcome.type === selectedType;
    const matchesProgram = selectedProgram === 'all' || outcome.program === selectedProgram;
    const matchesStatus = selectedStatus === 'all' || outcome.status === selectedStatus;

    return matchesSearch && matchesType && matchesProgram && matchesStatus;
  });

  const stats = {
    total: outcomes.length,
    patents: outcomes.filter((o) => o.type === 'patent').length,
    papers: outcomes.filter((o) => o.type === 'paper').length,
    startups: outcomes.filter((o) => o.type === 'startup').length,
    certifications: outcomes.filter((o) => o.type === 'certification').length,
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outcomes</h1>
          <p className="text-sm text-gray-500 mt-1">Tracking G-GMP innovations and PCP certifications</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            <Download size={18} className="mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Award size={18} className="mr-2" />
            Add Outcome
          </button>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Brain size={20} className="text-purple-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-purple-700">
              <strong>Note:</strong> Outcomes are only tracked for G-GMP (Patents, Papers, Startups) and PCP (Certifications). 
              G-CMP and E-TIP are learning programs without outcome tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Outcomes</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Patents</p>
          <p className="text-2xl font-bold text-purple-600">{stats.patents}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Papers</p>
          <p className="text-2xl font-bold text-blue-600">{stats.papers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Startups</p>
          <p className="text-2xl font-bold text-green-600">{stats.startups}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Certifications</p>
          <p className="text-2xl font-bold text-orange-600">{stats.certifications}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search outcomes by title or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg placeholder:text-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary-50 border-primary-300 text-primary-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="patent">Patents (G-GMP)</option>
                <option value="paper">Papers (G-GMP)</option>
                <option value="startup">Startups (G-GMP)</option>
                <option value="certification">Certifications (PCP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Programs</option>
                <option value="G-GMP">G-GMP (Innovation)</option>
                <option value="PCP">PCP (Certifications)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="filed">Filed</option>
                <option value="published">Published</option>
                <option value="granted">Granted</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Outcomes Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mentor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOutcomes.map((outcome) => (
              <tr key={outcome.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {getTypeIcon(outcome.type, outcome.program)}
                    <span className="ml-2 text-sm capitalize">
                      {outcome.type === 'startup' ? 'Startup Concept' : outcome.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{outcome.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{outcome.student}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    outcome.program === 'G-GMP' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {outcome.program}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(outcome.status)}`}
                  >
                    {outcome.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(outcome.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{outcome.mentor || '—'}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/outcomes/${outcome.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOutcomes.length === 0 && (
          <div className="text-center py-12">
            <Award size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No outcomes found</h3>
            <p className="text-gray-500">
              Outcomes are only tracked for G-GMP (patents, papers, startups) and PCP (certifications).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}