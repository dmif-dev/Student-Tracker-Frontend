// packages/web/app/admin/outcomes/[id]/page.tsx

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
  AlertCircle,
  BookOpen,
  Briefcase,
  Brain,
  GraduationCap
} from 'lucide-react';
import { ApiService } from '@/services/api';
import LoaderOne from '@/components/ui/loader-one';

// Extend the Outcome interface for the detail view
interface OutcomeDetail {
  id: string;
  type: 'patent' | 'paper' | 'startup' | 'certification';
  title: string;
  description?: string;  // Add description
  student: string;
  studentId: string;
  mentor?: string;
  status: 'pending' | 'filed' | 'published' | 'granted' | 'completed';
  date: string;
  program: 'G-GMP' | 'PCP';
  files?: Array<{  // Add files
    name: string;
    url: string;
    size: string;
  }>;
  metadata?: Record<string, any>;  // Add metadata
}

export default function OutcomeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [outcome, setOutcome] = useState<OutcomeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutcome = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data based on ID
        const mockOutcome: OutcomeDetail = {
          id: params.id as string,
          type: params.id?.toString().startsWith('1') ? 'patent' :
                params.id?.toString().startsWith('2') ? 'paper' :
                params.id?.toString().startsWith('8') ? 'startup' : 'certification',
          title: params.id === '1' ? 'AI-based Patent Search System' :
                 params.id === '2' ? 'Advances in Agentic AI Systems' :
                 params.id === '5' ? 'Blockchain-based Identity System' :
                 params.id === '7' ? 'Ethical Considerations in AI' :
                 params.id === '8' ? 'AI-powered Education Platform' :
                 params.id === '4' ? 'Agentic AI Specialist' :
                 params.id === '6' ? 'AI Product Development Professional' :
                 'AI Security Fundamentals',
          description: params.id === '1' ? 'A novel system for searching and analyzing patents using artificial intelligence and machine learning algorithms.' :
                      params.id === '2' ? 'Research paper on advances in autonomous AI systems and their applications.' :
                      params.id === '5' ? 'Blockchain-based identity verification system for secure authentication.' :
                      params.id === '7' ? 'Research on ethical considerations in AI development and deployment.' :
                      params.id === '8' ? 'Educational platform powered by AI for personalized learning.' :
                      params.id === '4' ? 'Professional certification in Agentic AI Systems.' :
                      params.id === '6' ? 'Comprehensive certification in AI Product Development.' :
                      'Certification in AI Security fundamentals.',
          student: params.id === '1' ? 'John Doe' :
                   params.id === '2' ? 'Jane Smith' :
                   params.id === '5' ? 'Alex Chen' :
                   params.id === '7' ? 'Maria Garcia' :
                   params.id === '8' ? 'John Doe' :
                   params.id === '4' ? 'Sarah Wilson' :
                   params.id === '6' ? 'Emily Brown' :
                   'Robert Kim',
          studentId: params.id === '1' ? '1' :
                    params.id === '2' ? '2' :
                    params.id === '5' ? '5' :
                    params.id === '7' ? '10' :
                    params.id === '8' ? '1' :
                    params.id === '4' ? '4' :
                    params.id === '6' ? '6' :
                    '9',
          mentor: params.id === '1' ? 'Dr. Smith' :
                  params.id === '2' ? 'Prof. Johnson' :
                  params.id === '5' ? 'Dr. Smith' :
                  params.id === '7' ? 'Dr. Smith' :
                  params.id === '8' ? 'Dr. Smith' :
                  undefined,
          status: params.id === '1' ? 'filed' :
                  params.id === '2' ? 'published' :
                  params.id === '5' ? 'filed' :
                  params.id === '7' ? 'published' :
                  params.id === '8' ? 'pending' :
                  'completed',
          date: params.id === '1' ? '2024-03-20' :
                params.id === '2' ? '2024-03-15' :
                params.id === '5' ? '2024-03-01' :
                params.id === '7' ? '2024-02-25' :
                params.id === '8' ? '2024-03-18' :
                params.id === '4' ? '2024-03-05' :
                params.id === '6' ? '2024-02-28' :
                '2024-03-10',
          program: params.id === '1' ? 'G-GMP' :
                   params.id === '2' ? 'G-GMP' :
                   params.id === '5' ? 'G-GMP' :
                   params.id === '7' ? 'G-GMP' :
                   params.id === '8' ? 'G-GMP' :
                   'PCP',
          files: [
            { name: 'document.pdf', url: '#', size: '2.4 MB' },
            { name: 'supporting_docs.pdf', url: '#', size: '1.1 MB' },
          ],
          metadata: params.id === '1' ? {
            applicationNumber: 'US2024/123456',
            filingDate: '2024-03-20',
            jurisdiction: 'United States',
            inventors: ['John Doe', 'Dr. Smith'],
          } : params.id === '2' ? {
            journal: 'Springer Nature',
            volume: 'Vol 45',
            pages: '123-145',
            doi: '10.1007/s12345-024-001',
          } : params.id === '8' ? {
            conceptStage: 'Idea Validation',
            targetMarket: 'Education Technology',
            teamSize: 2,
          } : params.id === '4' ? {
            certificationLevel: 'Specialist',
            issuedBy: 'DMIF',
            validUntil: '2026-03-05',
          } : undefined,
        };
        
        setOutcome(mockOutcome);
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

  const getTypeIcon = (type: string, program: string) => {
    if (program === 'G-GMP') {
      switch (type) {
        case 'patent':
          return <FileText size={24} className="text-purple-500" />;
        case 'paper':
          return <BookOpen size={24} className="text-blue-500" />;
        case 'startup':
          return <Briefcase size={24} className="text-green-500" />;
        default:
          return <Award size={24} className="text-purple-500" />;
      }
    } else {
      return <GraduationCap size={24} className="text-orange-500" />;
    }
  };

  const getTypeLabel = (type: string, program: string) => {
    if (program === 'G-GMP') {
      switch (type) {
        case 'patent':
          return 'Patent';
        case 'paper':
          return 'Research Paper';
        case 'startup':
          return 'Startup Concept';
        default:
          return 'Innovation';
      }
    } else {
      return 'Certification';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderOne />
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
            {getTypeIcon(outcome.type, outcome.program)}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{outcome.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-500 capitalize">{getTypeLabel(outcome.type, outcome.program)}</p>
                <span className="text-gray-300">•</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  outcome.program === 'G-GMP' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {outcome.program}
                </span>
              </div>
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
          {outcome.program === 'G-GMP' ? 
            (outcome.type === 'patent' ? 'Filed on: ' : 
             outcome.type === 'paper' ? 'Published on: ' : 
             'Created on: ') : 
            'Completed on: '}
          {new Date(outcome.date).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {outcome.description && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <p className="text-gray-600">{outcome.description}</p>
            </div>
          )}

          {/* Metadata */}
          {outcome.metadata && Object.keys(outcome.metadata).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(outcome.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                    <dd className="text-sm font-medium text-gray-900 mt-1">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
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
                <p className="font-medium text-gray-900">{outcome.student}</p>
                <p className="text-sm text-gray-500">ID: {outcome.studentId}</p>
              </div>
            </div>
            <Link
              href={`/admin/students/${outcome.studentId}`}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              View Student Profile →
            </Link>
          </div>

          {/* Mentor Info - Only for G-GMP */}
          {outcome.program === 'G-GMP' && outcome.mentor && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Mentor</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{outcome.mentor}</p>
                </div>
              </div>
              <Link
                href={`/admin/mentors/1`}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                View Mentor Profile →
              </Link>
            </div>
          )}

          {/* Program Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Program Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Program:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  outcome.program === 'G-GMP' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {outcome.program}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium capitalize">
                  {outcome.program === 'G-GMP' ? 
                    (outcome.type === 'patent' ? 'Innovation' :
                     outcome.type === 'paper' ? 'Research' :
                     'Entrepreneurship') :
                    'Certification'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mentor Required:</span>
                <span className="text-sm font-medium">
                  {outcome.program === 'G-GMP' ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {outcome.program === 'G-GMP' ? 
                      (outcome.type === 'patent' ? 'Filed' : 
                       outcome.type === 'paper' ? 'Published' : 
                       'Created') : 
                      'Completed'}
                  </p>
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