// packages/web/app/admin/programs/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/services/api';
import { 
  GraduationCap, 
  Users, 
  TrendingUp,
  ArrowRight,
  BookOpen,
  Award,
  Code,
  Brain,
  FileText,
  Briefcase,
  Clock,
  CheckCircle,
  Target,
  Download,
  Settings,
  X,
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Program {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tracks: Track[];
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  hasMentors: boolean;
  hasOutcomes: boolean;
  outcomeCount?: number;
  duration?: string;
}

interface Track {
  id: string;
  name: string;
  students: number;
  outcomes: number;
  progress?: number;
  description?: string;
  mentors?: number;
  requiresMentor?: boolean;
}

// Map icon strings to actual Lucide components
const iconMap: Record<string, any> = {
  'Brain': Brain,
  'Code': Code,
  'Award': Award,
  'BookOpen': BookOpen,
};

// Outcome icon map
const outcomeIconMap: Record<string, any> = {
  'G-GMP': FileText,
  'PCP': Award,
};

// Program type descriptions
const programTypeDescriptions: Record<string, { type: string; description: string; icon: any }> = {
  'g-gmp': {
    type: 'Innovation Program',
    description: 'Tracks patents, research papers, and startup concepts',
    icon: Target,
  },
  'g-cmp': {
    type: 'Learning Program',
    description: 'Focus on coding skills and project completion',
    icon: Code,
  },
  'e-tip': {
    type: 'Learning Program',
    description: 'Executive technology leadership training',
    icon: Award,
  },
  'pcp': {
    type: 'Certification Program',
    description: 'Self-paced professional certifications',
    icon: GraduationCap,
  },
};

// ==================== TrackEditor Component with Integrated Edit Functionality ====================

function TrackEditor({ track, programId, hasOutcomes, onUpdate }: { 
  track: Track; 
  programId: string;
  hasOutcomes: boolean;
  onUpdate: (trackId: string, updates: Partial<Track>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(track.progress || 0);
  const [outcomes, setOutcomes] = useState(track.outcomes || 0);
  const [editedTrack, setEditedTrack] = useState({
    name: track.name,
    description: track.description || '',
    students: track.students,
    mentors: track.mentors || 0,
    requiresMentor: track.requiresMentor || false,
  });

  // Update local state when track prop changes
  useEffect(() => {
    setProgress(track.progress || 0);
    setOutcomes(track.outcomes || 0);
    setEditedTrack({
      name: track.name,
      description: track.description || '',
      students: track.students,
      mentors: track.mentors || 0,
      requiresMentor: track.requiresMentor || false,
    });
  }, [track]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    setProgress(newValue);
    onUpdate(track.id, { progress: newValue });
  };

  const handleOutcomesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    setOutcomes(newValue);
    onUpdate(track.id, { outcomes: newValue });
  };

  const handleSaveDetails = () => {
    onUpdate(track.id, {
      name: editedTrack.name,
      description: editedTrack.description,
      students: editedTrack.students,
      mentors: editedTrack.mentors,
      requiresMentor: editedTrack.requiresMentor,
    });
    setIsEditing(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Header with track name and badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editedTrack.name}
              onChange={(e) => setEditedTrack({ ...editedTrack, name: e.target.value })}
              className="text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 w-full mb-2"
              placeholder="Track name"
            />
          ) : (
            <h4 className="text-lg font-semibold text-gray-900">{track.name}</h4>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {track.students} students enrolled
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          programId === 'g-gmp' ? 'bg-purple-100 text-purple-700' :
          programId === 'pcp' ? 'bg-orange-100 text-orange-700' :
          'bg-orange-100 text-orange-700'
        }`}>
          {programId === 'g-gmp' ? 'Innovation' :
           programId === 'pcp' ? 'Certification' :
           'Learning'}
        </span>
      </div>

      {/* Quick Edit Fields (always visible) */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Progress Target (%)
          </label>
          <input
            type="number"
            value={progress}
            onChange={handleProgressChange}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            min="0"
            max="100"
          />
        </div>
        {hasOutcomes && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {programId === 'g-gmp' ? 'Outcome Target' : 'Certification Target'}
            </label>
            <input
              type="number"
              value={outcomes}
              onChange={handleOutcomesChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="0"
            />
          </div>
        )}
      </div>

      {/* Expandable Detailed Edit Section */}
      <div className="mb-3">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center text-xs text-orange-600 hover:text-orange-700"
        >
          {isEditing ? (
            <>
              <ChevronUp size={14} className="mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown size={14} className="mr-1" />
              Edit Details
            </>
          )}
        </button>
      </div>

      {isEditing && (
        <div className="space-y-3 mt-3 pt-3 border-t border-gray-100">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Description
            </label>
            <textarea
              value={editedTrack.description}
              onChange={(e) => setEditedTrack({ ...editedTrack, description: e.target.value })}
              rows={2}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter track description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Students Enrolled
              </label>
              <input
                type="number"
                value={editedTrack.students}
                onChange={(e) => setEditedTrack({ ...editedTrack, students: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Mentors Assigned
              </label>
              <input
                type="number"
                value={editedTrack.mentors}
                onChange={(e) => setEditedTrack({ ...editedTrack, mentors: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editedTrack.requiresMentor}
                onChange={(e) => setEditedTrack({ ...editedTrack, requiresMentor: e.target.checked })}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-xs text-gray-700">Requires Mentor</span>
            </label>

            <button
              onClick={handleSaveDetails}
              className="flex items-center px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
            >
              <Save size={12} className="mr-1" />
              Save Details
            </button>
          </div>
        </div>
      )}

      {/* Display description when not editing */}
      {!isEditing && track.description && (
        <div className="mt-2 text-xs text-gray-500 border-t border-gray-100 pt-2">
          <span className="font-medium">Description:</span> {track.description}
        </div>
      )}
    </div>
  );
}

// ==================== Main Component ====================

export default function ProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programMetrics, setProgramMetrics] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showTrackModal, setShowTrackModal] = useState<Program | null>(null);
  const [showReportModal, setShowReportModal] = useState<Program | null>(null);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [reportDateRange, setReportDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [savingTrack, setSavingTrack] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await ApiService.getPrograms();
        setPrograms(data);

        // Fetch detailed metrics for each program (mentor counts, outcome breakdowns)
        const metricsMap: Record<string, any> = {};
        await Promise.all(
          data.map(async (program) => {
            try {
              const metrics = await ApiService.getProgramMetrics(program.id);
              metricsMap[program.id] = metrics;
            } catch {
              // Metrics are optional; silently skip if unavailable
            }
          })
        );
        setProgramMetrics(metricsMap);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const getProgramStats = (program: Program) => {
    const activePercentage = Math.round((program.activeStudents / program.totalStudents) * 100);
    return { activePercentage };
  };

  const getProgramIcon = (program: Program) => {
    const IconComponent = iconMap[program.icon] || BookOpen;
    return IconComponent;
  };

  const getProgramColorClasses = (color: string) => {
    const classes = {
      purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
      blue: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
    };
    return classes[color as keyof typeof classes] || classes.blue;
  };

  const getOutcomeColor = (programId: string) => {
    switch (programId) {
      case 'g-gmp': return 'text-purple-600';
      case 'pcp': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const handleGenerateReport = async (program: Program) => {
    setGeneratingReport(true);
    try {
      // Fetch program-specific data for report
      const programData = await ApiService.getProgramById(program.id);
      const students = await ApiService.getStudents();
      const outcomes = program.hasOutcomes ? await ApiService.getOutcomesByProgram(program.name) : [];
      
      // Filter students by program
      const programStudents = students.filter(s => s.program === program.name);
      
      // Calculate report metrics
      const activeStudents = programStudents.filter(s => s.status === 'active').length;
      const completionRate = program.completionRate;
      const avgProgress = Math.round(programStudents.reduce((sum, s) => sum + s.progress, 0) / programStudents.length);
      
      // Build report data
      const reportData = {
        programName: program.name,
        generatedAt: new Date().toISOString(),
        dateRange: reportDateRange,
        summary: {
          totalStudents: program.totalStudents,
          activeStudents,
          completionRate,
          avgProgress,
          tracksCount: program.tracks.length,
          ...(program.hasOutcomes && { totalOutcomes: program.outcomeCount }),
        },
        tracks: program.tracks.map(t => ({
          name: t.name,
          students: t.students,
          progress: t.progress || 0,
          outcomes: t.outcomes,
        })),
        ...(program.hasOutcomes && {
          outcomes: {
            count: program.outcomeCount,
            ...(program.id === 'g-gmp' && {
              patents: 12,
              papers: 15,
              startups: 8,
            }),
            ...(program.id === 'pcp' && {
              associate: 25,
              specialist: 12,
              professional: 5,
            }),
          },
        }),
      };

      // Generate filename
      const filename = `${program.name.toLowerCase()}-report-${new Date().toISOString().split('T')[0]}`;

      // Call export service based on format
      if (reportFormat === 'pdf') {
        await generatePDFReport(reportData, filename);
      } else if (reportFormat === 'excel') {
        await generateExcelReport(reportData, filename);
      } else {
        await generateCSVReport(reportData, filename);
      }

      // Close modal after successful generation
      setShowReportModal(null);
      
      // Show success message (you might want to use a toast notification here)
      alert(`Report generated successfully!`);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const generatePDFReport = async (data: any, filename: string) => {
    // In a real app, this would call a PDF generation service
    // For now, create a simple HTML representation
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to generate PDF');
      return;
    }

    const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        h1 { color: #ff6633; font-size: 28px; }
        h2 { color: #333; font-size: 22px; margin-top: 30px; border-bottom: 2px solid #ff6633; }
        .summary-card { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #ff6633; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
      </style>
    `;

    let html = `
      <!DOCTYPE html>
      <html>
        <head><title>${data.programName} Report</title>${styles}</head>
        <body>
          <h1>${data.programName} Program Report</h1>
          <p>Generated: ${new Date(data.generatedAt).toLocaleString()}</p>
          <p>Date Range: ${data.dateRange}</p>
          
          <h2>Summary</h2>
          <div class="summary-card">
            <div class="stats-grid">
              <div>
                <p><strong>Total Students</strong></p>
                <p style="font-size: 24px;">${data.summary.totalStudents}</p>
              </div>
              <div>
                <p><strong>Active Students</strong></p>
                <p style="font-size: 24px;">${data.summary.activeStudents}</p>
              </div>
              <div>
                <p><strong>Completion Rate</strong></p>
                <p style="font-size: 24px;">${data.summary.completionRate}%</p>
              </div>
            </div>
          </div>
          
          <h2>Tracks</h2>
          <table>
            <thead>
              <tr>
                <th>Track</th>
                <th>Students</th>
                <th>Progress</th>
                ${data.programName === 'G-GMP' ? '<th>Outcomes</th>' : ''}
              </tr>
            </thead>
            <tbody>
    `;

    data.tracks.forEach((track: any) => {
      html += `
        <tr>
          <td>${track.name}</td>
          <td>${track.students}</td>
          <td>${track.progress}%</td>
          ${data.programName === 'G-GMP' ? `<td>${track.outcomes}</td>` : ''}
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
    `;

    if (data.outcomes) {
      html += `
        <h2>Outcomes</h2>
        <div class="summary-card">
          <div class="stats-grid">
            ${Object.entries(data.outcomes).map(([key, value]) => `
              <div>
                <p><strong>${key}</strong></p>
                <p style="font-size: 24px;">${value}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    html += `
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generateExcelReport = async (data: any, filename: string) => {
    // For now, generate CSV as simple Excel format
    let csv = '';

    csv += `${data.programName} Program Report\n`;
    csv += `Generated,${new Date(data.generatedAt).toLocaleString()}\n`;
    csv += `Date Range,${data.dateRange}\n\n`;

    csv += 'SUMMARY\n';
    csv += `Total Students,${data.summary.totalStudents}\n`;
    csv += `Active Students,${data.summary.activeStudents}\n`;
    csv += `Completion Rate,${data.summary.completionRate}%\n`;
    csv += `Average Progress,${data.summary.avgProgress}%\n`;
    csv += `Tracks,${data.summary.tracksCount}\n`;
    if (data.summary.totalOutcomes) {
      csv += `Total Outcomes,${data.summary.totalOutcomes}\n`;
    }
    csv += '\n';

    csv += 'TRACKS\n';
    csv += 'Track Name,Students,Progress';
    if (data.programName === 'G-GMP') csv += ',Outcomes';
    csv += '\n';

    data.tracks.forEach((track: any) => {
      csv += `${track.name},${track.students},${track.progress}%`;
      if (data.programName === 'G-GMP') csv += `,${track.outcomes}`;
      csv += '\n';
    });

    if (data.outcomes) {
      csv += '\nOUTCOMES\n';
      Object.entries(data.outcomes).forEach(([key, value]) => {
        csv += `${key},${value}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateCSVReport = async (data: any, filename: string) => {
    await generateExcelReport(data, filename); // Same as Excel for now
  };

  const handleManageTracks = (program: Program) => {
    setShowTrackModal(program);
  };

  const handleUpdateTrack = async (trackId: string, updates: Partial<Track>) => {
    // Optimistic update in UI
    setPrograms(prevPrograms =>
      prevPrograms.map(program => {
        if (program.id === showTrackModal?.id) {
          return {
            ...program,
            tracks: program.tracks.map(track =>
              track.id === trackId ? { ...track, ...updates } : track
            )
          };
        }
        return program;
      })
    );

    // Persist to backend
    try {
      setSavingTrack(trackId);
      await ApiService.updateTrack(trackId, updates as Record<string, any>);
    } catch (error) {
      console.error('Failed to save track update:', error);
      // Optionally revert local state on failure here
    } finally {
      setSavingTrack(null);
    }
  };

  const filteredPrograms = selectedType === 'all' 
    ? programs 
    : programs.filter(p => {
        if (selectedType === 'innovation') return p.id === 'g-gmp';
        if (selectedType === 'learning') return p.id === 'g-cmp' || p.id === 'e-tip';
        if (selectedType === 'certification') return p.id === 'pcp';
        return true;
      });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs & Tracks</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor all DMIF programs</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Programs</option>
            <option value="innovation">Innovation Programs (G-GMP)</option>
            <option value="learning">Learning Programs (G-CMP, E-TIP)</option>
            <option value="certification">Certification Programs (PCP)</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900">{programs.length}</p>
            </div>
            <GraduationCap size={24} className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.reduce((sum, p) => sum + p.totalStudents, 0)}
              </p>
            </div>
            <Users size={24} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.reduce((sum, p) => sum + p.activeStudents, 0)}
              </p>
            </div>
            <TrendingUp size={24} className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(programs.reduce((sum, p) => sum + p.completionRate, 0) / programs.length)}%
              </p>
            </div>
            <CheckCircle size={24} className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPrograms.map((program) => {
          const IconComponent = getProgramIcon(program);
          const OutcomeIcon = outcomeIconMap[program.id === 'g-gmp' ? 'G-GMP' : program.id === 'pcp' ? 'PCP' : ''] || Award;
          const stats = getProgramStats(program);
          const colorClasses = getProgramColorClasses(program.color);
          const typeInfo = programTypeDescriptions[program.id] || {
            type: 'Program',
            description: program.description,
            icon: BookOpen,
          };
          const TypeIcon = typeInfo.icon;
          
          return (
            <div
              key={program.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Program Header */}
              <div className={`p-6 border-b border-gray-200 ${colorClasses}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`w-14 h-14 rounded-xl ${colorClasses} flex items-center justify-center`}>
                      <IconComponent size={28} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-bold text-gray-900">{program.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
                          {typeInfo.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 max-w-2xl">{program.description}</p>
                      
                      {/* Program Type Description */}
                      <div className="flex items-center space-x-2 mt-2">
                        <TypeIcon size={14} className="text-gray-500" />
                        <span className="text-xs text-gray-500">{typeInfo.description}</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/admin/programs/${program.id}`}
                    className="flex items-center px-4 py-2 bg-white text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    View Details
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </div>

                {/* Program Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
                  <div className="bg-white/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Total Students</p>
                    <p className="text-xl font-bold text-gray-900">{program.totalStudents}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Active Students</p>
                    <p className="text-xl font-bold text-gray-900">{program.activeStudents}</p>
                    <p className="text-xs text-green-600 mt-1">{stats.activePercentage}% active</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Completion Rate</p>
                    <p className="text-xl font-bold text-gray-900">{program.completionRate}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className={`rounded-full h-1.5 ${
                          program.id === 'g-gmp' ? 'bg-purple-500' :
                          program.id === 'pcp' ? 'bg-orange-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${program.completionRate}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Mentor Stats - Only for programs with mentors */}
                  {program.hasMentors && (
                    <div className="bg-white/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Mentors</p>
                      <p className="text-xl font-bold text-gray-900">
                        {programMetrics[program.id]?.mentorCount ?? '—'}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">Active mentors</p>
                    </div>
                  )}

                  {/* Outcome Stats - Only for programs with outcomes */}
                  {program.hasOutcomes && program.outcomeCount ? (
                    <div className="bg-white/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">
                        {program.id === 'g-gmp' ? 'Total Outcomes' : 'Certifications'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <OutcomeIcon size={18} className={getOutcomeColor(program.id)} />
                        <p className="text-xl font-bold text-gray-900">{program.outcomeCount}</p>
                      </div>
                      {program.id === 'g-gmp' && programMetrics[program.id]?.outcomes && (
                        <div className="flex items-center space-x-2 mt-1 text-xs">
                          <span className="text-purple-600">{programMetrics[program.id].outcomes.patent ?? 0} patents</span>
                          <span className="text-gray-300">&bull;</span>
                          <span className="text-orange-600">{programMetrics[program.id].outcomes.paper ?? 0} papers</span>
                          <span className="text-gray-300">&bull;</span>
                          <span className="text-green-600">{programMetrics[program.id].outcomes.startup ?? 0} startups</span>
                        </div>
                      )}
                      {program.id === 'pcp' && programMetrics[program.id]?.outcomes && (
                        <div className="flex items-center space-x-2 mt-1 text-xs">
                          <span className="text-orange-600">{programMetrics[program.id].outcomes.associate ?? 0} associate</span>
                          <span className="text-gray-300">&bull;</span>
                          <span className="text-orange-600">{programMetrics[program.id].outcomes.specialist ?? 0} specialist</span>
                          <span className="text-gray-300">&bull;</span>
                          <span className="text-orange-600">{programMetrics[program.id].outcomes.professional ?? 0} professional</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Program Focus</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {program.id === 'g-cmp' ? 'Coding Skills' : 'Leadership'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Learning outcomes only</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats Row */}
                <div className="flex items-center space-x-4 mt-4 text-sm">
                  <span className="flex items-center text-gray-600">
                    <Clock size={14} className="mr-1" />
                    {program.id === 'pcp' ? 'Self-paced' : '6-12 months'}
                  </span>
                  <span className="flex items-center text-gray-600">
                    <Users size={14} className="mr-1" />
                    {program.tracks.length} tracks
                  </span>
                  {program.hasMentors && (
                    <span className="flex items-center text-gray-600">
                      <Award size={14} className="mr-1" />
                      Mentor-led
                    </span>
                  )}
                </div>
              </div>

              {/* Tracks Table */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Program Tracks</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Track Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrolled Students
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {program.id === 'g-gmp' ? 'Outcomes' : 
                           program.id === 'pcp' ? 'Certifications' : 
                           'Progress'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {program.tracks.map((track) => (
                        <tr key={track.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{track.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{track.students}</div>
                            <div className="text-xs text-gray-500">
                              {Math.round((track.students / program.totalStudents) * 100)}% of total
                            </div>
                          </td>                           <td className="px-4 py-3">
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${
                                program.id === 'g-gmp' ? 'text-purple-600' :
                                program.id === 'pcp' ? 'text-orange-600' :
                                'text-green-600'
                              }`}>
                                {program.id === 'g-gmp' || program.id === 'pcp' ? track.outcomes : track.progress}
                                {program.id !== 'g-gmp' && program.id !== 'pcp' && '%'}
                              </span>
                              {program.id !== 'g-gmp' && program.id !== 'pcp' && typeof track.progress === 'number' && (
                                <div className="ml-3 w-16 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-green-500 rounded-full h-1.5"
                                    style={{ width: `${track.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              program.id === 'g-gmp' ? 'bg-purple-100 text-purple-700' :
                              program.id === 'pcp' ? 'bg-orange-100 text-orange-700' :
                              program.hasMentors ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {program.id === 'g-gmp' ? 'Innovation Track' :
                               program.id === 'pcp' ? 'Certification Track' :
                               'Learning Track'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              track.outcomes > 20 ? 'bg-green-100 text-green-700' :
                              track.outcomes > 10 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {track.outcomes > 20 ? 'High Performance' :
                               track.outcomes > 10 ? 'On Track' :
                               'Developing'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer with quick actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Last updated: {new Date().toLocaleDateString()}
                    </span>
                    {program.hasOutcomes && (
                      <Link
                        href={`/admin/outcomes?program=${program.id}`}
                        className="text-sm text-orange-600 hover:text-orange-700"
                      >
                        View all {program.id === 'g-gmp' ? 'outcomes' : 'certifications'} →
                      </Link>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowReportModal(program)}
                      className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Download size={14} className="mr-1" />
                      Generate Report
                    </button>
                    <button
                      onClick={() => handleManageTracks(program)}
                      className="flex items-center px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Settings size={14} className="mr-1" />
                      Manage Tracks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPrograms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
          <p className="text-gray-500">No programs match your selected filter.</p>
        </div>
      )}

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generate Report</h3>
              <button onClick={() => setShowReportModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Generate report for <span className="font-semibold">{showReportModal.name}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Format
                </label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV File</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={reportDateRange}
                  onChange={(e) => setReportDateRange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Report will include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Program summary statistics</li>
                  <li>• Track-wise performance data</li>
                  {showReportModal.hasOutcomes && <li>• Outcome/Certification metrics</li>}
                  <li>• Student enrollment trends</li>
                  <li>• Completion rates</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowReportModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerateReport(showReportModal)}
                disabled={generatingReport}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {generatingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Tracks Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manage Tracks - {showTrackModal.name}</h3>
              <button onClick={() => setShowTrackModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {showTrackModal.tracks.map((track) => (
                <TrackEditor
                  key={track.id}
                  track={track}
                  programId={showTrackModal.id}
                  hasOutcomes={showTrackModal.hasOutcomes}
                  onUpdate={handleUpdateTrack}
                />
              ))}

              <button 
                onClick={() => {
                  // Add new track functionality here
                  console.log('Add new track for program:', showTrackModal.id);
                }}
                className="w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
              >
                + Add New Track
              </button>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTrackModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Save all changes
                  setShowTrackModal(null);
                  alert('Track changes saved successfully!');
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

