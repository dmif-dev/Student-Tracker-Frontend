// packages/web/app/admin/analytics/page.tsx

'use client';

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ApiService } from '@/services/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Download,
  Filter,
  TrendingUp,
  Users,
  Award,
  Calendar,
  RefreshCw,
  X,
  BookOpen,
  Code,
  Brain,
  GraduationCap,
  FileText,
  Briefcase,
  Info,
  Target,
  Activity
} from 'lucide-react';

interface ProgramData {
  id: string;
  name: string;
  color: string;
  icon: any;
  tracks: Track[];
  outcomes?: OutcomeType[];
  stats: {
    totalStudents: number;
    activeStudents: number;
    totalMentors: number;
    completionRate: number;
    averageProgress?: number;
  };
  hasMentors: boolean;
  hasOutcomes: boolean;
}

interface Track {
  id: string;
  name: string;
  students: number;
  progress: number;
  hasMentor: boolean;
  completionRate?: number;
}

interface OutcomeType {
  type: string;
  icon: any;
  color: string;
  count: number;
  target?: number;
  description?: string;
}

interface AnalyticsData {
  summary: {
    totalStudents: number;
    activeStudents: number;
    totalMentors: number;
    totalOutcomes: number;
    pcpStudents: number;
    mentorLedStudents: number;
    programsWithOutcomes: number;
  };
  programData: ProgramData[];
  enrollmentTrend: Array<{ month: string; total: number; pcp: number; mentorLed: number }>;
  programEngagement: Array<{
    program: string;
    activeStudents: number;
    avgProgress: number;
    completionRate: number;
    hasMentors: boolean;
    hasOutcomes: boolean;
  }>;
  trackProgress: Array<{
    program: string;
    track: string;
    progress: number;
    students: number;
    hasMentor: boolean;
    completionRate: number;
  }>;
  mentorStats: {
    totalMentors: number;
    activeMentors: number;
    mentorsByProgram: Array<{ program: string; count: number }>;
    averageStudentsPerMentor: number;
    totalSessionsPerMonth: number;
  };
  pcpStats: {
    totalStudents: number;
    activeStudents: number;
    completedStudents: number;
    averageProgress: number;
    completionRate: number;
    moduleProgress: Array<{ track: string; completionRate: number; students: number }>;
  };
  outcomeStats?: {
    totalPatents: number;
    totalPapers: number;
    totalStartups: number;
    byMonth?: Array<{ month: string; patents: number; papers: number; startups: number }>;
  };
}

