// packages/web/app/admin/reports/generate/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Search,
  X,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Brain,
  Code,
  TrendingUp
} from 'lucide-react';
import { ApiService } from '@/services/api';
import { ExportService } from '@/services/exportService';
import { Student, Mentor, Outcome } from '@/services/mockData';

interface ReportConfig {
  name: string;
  type: 'weekly' | 'monthly' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    start: string;
    end: string;
  };
  programs: string[];
  students: string[]; // Selected student IDs
  mentors: string[]; // Selected mentor IDs
  includeCharts: boolean;
  includeTables: boolean;
  includeAttendance: boolean;
  includeActivities: boolean;
  includeProgress: boolean;
  includeAssignments: boolean;
  includeOutcomes: boolean;
  schedule: {
    enabled: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    recipients?: string[];
  };
}

interface StudentData {
  id: string;
  name: string;
  email: string;
  program: string;
  track: string;
  mentor: string;
  progress: number;
  attendance?: number;
  activities?: number;
  assignments?: number;
  // Program-specific fields
  patents?: number;
  papers?: number;
  startups?: number;
  certifications?: number;
  projectsCompleted?: number;
  modulesCompleted?: number;
}

interface MentorData {
  id: string;
  name: string;
  email: string;
  programs: string[];
  expertise: string[];
  students?: number;
  sessions?: number;
}

interface ReportData {
  reportName: string;
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  programs: string[];
  students: StudentData[];
  mentors: MentorData[];
  outcomes: {
    gGMP?: {
      patents: number;
      papers: number;
      startups: number;
      byMonth?: Array<{ month: string; patents: number; papers: number; startups: number }>;
    };
    pcp?: {
      certifications: number;
      byLevel?: {
        associate: number;
        specialist: number;
        professional: number;
      };
    };
  };
  summary: {
    totalStudents: number;
    totalMentors: number;
    gGMPStudents: number;
    gCMPStudents: number;
    eTIPStudents: number;
    pcpStudents: number;
    totalOutcomes: number;
    averageProgress: number;
    averageAttendance?: number;
    totalActivities?: number;
    completedAssignments?: number;
  };
}

