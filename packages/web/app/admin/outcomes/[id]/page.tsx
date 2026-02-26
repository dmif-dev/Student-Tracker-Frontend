'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  FileText,
  TrendingUp,
  Calendar,
  User,
  Download,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface OutcomeDetails {
  id: string;
  type: 'patent' | 'paper' | 'project' | 'certification';
  title: string;
  description: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  mentor?: {
    id: string;
    name: string;
  };
  status: 'pending' | 'filed' | 'published' | 'granted' | 'completed';
  date: string;
  files?: {
    name: string;
    url: string;
    size: string;
  }[];
  metadata?: Record<string, any>;
}

export default function OutcomeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [outcome, setOutcome] = useState<OutcomeDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const fetchOutcome = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setOutcome({
          id: params.id as string,
          type: 'patent',
          title: 'AI-based Patent Search System',
          description: 'A novel system for searching and analyzing patents using artificial intelligence and machine learning algorithms.',
          student: {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
          },
          mentor: {
            id: '1',
            name: 'Dr. Smith',
          },
          status: 'filed',
          date: '2024-03-20',
          files: [
            { name: 'patent_document.pdf', url: '#', size: '2.4 MB' },
            { name: 'claims_document.pdf', url: '#', size: '1.1 MB' },
            { name: 'drawings.pdf', url: '#', size: '3.2 MB' },
          ],
          metadata: {
            applicationNumber: 'US2024/123456',
            filingDate: '2024-03-20',
            jurisdiction: 'United States',
            inventors: ['John Doe', 'Dr. Smith'],
          },
        });
      } catch (error) {
        console.error('Error fetching outcome:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOutcome();
    }
  }, [params.id]);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'patent':
        return <Award size={24} className="text-purple-500" />;
      case 'paper':
        return <FileText size={24} className="text-green-500" />;
      case 'project':
        return <TrendingUp size={24} className="text-primary-500" />;
      case 'certification':
        return <Award size={24} className="text-orange-500" />;
      default:
        return <FileText size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!outcome) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Outcome not found</h2>
        <Link
          href="/admin/outcomes"
          className="text-primary-600 hover:text-primary-700"
        >
          Back to Outcomes
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
            href="/admin/outcomes"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center space-x-3">
            {getTypeIcon(outcome.type)}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{outcome.title}</h1>
              <p className="text-gray-500 mt-1 capitalize">{outcome.type}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} className="mr-2" />
            Download Files
          </button>
          <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Edit size={18} className="mr-2" />
            Edit Outcome
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(outcome.status)}`}>
          {outcome.status}
        </span>
        <span className="text-sm text-gray-500 flex items-center">
          <Calendar size={16} className="mr-1" />
          {new Date(outcome.date).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-600">{outcome.description}</p>
          </div>

          {/* Metadata */}
          {outcome.metadata && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(outcome.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Files */}
          {outcome.files && outcome.files.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Attached Files</h3>
              <div className="space-y-3">
                {outcome.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText size={16} className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                      download
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Student</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{outcome.student.name}</p>
                <p className="text-sm text-gray-500">{outcome.student.email}</p>
              </div>
            </div>
            <Link
              href={`/admin/students/${outcome.student.id}`}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              View Student Profile →
            </Link>
          </div>

          {/* Mentor Info */}
          {outcome.mentor && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Mentor</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{outcome.mentor.name}</p>
                </div>
              </div>
              <Link
                href={`/admin/mentors/${outcome.mentor.id}`}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View Mentor Profile →
              </Link>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-gray-500">{new Date(outcome.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary-500"></div>
                </div>
                <div>
                  <p className="text-sm font-medium">Status Updated</p>
                  <p className="text-xs text-gray-500">Changed to {outcome.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}