const PROGRAM_CONFIG = {
  'g-gmp': {
    name: 'G-GMP',
    color: '#8B5CF6',
    icon: Brain,
    hasMentors: true,
    hasOutcomes: true,
    description: 'Innovation, Research & Entrepreneurship',
    tracks: [
      'Patent Track',
      'Research Paper Track',
      'Entrepreneurship Track',
      'Inventor Foundation Track'
    ],
    outcomeTypes: [
      { type: 'Patents', icon: FileText, color: '#8B5CF6', description: 'Patent filings' },
      { type: 'Research Papers', icon: BookOpen, color: '#3B82F6', description: 'Published papers' },
      { type: 'Startup Concepts', icon: Briefcase, color: '#10B981', description: 'Startup ideas' }
    ]
  },
  'g-cmp': {
    name: 'G-CMP',
    color: '#10B981',
    icon: Code,
    hasMentors: true,
    hasOutcomes: false,
    description: 'Coding Mentorship - Learning Program',
    tracks: [
      'AI Product Development',
      'Full Stack Product Development',
      'Cloud Development & Deployment',
      'Agentic AI Product Development'
    ]
  },
  'e-tip': {
    name: 'E-TIP',
    color: '#3B82F6',
    icon: Award,
    hasMentors: true,
    hasOutcomes: false,
    description: 'Executive Technology Immersion',
    tracks: [
      'AI Product Development',
      'Full Stack',
      'Cloud Development',
      'Agentic AI',
      'Custom Track'
    ]
  },
  'pcp': {
    name: 'PCP',
    color: '#F97316',
    icon: GraduationCap,
    hasMentors: false,
    hasOutcomes: false,
    description: 'Professional Certification - Self-paced',
    tracks: [
      'AI Product Development',
      'Agentic AI Systems',
      'AI for Finance',
      'AI Security'
    ]
  }
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState('6m');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showPCPStats, setShowPCPStats] = useState(true);
  const [showOutcomeStats, setShowOutcomeStats] = useState(true);

  const programs = [
    { value: 'all', label: 'All Programs' },
    { value: 'g-gmp', label: 'G-GMP (with outcomes)' },
    { value: 'g-cmp', label: 'G-CMP (learning)' },
    { value: 'e-tip', label: 'E-TIP (learning)' },
    { value: 'pcp', label: 'PCP (self-paced)' }
  ];

  const dateRanges = [
    { value: '1m', label: 'Last Month' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedProgram, selectedTrack]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockData = generateMockData(dateRange, selectedProgram, selectedTrack);
      setData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (range: string, programFilter: string, trackFilter: string): AnalyticsData => {
    // Base program data
    const programData: ProgramData[] = [
      {
        id: 'g-gmp',
        name: 'G-GMP',
        color: '#8B5CF6',
        icon: Brain,
        hasMentors: true,
        hasOutcomes: true,
        tracks: [
          { id: 'patent', name: 'Patent Track', students: 45, progress: 75, hasMentor: true, completionRate: 78 },
          { id: 'research', name: 'Research Paper Track', students: 38, progress: 68, hasMentor: true, completionRate: 71 },
          { id: 'entrepreneurship', name: 'Entrepreneurship Track', students: 25, progress: 82, hasMentor: true, completionRate: 85 },
          { id: 'foundation', name: 'Inventor Foundation Track', students: 52, progress: 45, hasMentor: true, completionRate: 48 }
        ],
        outcomes: [
          { type: 'Patents', icon: FileText, color: '#8B5CF6', count: 12, target: 20, description: 'Patent filings' },
          { type: 'Research Papers', icon: BookOpen, color: '#3B82F6', count: 15, target: 25, description: 'Published papers' },
          { type: 'Startup Concepts', icon: Briefcase, color: '#10B981', count: 8, target: 15, description: 'Startup ideas' }
        ],
        stats: {
          totalStudents: 160,
          activeStudents: 142,
          totalMentors: 18,
          completionRate: 78,
          averageProgress: 68
        }
      },
      {
        id: 'g-cmp',
        name: 'G-CMP',
        color: '#10B981',
        icon: Code,
        hasMentors: true,
        hasOutcomes: false,
        tracks: [
          { id: 'ai-product', name: 'AI Product Development', students: 65, progress: 82, hasMentor: true, completionRate: 84 },
          { id: 'fullstack', name: 'Full Stack Development', students: 48, progress: 70, hasMentor: true, completionRate: 72 },
          { id: 'cloud', name: 'Cloud Development & Deployment', students: 32, progress: 68, hasMentor: true, completionRate: 70 },
          { id: 'agentic-ai', name: 'Agentic AI Development', students: 28, progress: 60, hasMentor: true, completionRate: 62 }
        ],
        stats: {
          totalStudents: 173,
          activeStudents: 158,
          totalMentors: 19,
          completionRate: 82,
          averageProgress: 70
        }
      },
      {
        id: 'e-tip',
        name: 'E-TIP',
        color: '#3B82F6',
        icon: Award,
        hasMentors: true,
        hasOutcomes: false,
        tracks: [
          { id: 'ai-product-exec', name: 'AI Product Development', students: 18, progress: 85, hasMentor: true, completionRate: 87 },
          { id: 'fullstack-exec', name: 'Full Stack', students: 12, progress: 78, hasMentor: true, completionRate: 80 },
          { id: 'cloud-exec', name: 'Cloud Development', students: 15, progress: 72, hasMentor: true, completionRate: 74 },
          { id: 'agentic-ai-exec', name: 'Agentic AI', students: 10, progress: 65, hasMentor: true, completionRate: 67 },
          { id: 'custom', name: 'Custom Track', students: 8, progress: 90, hasMentor: true, completionRate: 92 }
        ],
        stats: {
          totalStudents: 63,
          activeStudents: 58,
          totalMentors: 10,
          completionRate: 92,
          averageProgress: 78
        }
      },
      {
        id: 'pcp',
        name: 'PCP',
        color: '#F97316',
        icon: GraduationCap,
        hasMentors: false,
        hasOutcomes: false,
        tracks: [
          { id: 'ai-product-pcp', name: 'AI Product Development', students: 85, progress: 88, hasMentor: false, completionRate: 90 },
          { id: 'agentic-ai-pcp', name: 'Agentic AI Systems', students: 42, progress: 75, hasMentor: false, completionRate: 77 },
          { id: 'ai-finance', name: 'AI for Finance', students: 15, progress: 45, hasMentor: false, completionRate: 47 },
          { id: 'ai-security', name: 'AI Security', students: 12, progress: 30, hasMentor: false, completionRate: 32 }
        ],
        stats: {
          totalStudents: 154,
          activeStudents: 138,
          totalMentors: 0,
          completionRate: 88,
          averageProgress: 60
        }
      }
    ];

    // Apply program filter
    let filteredPrograms = programData;
    if (programFilter !== 'all') {
      filteredPrograms = programData.filter(p => p.id === programFilter);
    }

    // Apply track filter if specified
    if (trackFilter !== 'all') {
      filteredPrograms = filteredPrograms.map(p => ({
        ...p,
        tracks: p.tracks.filter(t => t.id === trackFilter)
      }));
    }

    // Calculate summary totals based on filtered data
    const summary = {
      totalStudents: filteredPrograms.reduce((sum, p) => sum + p.stats.totalStudents, 0),
      activeStudents: filteredPrograms.reduce((sum, p) => sum + p.stats.activeStudents, 0),
      totalMentors: filteredPrograms
        .filter(p => p.hasMentors)
        .reduce((sum, p) => sum + p.stats.totalMentors, 0),
      totalOutcomes: filteredPrograms
        .filter(p => p.hasOutcomes)
        .reduce((sum, p) =>
          sum + (p.outcomes?.reduce((s, o) => s + o.count, 0) || 0), 0
        ),
      pcpStudents: filteredPrograms
        .filter(p => p.id === 'pcp')
        .reduce((sum, p) => sum + p.stats.totalStudents, 0),
      mentorLedStudents: filteredPrograms
        .filter(p => p.hasMentors)
        .reduce((sum, p) => sum + p.stats.totalStudents, 0),
      programsWithOutcomes: filteredPrograms.filter(p => p.hasOutcomes).length
    };

    // Calculate mentor stats based on filtered programs
    const mentorStats = {
      totalMentors: filteredPrograms
        .filter(p => p.hasMentors)
        .reduce((sum, p) => sum + p.stats.totalMentors, 0),
      activeMentors: filteredPrograms
        .filter(p => p.hasMentors)
        .reduce((sum, p) => sum + Math.floor(p.stats.totalMentors * 0.9), 0),
      mentorsByProgram: filteredPrograms
        .filter(p => p.hasMentors)
        .map(p => ({ program: p.name, count: p.stats.totalMentors })),
      averageStudentsPerMentor: filteredPrograms.filter(p => p.hasMentors).length > 0
        ? Math.floor(
          filteredPrograms
            .filter(p => p.hasMentors)
            .reduce((sum, p) => sum + p.stats.totalStudents, 0) /
          filteredPrograms
            .filter(p => p.hasMentors)
            .reduce((sum, p) => sum + p.stats.totalMentors, 0)
        )
        : 0,
      totalSessionsPerMonth: filteredPrograms.filter(p => p.hasMentors).length > 0 ? 245 : 0
    };

    // Calculate PCP stats - only if PCP is in filtered programs
    const pcpProgram = filteredPrograms.find(p => p.id === 'pcp');
    const pcpStats = pcpProgram ? {
      totalStudents: pcpProgram.stats.totalStudents,
      activeStudents: pcpProgram.stats.activeStudents,
      completedStudents: Math.floor(pcpProgram.stats.totalStudents * 0.15),
      averageProgress: pcpProgram.tracks.reduce((sum, t) => sum + t.progress, 0) / pcpProgram.tracks.length,
      completionRate: pcpProgram.stats.completionRate,
      moduleProgress: pcpProgram.tracks.map(t => ({
        track: t.name,
        completionRate: t.completionRate || t.progress,
        students: t.students
      }))
    } : {
      totalStudents: 0,
      activeStudents: 0,
      completedStudents: 0,
      averageProgress: 0,
      completionRate: 0,
      moduleProgress: []
    };

    // Calculate outcome stats - only if G-GMP is in filtered programs
    const gGMP = filteredPrograms.find(p => p.id === 'g-gmp');
    const outcomeStats = gGMP?.hasOutcomes ? {
      totalPatents: gGMP.outcomes?.[0]?.count || 0,
      totalPapers: gGMP.outcomes?.[1]?.count || 0,
      totalStartups: gGMP.outcomes?.[2]?.count || 0,
      byMonth: [
        { month: 'Jan', patents: 2, papers: 3, startups: 1 },
        { month: 'Feb', patents: 3, papers: 4, startups: 2 },
        { month: 'Mar', patents: 4, papers: 3, startups: 2 },
        { month: 'Apr', patents: 3, papers: 5, startups: 1 },
        { month: 'May', patents: 5, papers: 4, startups: 2 },
        { month: 'Jun', patents: 4, papers: 5, startups: 2 }
      ]
    } : undefined;

    // Generate enrollment trend based on filtered data
    const months = range === '1m' ? 1 : range === '3m' ? 3 : range === '6m' ? 6 : range === '1y' ? 12 : 24;
    const enrollmentTrend = [];
    const baseTotal = 500;
    const basePCP = 150;
    const baseMentorLed = 350;

    for (let i = 0; i < Math.min(months, 12); i++) {
      enrollmentTrend.push({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i % 12],
        total: Math.floor((baseTotal + i * 15) * (summary.totalStudents / 550)),
        pcp: summary.pcpStudents > 0 ? Math.floor((basePCP + i * 8) * (summary.pcpStudents / 154)) : 0,
        mentorLed: summary.mentorLedStudents > 0 ? Math.floor((baseMentorLed + i * 10) * (summary.mentorLedStudents / 396)) : 0
      });
    }

    // Generate program engagement metrics
    const programEngagement = filteredPrograms.map(p => ({
      program: p.name,
      activeStudents: p.stats.activeStudents,
      avgProgress: p.stats.averageProgress || 0,
      completionRate: p.stats.completionRate,
      hasMentors: p.hasMentors,
      hasOutcomes: p.hasOutcomes
    }));

    // Generate track progress
    const trackProgress = filteredPrograms.flatMap(p =>
      p.tracks.map(t => ({
        program: p.name,
        track: t.name,
        progress: t.progress,
        students: t.students,
        hasMentor: t.hasMentor,
        completionRate: t.completionRate || t.progress
      }))
    );

    return {
      summary,
      programData: filteredPrograms,
      enrollmentTrend,
      programEngagement,
      trackProgress,
      mentorStats,
      pcpStats,
      outcomeStats
    };
  };

  const handleExport = async () => {
    if (!data) return;

    setExporting(true);
    try {
      const rows = [
        ['DMIF ANALYTICS REPORT'],
        [`Generated: ${new Date().toLocaleString()}`],
        [`Date Range: ${dateRanges.find(d => d.value === dateRange)?.label}`],
        [`Program: ${programs.find(p => p.value === selectedProgram)?.label}`],
        [`Track: ${selectedTrack === 'all' ? 'All Tracks' : selectedTrack}`],
        [],
        ['SUMMARY METRICS'],
        ['Metric', 'Value'],
        ['Total Students', data.summary.totalStudents],
        ['Active Students', data.summary.activeStudents],
        ['Total Mentors', data.summary.totalMentors],
        ['Programs with Outcomes', data.summary.programsWithOutcomes],
        ['Total Outcomes (G-GMP only)', data.summary.totalOutcomes],
        ['Mentor-Led Students', data.summary.mentorLedStudents],
        ['PCP Students (Self-paced)', data.summary.pcpStudents],
        [],
        ['PROGRAM BREAKDOWN'],
        ['Program', 'Total Students', 'Active Students', 'Mentors', 'Completion Rate', 'Avg Progress', 'Type'],
        ...data.programData.map(p => [
          p.name,
          p.stats.totalStudents,
          p.stats.activeStudents,
          p.stats.totalMentors,
          `${p.stats.completionRate}%`,
          `${Math.round(p.stats.averageProgress || 0)}%`,
          p.hasOutcomes ? 'With Outcomes' : 'Learning Program'
        ]),
        [],
      ];

      // Only add mentor stats if there are mentors
      if (data.mentorStats.totalMentors > 0) {
        rows.push(
          ['MENTOR STATISTICS'],
          ['Total Mentors', data.mentorStats.totalMentors],
          ['Active Mentors', data.mentorStats.activeMentors],
          ['Avg Students per Mentor', data.mentorStats.averageStudentsPerMentor],
          ['Sessions per Month', data.mentorStats.totalSessionsPerMonth],
          ...data.mentorStats.mentorsByProgram.map(m => [`${m.program} Mentors`, m.count]),
          []
        );
      }

      // Only add PCP stats if there are PCP students and showPCPStats is true
      if (showPCPStats && data.pcpStats.totalStudents > 0) {
        rows.push(
          ['PCP SELF-PACED STATISTICS'],
          ['Total PCP Students', data.pcpStats.totalStudents],
          ['Active PCP Students', data.pcpStats.activeStudents],
          ['Completed Students', data.pcpStats.completedStudents],
          ['Average Progress', `${Math.round(data.pcpStats.averageProgress)}%`],
          ['Completion Rate', `${data.pcpStats.completionRate}%`],
          ...data.pcpStats.moduleProgress.map(c => [`${c.track} Completion`, `${c.completionRate}%`, `${c.students} students`]),
          []
        );
      }

      // Add track progress
      rows.push(
        ['TRACK PROGRESS'],
        ['Program', 'Track', 'Students', 'Progress', 'Completion Rate', 'Type'],
        ...data.trackProgress.map(t => [
          t.program,
          t.track,
          t.students,
          `${t.progress}%`,
          `${t.completionRate}%`,
          t.hasMentor ? 'Mentor-led' : 'Self-paced'
        ])
      );

      // Add G-GMP outcome stats if available and showOutcomeStats is true
      if (showOutcomeStats && data.outcomeStats) {
        rows.push(
          [],
          ['G-GMP OUTCOME STATISTICS'],
          ['Total Patents', data.outcomeStats.totalPatents],
          ['Total Research Papers', data.outcomeStats.totalPapers],
          ['Total Startup Concepts', data.outcomeStats.totalStartups],
          [],
          ['Monthly Outcomes'],
          ['Month', 'Patents', 'Papers', 'Startups']
        );

        data.outcomeStats.byMonth?.forEach(m => {
          rows.push([m.month, m.patents, m.papers, m.startups]);
        });
      }

      const csv = rows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dmif-analytics-${selectedProgram}-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setExporting(false);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (dateRange !== '6m') count++;
    if (selectedProgram !== 'all') count++;
    if (selectedTrack !== 'all') count++;
    return count;
  };

  const clearFilters = () => {
    setDateRange('6m');
    setSelectedProgram('all');
    setSelectedTrack('all');
  };

  const getTracksForProgram = () => {
    if (selectedProgram === 'all') return [];
    const program = PROGRAM_CONFIG[selectedProgram as keyof typeof PROGRAM_CONFIG];
    return program?.tracks.map(track => ({ value: track.toLowerCase().replace(/\s+/g, '-'), label: track })) || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const tracks = getTracksForProgram();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">DMIF Analytics</h1>
        <div className="flex space-x-3">
          <button
            onClick={fetchAnalytics}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white disabled:opacity-50"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} className="mr-2" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Program Types Note - Only show when viewing all programs */}
      {selectedProgram === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Target size={20} className="text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-purple-700">
                  <strong>G-GMP:</strong> Innovation program with tangible outcomes (Patents, Papers, Startups)
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Activity size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-700">
                  <strong>G-CMP, E-TIP, PCP:</strong> Learning programs - focus on progress and completion
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <select
              value={selectedProgram}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setSelectedTrack('all');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {programs.map(program => (
                <option key={program.value} value={program.value}>{program.label}</option>
              ))}
            </select>
          </div>

          {selectedProgram !== 'all' && (
            <div className="flex-1">
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Tracks</option>
                {tracks.map(track => (
                  <option key={track.value} value={track.value}>{track.label}</option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${showFilters || getActiveFilterCount() > 0
                ? 'bg-orange-50 border-orange-300 text-orange-600'
                : 'border-gray-300 hover:bg-gray-50'
              }`}
          >
            <Filter size={18} className="mr-2" />
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
                {getActiveFilterCount()}
              </span>
            )}
          </Button>

          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <X size={16} className="mr-1" />
              Clear
            </button>
          )}
        </div>

        {/* Toggle options - Only show when relevant data exists */}
        {(data.pcpStats.totalStudents > 0 || data.outcomeStats) && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center space-x-6">
            {data.pcpStats.totalStudents > 0 && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showPCPStats}
                  onChange={(e) => setShowPCPStats(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Show PCP self-paced statistics</span>
              </label>
            )}
            {data.outcomeStats && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showOutcomeStats}
                  onChange={(e) => setShowOutcomeStats(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Show G-GMP outcome statistics</span>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Key Metrics Cards - Always show but values reflect filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalStudents}</p>
              {data.summary.mentorLedStudents > 0 && data.summary.pcpStudents > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  {data.summary.mentorLedStudents} mentor-led • {data.summary.pcpStudents} self-paced
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* Only show mentors card if there are mentors in filtered data */}
        {data.mentorStats.totalMentors > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Mentors</p>
                <p className="text-2xl font-bold text-gray-900">{data.mentorStats.totalMentors}</p>
                <p className="text-xs text-green-600 mt-2">
                  Avg {data.mentorStats.averageStudentsPerMentor} students per mentor
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Only show outcomes card if there are outcomes in filtered data */}
        {data.summary.totalOutcomes > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">G-GMP Outcomes</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalOutcomes}</p>
                {data.outcomeStats && (
                  <p className="text-xs text-purple-600 mt-2">
                    Patents: {data.outcomeStats.totalPatents} • Papers: {data.outcomeStats.totalPapers} • Startups: {data.outcomeStats.totalStartups}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Programs</p>
              <p className="text-2xl font-bold text-gray-900">{data.programData.length}</p>
              {data.programData.length > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  {data.programData.filter(p => p.hasOutcomes).length} with outcomes • {data.programData.filter(p => !p.hasOutcomes).length} learning
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <GraduationCap size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Program Overview Cards - Only show programs that match filter */}
      {data.programData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.programData.map(program => {
            const Icon = program.icon;
            return (
              <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${program.color}20` }}>
                    <Icon size={20} style={{ color: program.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{program.name}</h3>
                    <p className="text-xs text-gray-500">
                      {program.hasOutcomes ? 'With outcomes' : 'Learning program'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{program.stats.totalStudents}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Active:</span>
                    <span className="font-medium">{program.stats.activeStudents}</span>
                  </div>
                  {program.hasMentors && program.stats.totalMentors > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Mentors:</span>
                      <span className="font-medium">{program.stats.totalMentors}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">{Math.round(program.stats.averageProgress || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`rounded-full h-1.5 ${program.hasOutcomes ? 'bg-purple-500' : program.hasMentors ? 'bg-orange-600' : 'bg-orange-500'}`}
                      style={{ width: `${program.stats.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mentor Stats Section - Only show if there are mentors in filtered data */}
      {data.mentorStats.totalMentors > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            Mentor Statistics {selectedProgram !== 'all' && `(${programs.find(p => p.value === selectedProgram)?.label})`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">Total Mentors</p>
              <p className="text-2xl font-bold text-orange-700">{data.mentorStats.totalMentors}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Active Mentors</p>
              <p className="text-2xl font-bold text-green-700">{data.mentorStats.activeMentors}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">Avg Students/Mentor</p>
              <p className="text-2xl font-bold text-purple-700">{data.mentorStats.averageStudentsPerMentor}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-600 mb-1">Sessions/Month</p>
              <p className="text-2xl font-bold text-indigo-700">{data.mentorStats.totalSessionsPerMonth}</p>
            </div>
          </div>
          {data.mentorStats.mentorsByProgram.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {data.mentorStats.mentorsByProgram.map(item => (
                <div key={item.program} className="px-3 py-2 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-600">{item.program}:</span>
                  <span className="ml-2 font-semibold">{item.count} mentors</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PCP Stats Section - Only show if there are PCP students and toggle is on */}
      {showPCPStats && data.pcpStats.totalStudents > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">PCP Self-Paced Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">Total Students</p>
              <p className="text-2xl font-bold text-orange-700">{data.pcpStats.totalStudents}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">Active Students</p>
              <p className="text-2xl font-bold text-orange-700">{data.pcpStats.activeStudents}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-orange-700">{data.pcpStats.completedStudents}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-orange-700">{data.pcpStats.completionRate}%</p>
            </div>
          </div>

          {data.pcpStats.moduleProgress.length > 0 && (
            <>
              <h4 className="font-medium text-gray-700 mb-3">Module Completion Rates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.pcpStats.moduleProgress.map(item => (
                  <div key={item.track} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{item.track}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xl font-bold text-orange-600">{item.completionRate}%</p>
                      <p className="text-xs text-gray-500">{item.students} students</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* G-GMP Outcome Stats - Only show if there are outcomes and toggle is on */}
      {showOutcomeStats && data.outcomeStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">G-GMP Outcomes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <FileText size={20} className="text-purple-600" />
                <span className="text-xs text-purple-600">Target: 20</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">{data.outcomeStats.totalPatents}</p>
              <p className="text-sm text-purple-600">Patents Filed</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <BookOpen size={20} className="text-orange-600" />
                <span className="text-xs text-orange-600">Target: 25</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{data.outcomeStats.totalPapers}</p>
              <p className="text-sm text-orange-600">Research Papers</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Briefcase size={20} className="text-green-600" />
                <span className="text-xs text-green-600">Target: 15</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{data.outcomeStats.totalStartups}</p>
              <p className="text-sm text-green-600">Startup Concepts</p>
            </div>
          </div>

          {data.outcomeStats.byMonth && (
            <>
              <h4 className="font-medium text-gray-700 mb-3">Monthly Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.outcomeStats.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="patents" stroke="#8B5CF6" strokeWidth={2} name="Patents" />
                  <Line type="monotone" dataKey="papers" stroke="#3B82F6" strokeWidth={2} name="Papers" />
                  <Line type="monotone" dataKey="startups" stroke="#10B981" strokeWidth={2} name="Startups" />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      )}

      {/* Charts - Only show if there's data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend - Only show if there's data */}
        {data.enrollmentTrend.some(e => e.total > 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Enrollment Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {data.summary.mentorLedStudents > 0 && (
                  <Line type="monotone" dataKey="mentorLed" stroke="#4F46E5" strokeWidth={2} name="Mentor-Led" />
                )}
                {data.summary.pcpStudents > 0 && (
                  <Line type="monotone" dataKey="pcp" stroke="#F97316" strokeWidth={2} name="PCP (Self-paced)" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Program Engagement - Only show if there are programs */}
        {data.programEngagement.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Program Engagement</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.programEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="program" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="activeStudents" fill="#8884d8" name="Active Students" />
                <Bar yAxisId="right" dataKey="completionRate" fill="#82ca9d" name="Completion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Track Progress - Only show if there are tracks */}
        {data.trackProgress.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Track Progress & Completion</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Program</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Track</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Students</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Progress</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Completion</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.trackProgress.map((track, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{track.program}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{track.track}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{track.students}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`rounded-full h-2 ${track.program === 'G-GMP' ? 'bg-purple-500' :
                                  track.hasMentor ? 'bg-orange-600' : 'bg-orange-500'
                                }`}
                              style={{ width: `${track.progress}%` }}
                            />
                          </div>
                          <span className="text-sm">{track.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`rounded-full h-2 ${track.program === 'G-GMP' ? 'bg-purple-500' :
                                  track.hasMentor ? 'bg-green-500' : 'bg-orange-500'
                                }`}
                              style={{ width: `${track.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{track.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${track.program === 'G-GMP' ? 'bg-purple-100 text-purple-700' :
                            track.hasMentor ? 'bg-orange-100 text-orange-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                          {track.program === 'G-GMP' ? 'Innovation' : track.hasMentor ? 'Mentor-led' : 'Self-paced'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${track.completionRate >= 80 ? 'bg-green-100 text-green-700' :
                            track.completionRate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          {track.completionRate >= 80 ? 'Excellent' :
                            track.completionRate >= 60 ? 'Good' : 'Needs Attention'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* No Data Message */}
      {data.programData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <Activity size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-500">No programs match your current filter criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