export default function GenerateReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const template = searchParams.get('template');
  
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'students' | 'mentors'>('students');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  // Set initial config based on template - only weekly and monthly
  const [config, setConfig] = useState<ReportConfig>(() => {
    let name = '';
    let type: 'weekly' | 'monthly' | 'custom' = 'weekly';
    let includeAttendance = false;
    let includeActivities = false;
    let includeAssignments = false;
    let includeOutcomes = false;

    if (template === 'weekly-progress') {
      name = 'Weekly Progress Report';
      type = 'weekly';
      includeAttendance = true;
      includeActivities = true;
      includeAssignments = true;
      includeOutcomes = true;
    } else if (template === 'monthly-analytics') {
      name = 'Monthly Analytics Report';
      type = 'monthly';
      includeAttendance = true;
      includeActivities = true;
      includeAssignments = true;
      includeOutcomes = true;
    }

    return {
      name,
      type,
      format: 'pdf',
      dateRange: {
        start: type === 'weekly' 
          ? new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
          : new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      programs: [],
      students: [],
      mentors: [],
      includeCharts: true,
      includeTables: true,
      includeAttendance,
      includeActivities,
      includeProgress: true,
      includeAssignments,
      includeOutcomes,
      schedule: {
        enabled: false,
      },
    };
  });

  const programs = ['G-GMP', 'G-CMP', 'E-TIP', 'PCP'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, mentorsData, outcomesData] = await Promise.all([
          ApiService.getStudents(),
          ApiService.getMentors(),
          ApiService.getOutcomes()
        ]);
        setStudents(studentsData);
        setMentors(mentorsData);
        setOutcomes(outcomesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate mock report data based on config
  const generateReportData = (): ReportData => {
    const selectedStudentsList = students.filter(s => config.students.includes(s.id));
    const selectedMentorsList = mentors.filter(m => config.mentors.includes(m.id));
    
    // Separate outcomes by program
    const gGMPOutcomes = outcomes.filter(o => o.program === 'G-GMP');
    const pcpCertifications = outcomes.filter(o => o.program === 'PCP');
    
    // Generate monthly outcome data
    const generateMonthlyOutcomeData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map(month => ({
        month,
        patents: Math.floor(Math.random() * 5) + 1,
        papers: Math.floor(Math.random() * 6) + 2,
        startups: Math.floor(Math.random() * 3) + 1,
      }));
    };

    // Count certifications by level
    const countByLevel = (certifications: Outcome[]) => {
      return {
        associate: certifications.filter(c => c.title?.toLowerCase().includes('associate')).length,
        specialist: certifications.filter(c => c.title?.toLowerCase().includes('specialist')).length,
        professional: certifications.filter(c => c.title?.toLowerCase().includes('professional')).length,
      };
    };
    
    return {
      reportName: config.name,
      generatedAt: new Date().toISOString(),
      dateRange: config.dateRange,
      programs: config.programs.length > 0 ? config.programs : ['All Programs'],
      students: selectedStudentsList.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        program: s.program,
        track: s.track,
        mentor: s.program === 'PCP' ? 'Self-paced' : (s.mentor || 'Not assigned'),
        progress: Math.floor(Math.random() * 30) + 60,
        attendance: Math.floor(Math.random() * 20) + 75,
        activities: Math.floor(Math.random() * 10) + 5,
        assignments: Math.floor(Math.random() * 8) + 2,
        // Program-specific metrics
        ...(s.program === 'G-GMP' && {
          patents: Math.floor(Math.random() * 3),
          papers: Math.floor(Math.random() * 4),
          startups: Math.floor(Math.random() * 2),
        }),
        ...(s.program === 'PCP' && {
          certifications: Math.floor(Math.random() * 3),
          modulesCompleted: Math.floor(Math.random() * 8) + 2,
        }),
        ...(s.program === 'G-CMP' && {
          projectsCompleted: Math.floor(Math.random() * 5),
        }),
      })),
      mentors: selectedMentorsList.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        programs: m.programs,
        expertise: m.expertise,
        students: m.students || Math.floor(Math.random() * 10) + 5,
        sessions: Math.floor(Math.random() * 15) + 5,
      })),
      outcomes: {
        gGMP: config.includeOutcomes ? {
          patents: gGMPOutcomes.filter(o => o.type === 'patent').length,
          papers: gGMPOutcomes.filter(o => o.type === 'paper').length,
          startups: gGMPOutcomes.filter(o => o.type === 'startup').length,
          byMonth: generateMonthlyOutcomeData(),
        } : undefined,
        pcp: config.includeOutcomes ? {
          certifications: pcpCertifications.length,
          byLevel: countByLevel(pcpCertifications),
        } : undefined,
      },
      summary: {
        totalStudents: selectedStudentsList.length,
        totalMentors: selectedMentorsList.length,
        gGMPStudents: selectedStudentsList.filter(s => s.program === 'G-GMP').length,
        gCMPStudents: selectedStudentsList.filter(s => s.program === 'G-CMP').length,
        eTIPStudents: selectedStudentsList.filter(s => s.program === 'E-TIP').length,
        pcpStudents: selectedStudentsList.filter(s => s.program === 'PCP').length,
        totalOutcomes: (config.includeOutcomes ? gGMPOutcomes.length + pcpCertifications.length : 0),
        averageProgress: Math.floor(Math.random() * 15) + 70,
        averageAttendance: Math.floor(Math.random() * 10) + 80,
        totalActivities: Math.floor(Math.random() * 100) + 50,
        completedAssignments: Math.floor(Math.random() * 80) + 20,
      },
    };
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Generate report data
      const data = generateReportData();
      setReportData(data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGenerated(true);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!reportData) return;

    const filename = `${config.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;

    switch (config.format) {
      case 'pdf':
        downloadPDF(reportData, filename);
        break;
      case 'excel':
        downloadExcel(reportData, filename);
        break;
      case 'csv':
        downloadCSV(reportData, filename);
        break;
      default:
        downloadPDF(reportData, filename);
    }
  };

  const handleSchedule = () => {
    alert('Report scheduled successfully! This feature will be implemented with the backend.');
    router.push('/admin/reports');
  };

  const downloadPDF = (data: ReportData, filename: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to generate PDF');
      return;
    }

    const styles = `
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        h1 { color: #ff6633; font-size: 28px; margin-bottom: 10px; }
        h2 { color: #333; font-size: 22px; margin: 25px 0 15px; border-bottom: 2px solid #ff6633; padding-bottom: 5px; }
        h3 { color: #666; font-size: 18px; margin: 15px 0 10px; }
        .header { margin-bottom: 30px; }
        .meta { color: #666; font-size: 14px; margin: 5px 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .summary-card { background: #f5f5f5; padding: 15px; border-radius: 8px; }
        .summary-label { color: #666; font-size: 14px; }
        .summary-value { color: #ff6633; font-size: 24px; font-weight: bold; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background: #ff6633; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9f9f9; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        .program-badge { 
          display: inline-block; 
          padding: 3px 8px; 
          border-radius: 12px; 
          font-size: 11px; 
          font-weight: bold;
        }
        .badge-G-GMP { background: #f3e8ff; color: #9333ea; }
        .badge-G-CMP { background: #dcfce7; color: #16a34a; }
        .badge-E-TIP { background: #dbeafe; color: #2563eb; }
        .badge-PCP { background: #fff7ed; color: #ea580c; }
        .outcome-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .outcome-card { padding: 15px; border-radius: 8px; text-align: center; }
        .patent-card { background: #f3e8ff; }
        .paper-card { background: #dbeafe; }
        .startup-card { background: #dcfce7; }
        .cert-card { background: #fff7ed; }
      </style>
    `;

    // Build HTML content
    let html = `
      <!DOCTYPE html>
      <html>
        <head><title>${data.reportName}</title>${styles}</head>
        <body>
          <div class="header">
            <h1>${data.reportName}</h1>
            <div class="meta">Generated: ${new Date(data.generatedAt).toLocaleString()}</div>
            <div class="meta">Date Range: ${new Date(data.dateRange.start).toLocaleDateString()} - ${new Date(data.dateRange.end).toLocaleDateString()}</div>
            <div class="meta">Programs: ${data.programs.join(', ')}</div>
          </div>
    `;

    // Summary Section
    if (config.includeProgress) {
      html += `
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Total Students</div>
            <div class="summary-value">${data.summary.totalStudents}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Average Progress</div>
            <div class="summary-value">${data.summary.averageProgress}%</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Activities</div>
            <div class="summary-value">${data.summary.totalActivities}</div>
          </div>
        </div>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">G-GMP Students</div>
            <div class="summary-value">${data.summary.gGMPStudents}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">PCP Students</div>
            <div class="summary-value">${data.summary.pcpStudents}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Outcomes</div>
            <div class="summary-value">${data.summary.totalOutcomes}</div>
          </div>
        </div>
      `;
    }

    // Outcomes Section
    if (config.includeOutcomes && data.outcomes) {
      html += `<h2>Outcomes & Certifications</h2>`;
      
      if (data.outcomes.gGMP) {
        html += `
          <h3>G-GMP Innovation Outcomes</h3>
          <div class="outcome-stats">
            <div class="outcome-card patent-card">
              <h4>Patents</h4>
              <div style="font-size: 32px; font-weight: bold; color: #9333ea;">${data.outcomes.gGMP.patents}</div>
            </div>
            <div class="outcome-card paper-card">
              <h4>Papers</h4>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb;">${data.outcomes.gGMP.papers}</div>
            </div>
            <div class="outcome-card startup-card">
              <h4>Startups</h4>
              <div style="font-size: 32px; font-weight: bold; color: #16a34a;">${data.outcomes.gGMP.startups}</div>
            </div>
          </div>
        `;
      }

      if (data.outcomes.pcp) {
        html += `
          <h3>PCP Certifications</h3>
          <div class="outcome-stats">
            <div class="outcome-card cert-card">
              <h4>Associate</h4>
              <div style="font-size: 32px; font-weight: bold; color: #ea580c;">${data.outcomes.pcp.byLevel?.associate || 0}</div>
            </div>
            <div class="outcome-card cert-card">
              <h4>Specialist</h4>
              <div style="font-size: 32px; font-weight: bold; color: #ea580c;">${data.outcomes.pcp.byLevel?.specialist || 0}</div>
            </div>
            <div class="outcome-card cert-card">
              <h4>Professional</h4>
              <div style="font-size: 32px; font-weight: bold; color: #ea580c;">${data.outcomes.pcp.byLevel?.professional || 0}</div>
            </div>
          </div>
        `;
      }
    }

    // Students Section
    if (config.students.length > 0) {
      html += `<h2>Student Details</h2>`;
      
      if (config.includeProgress) {
        html += `
          <h3>Progress Overview</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Program</th>
                <th>Track</th>
                <th>Mentor</th>
                <th>Progress</th>
                ${config.includeOutcomes ? '<th>Outcomes</th>' : ''}
              </tr>
            </thead>
            <tbody>
        `;
        data.students.forEach((student: StudentData) => {
          html += `
            <tr>
              <td>${student.name}</td>
              <td><span class="program-badge badge-${student.program.replace('-', '')}">${student.program}</span></td>
              <td>${student.track}</td>
              <td>${student.mentor}</td>
              <td>${student.progress}%</td>
              ${config.includeOutcomes ? `
                <td>
                  ${student.patents ? `Patents: ${student.patents}` : ''}
                  ${student.papers ? `Papers: ${student.papers}` : ''}
                  ${student.certifications ? `Certs: ${student.certifications}` : ''}
                </td>
              ` : ''}
            </tr>
          `;
        });
        html += `</tbody></table>`;
      }
    }

    // Mentors Section
    if (config.mentors.length > 0) {
      html += `
        <h2>Mentor Details</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Programs</th>
              <th>Expertise</th>
              <th>Students</th>
              <th>Sessions</th>
            </tr>
          </thead>
          <tbody>
      `;
      data.mentors.forEach((mentor: MentorData) => {
        html += `
          <tr>
            <td>${mentor.name}</td>
            <td>${mentor.programs.join(', ')}</td>
            <td>${mentor.expertise.join(', ')}</td>
            <td>${mentor.students}</td>
            <td>${mentor.sessions}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
    }

    // Footer
    html += `
      <div class="footer">
        <p>Generated by DMIF Student Tracker</p>
      </div>
    </body></html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const downloadExcel = (data: ReportData, filename: string) => {
    let csv = '';

    // Add report info
    csv += `Report: ${data.reportName}\n`;
    csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    csv += `Date Range: ${new Date(data.dateRange.start).toLocaleDateString()} - ${new Date(data.dateRange.end).toLocaleDateString()}\n`;
    csv += `Programs: ${data.programs.join(', ')}\n\n`;

    // Add summary
    csv += 'SUMMARY\n';
    csv += `Total Students,${data.summary.totalStudents}\n`;
    csv += `Average Progress,${data.summary.averageProgress}%\n`;
    csv += `Average Attendance,${data.summary.averageAttendance}%\n`;
    csv += `Total Activities,${data.summary.totalActivities}\n`;
    csv += `Completed Assignments,${data.summary.completedAssignments}\n`;
    csv += `G-GMP Students,${data.summary.gGMPStudents}\n`;
    csv += `PCP Students,${data.summary.pcpStudents}\n`;
    csv += `Total Outcomes,${data.summary.totalOutcomes}\n\n`;

    // Add outcomes
    if (data.outcomes?.gGMP) {
      csv += 'G-GMP OUTCOMES\n';
      csv += `Patents,${data.outcomes.gGMP.patents}\n`;
      csv += `Papers,${data.outcomes.gGMP.papers}\n`;
      csv += `Startups,${data.outcomes.gGMP.startups}\n\n`;
    }

    if (data.outcomes?.pcp) {
      csv += 'PCP CERTIFICATIONS\n';
      csv += `Associate,${data.outcomes.pcp.byLevel?.associate || 0}\n`;
      csv += `Specialist,${data.outcomes.pcp.byLevel?.specialist || 0}\n`;
      csv += `Professional,${data.outcomes.pcp.byLevel?.professional || 0}\n\n`;
    }

    // Add students data
    if (data.students.length > 0) {
      csv += 'STUDENTS\n';
      csv += 'Name,Email,Program,Track,Mentor,Progress,Attendance,Activities,Assignments';
      if (config.includeOutcomes) {
        csv += ',Patents,Papers,Startups,Certifications';
      }
      csv += '\n';
      
      data.students.forEach((student: StudentData) => {
        csv += `"${student.name}",${student.email},${student.program},${student.track},${student.mentor},${student.progress}%,${student.attendance}%,${student.activities},${student.assignments}`;
        if (config.includeOutcomes) {
          csv += `,${student.patents || 0},${student.papers || 0},${student.startups || 0},${student.certifications || 0}`;
        }
        csv += '\n';
      });
      csv += '\n';
    }

    // Add mentors data
    if (data.mentors.length > 0) {
      csv += 'MENTORS\n';
      csv += 'Name,Email,Programs,Expertise,Students,Sessions\n';
      data.mentors.forEach((mentor: MentorData) => {
        csv += `"${mentor.name}",${mentor.email},"${mentor.programs.join(';')}","${mentor.expertise.join(';')}",${mentor.students},${mentor.sessions}\n`;
      });
    }

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: ReportData, filename: string) => {
    downloadExcel(data, filename);
  };

  const toggleStudent = (studentId: string) => {
    setConfig(prev => ({
      ...prev,
      students: prev.students.includes(studentId)
        ? prev.students.filter(id => id !== studentId)
        : [...prev.students, studentId]
    }));
  };

  const toggleMentor = (mentorId: string) => {
    setConfig(prev => ({
      ...prev,
      mentors: prev.mentors.includes(mentorId)
        ? prev.mentors.filter(id => id !== mentorId)
        : [...prev.mentors, mentorId]
    }));
  };

  const selectAllStudents = () => {
    if (config.students.length === filteredStudents.length) {
      setConfig(prev => ({ ...prev, students: [] }));
    } else {
      setConfig(prev => ({ ...prev, students: filteredStudents.map(s => s.id) }));
    }
  };

  const selectAllMentors = () => {
    if (config.mentors.length === filteredMentors.length) {
      setConfig(prev => ({ ...prev, mentors: [] }));
    } else {
      setConfig(prev => ({ ...prev, mentors: filteredMentors.map(m => m.id) }));
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.program.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProgram = config.programs.length === 0 || config.programs.includes(student.program);
    
    return matchesSearch && matchesProgram;
  });

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = 
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProgram = config.programs.length === 0 || 
      mentor.programs.some(p => config.programs.includes(p));
    
    return matchesSearch && matchesProgram;
  });

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700',
      'G-CMP': 'bg-green-100 text-green-700',
      'E-TIP': 'bg-orange-100 text-orange-700',
      'PCP': 'bg-orange-100 text-orange-700'
    };
    return colors[program as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getProgramIcon = (program: string) => {
    switch (program) {
      case 'G-GMP':
        return <Brain size={16} className="text-purple-500" />;
      case 'G-CMP':
        return <Code size={16} className="text-green-500" />;
      case 'E-TIP':
        return <Award size={16} className="text-orange-500" />;
      case 'PCP':
        return <GraduationCap size={16} className="text-orange-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

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
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/reports"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Generate Report</h1>
        </div>
      </div>

      {/* Template Info Banner */}
      {template && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            {template === 'weekly-progress' ? (
              <Clock size={20} className="text-orange-500" />
            ) : (
              <TrendingUp size={20} className="text-green-500" />
            )}
            <div>
              <p className="text-sm text-orange-700">
                <strong>Template:</strong> {config.name}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {template === 'weekly-progress' 
                  ? 'Weekly report including progress, attendance, and activities'
                  : 'Monthly comprehensive analytics with trends and outcomes'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= i ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > i ? <CheckCircle size={16} /> : i}
              </div>
              {i < 4 && <div className={`flex-1 h-1 mx-2 ${
                step > i ? 'bg-orange-600' : 'bg-gray-200'
              }`} />}
            </div>
          ))}
        </div>
      </div>

      {!generated ? (
        <>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Report Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Name *
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Weekly Progress Report - Week 12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Type
                    </label>
                    <select
                      value={config.type}
                      onChange={(e) => setConfig({ ...config, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="weekly">Weekly Report</option>
                      <option value="monthly">Monthly Report</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format
                    </label>
                    <select
                      value={config.format}
                      onChange={(e) => setConfig({ ...config, format: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={config.dateRange.start}
                      onChange={(e) => setConfig({
                        ...config,
                        dateRange: { ...config.dateRange, start: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={config.dateRange.end}
                      onChange={(e) => setConfig({
                        ...config,
                        dateRange: { ...config.dateRange, end: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setStep(2)}
                  disabled={!config.name}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Select Candidates
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Candidates (Students/Mentors) */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Select Candidates</h2>
              
              {/* Program Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Program
                </label>
                <div className="flex flex-wrap gap-2">
                  {programs.map((program) => (
                    <button
                      key={program}
                      onClick={() => {
                        setConfig(prev => ({
                          ...prev,
                          programs: prev.programs.includes(program)
                            ? prev.programs.filter(p => p !== program)
                            : [...prev.programs, program]
                        }))
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        config.programs.includes(program)
                          ? getProgramColor(program)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {program}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setSelectedTab('students')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === 'students'
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Students ({filteredStudents.length})
                  </button>
                  <button
                    onClick={() => setSelectedTab('mentors')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === 'mentors'
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Mentors ({filteredMentors.length})
                  </button>
                </nav>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={`Search ${selectedTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Select All */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={selectedTab === 'students' ? selectAllStudents : selectAllMentors}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  {selectedTab === 'students' 
                    ? (config.students.length === filteredStudents.length ? 'Deselect All' : 'Select All')
                    : (config.mentors.length === filteredMentors.length ? 'Deselect All' : 'Select All')
                  }
                </button>
                <span className="text-sm text-gray-500">
                  {selectedTab === 'students' 
                    ? `${config.students.length} selected`
                    : `${config.mentors.length} selected`
                  }
                </span>
              </div>

              {/* Students List */}
              {selectedTab === 'students' && (
                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {filteredStudents.map((student) => (
                    <label
                      key={student.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        config.students.includes(student.id)
                          ? 'bg-orange-50 border border-orange-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={config.students.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="rounded border-gray-300 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getProgramIcon(student.program)}
                            <p className="font-medium text-gray-900">{student.name}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getProgramColor(student.program)}`}>
                            {student.program}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {student.track} • Mentor: {student.mentor || 'Not assigned'}
                        </p>
                      </div>
                    </label>
                  ))}

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No students match your filters
                    </div>
                  )}
                </div>
              )}

              {/* Mentors List */}
              {selectedTab === 'mentors' && (
                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {filteredMentors.map((mentor) => (
                    <label
                      key={mentor.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        config.mentors.includes(mentor.id)
                          ? 'bg-orange-50 border border-orange-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={config.mentors.includes(mentor.id)}
                        onChange={() => toggleMentor(mentor.id)}
                        className="rounded border-gray-300 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{mentor.name}</p>
                          <div className="flex gap-1">
                            {mentor.programs.map(prog => (
                              <span key={prog} className={`text-xs px-2 py-1 rounded-full ${getProgramColor(prog)}`}>
                                {prog}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{mentor.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {mentor.expertise.join(' • ')}
                        </p>
                      </div>
                    </label>
                  ))}

                  {filteredMentors.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No mentors match your filters
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={config.students.length === 0 && config.mentors.length === 0}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Select Content
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Content Types */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Include in Report</h2>
              
              <div className="space-y-4">
                {/* Common sections */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Standard Sections</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.includeProgress}
                        onChange={(e) => setConfig({ ...config, includeProgress: e.target.checked })}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">Progress Overview</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.includeCharts}
                        onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">Charts & Visualizations</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.includeTables}
                        onChange={(e) => setConfig({ ...config, includeTables: e.target.checked })}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">Data Tables</span>
                    </label>
                  </div>
                </div>

                {/* Program-specific sections */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Additional Sections</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.includeOutcomes}
                        onChange={(e) => setConfig({ ...config, includeOutcomes: e.target.checked })}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">Innovation Outcomes (G-GMP) & Certifications (PCP)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.includeAttendance}
                        onChange={(e) => setConfig({ ...config, includeAttendance: e.target.checked })}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">Attendance Records</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.includeActivities}
                        onChange={(e) => setConfig({ ...config, includeActivities: e.target.checked })}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">Activities & Tasks</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.includeAssignments}
                        onChange={(e) => setConfig({ ...config, includeAssignments: e.target.checked })}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">Assignments & Projects</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Next: Schedule & Generate
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Schedule & Generate */}
          {step === 4 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Schedule & Generate</h2>
              
              <div className="mb-6">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={config.schedule.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      schedule: { ...config.schedule, enabled: e.target.checked }
                    })}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm font-medium">Schedule recurring report</span>
                </label>

                {config.schedule.enabled && (
                  <div className="ml-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={config.schedule.frequency}
                        onChange={(e) => setConfig({
                          ...config,
                          schedule: { ...config.schedule, frequency: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Recipients
                      </label>
                      <input
                        type="text"
                        placeholder="Enter email addresses (comma separated)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate multiple emails with commas
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-orange-800 mb-2">Report Summary</h4>
                <ul className="space-y-1 text-sm text-orange-700">
                  <li>• Name: {config.name}</li>
                  <li>• Type: {config.type} report</li>
                  <li>• Format: {config.format.toUpperCase()}</li>
                  <li>• Date Range: {config.dateRange.start} to {config.dateRange.end}</li>
                  <li>• Programs: {config.programs.length > 0 ? config.programs.join(', ') : 'All'}</li>
                  <li>• Students: {config.students.length} selected</li>
                  <li>• Mentors: {config.mentors.length} selected</li>
                  <li>• Includes: {[
                    config.includeProgress && 'Progress',
                    config.includeAttendance && 'Attendance',
                    config.includeActivities && 'Activities',
                    config.includeAssignments && 'Assignments',
                    config.includeOutcomes && 'Outcomes/Certifications',
                    config.includeCharts && 'Charts',
                    config.includeTables && 'Tables'
                  ].filter(Boolean).join(', ')}</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText size={18} className="mr-2" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Success State */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Generated Successfully!</h2>
          <p className="text-gray-500 mb-6">
            Your report "{config.name}" has been generated and is ready for download.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDownload}
              className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Download size={18} className="mr-2" />
              Download Report
            </button>
            {config.schedule.enabled && (
              <button
                onClick={handleSchedule}
                className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Clock size={18} className="mr-2" />
                View Schedule
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

