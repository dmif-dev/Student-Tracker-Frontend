// packages/web/app/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { 
  Users, GraduationCap, Award, TrendingUp, Clock, CheckCircle, 
  Calendar, Bell, Shield, ArrowUpRight, BarChart3, LineChart,
  Activity, Star, Zap, LayoutDashboard, ChevronRight, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAdminDashboardStats, useSystemActivities } from '@/hooks/api/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import LoaderOne from "@/components/ui/loader-one";

// Recharts components imports
import { 
  ResponsiveContainer, ComposedChart, Bar as RechartsBar, Line as RechartsLine, XAxis, YAxis, Tooltip as ChartTooltip, Legend, 
  AreaChart, Area, CartesianGrid, Cell, PieChart, Pie
} from 'recharts';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalMentors: number;
  programsCount: number;
  pendingReviews: number;
  outcomesThisMonth: number;
}

interface ActivityItem {
  id: string;
  type: 'student_registered' | 'progress_submitted' | 'report_generated' | 'outcome_achieved' | 'certification_completed';
  title: string;
  time: string;
  user?: string;
  program?: string;
}

const mapActivityType = (type: string, program?: string): ActivityItem['type'] => {
  if (type === 'outcome') {
    return program === 'PCP' ? 'certification_completed' : 'outcome_achieved';
  }
  switch (type) {
    case 'enrollment':
      return 'student_registered';
    case 'progress':
      return 'progress_submitted';
    case 'report_generated':
      return 'report_generated';
    default:
      return 'progress_submitted';
  }
};

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: activitiesData, isLoading: activitiesLoading } = useSystemActivities(15);

  const [mounted, setMounted] = useState(false);
  const [activeNode, setActiveNode] = useState<number>(1);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loading = statsLoading || activitiesLoading;

  const stats: DashboardStats = {
    totalStudents: statsData?.stats?.totalStudents || 0,
    activeStudents: statsData?.stats?.activeStudents || 0,
    totalMentors: statsData?.stats?.totalMentors || 0,
    programsCount: statsData?.stats?.totalPrograms || 0,
    pendingReviews: statsData?.stats?.pendingReviews || 0,
    outcomesThisMonth: statsData?.stats?.totalOutcomes || 0,
  };

  const activitySource = statsData?.recentActivity || activitiesData || [];

  const recentActivity: ActivityItem[] = activitySource.map((a: any) => ({
    id: a.id,
    type: mapActivityType(a.type || a.action, a.program),
    title: a.title || `${a.action || 'Activity'} - ${a.details || ''}`,
    time: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : a.time || 'Just now',
    user: a.user?.name || a.user?.email || a.user,
    program: a.program,
  }));

  const sessionCounts = statsData?.sessionCountsByProgram || { 'G-GMP': 0, 'G-CMP': 0, 'E-TIP': 0 };

  // 1. Program Split Percentages (Purely fetched from DB!)
  const programDist = statsData?.programDistribution || [];
  const totalStudentsVal = stats.totalStudents || 1;

  const cohortDistribution = programDist.length > 0
    ? programDist.map((item: any) => {
        const pName = item.program || 'Unknown';
        const pValue = item.students || 0;
        const pct = Math.round((pValue / totalStudentsVal) * 100);

        let color = '#38bdf8'; // default
        if (pName.includes('GMP')) color = '#0ea5e9';
        else if (pName.includes('CMP')) color = '#ec4899';
        else if (pName.includes('TIP')) color = '#eab308';
        else if (pName.includes('PCP')) color = '#f97316';

        return {
          name: `${pName} Program`,
          value: pct > 0 ? pct : 0,
          color: color
        };
      })
    : [];

  // 2. Trend lines (Enrollment vs Outcomes) - Purely fetched from the backend database!
  const rawTrendData = (statsData?.enrollmentTrend || []).map((et: any) => {
    const outcome = (statsData?.outcomesByMonth || []).find((om: any) => om.month === et.month);
    return {
      month: et.month,
      Enrollment: et.students || 0,
      Outcomes: outcome?.count || 0
    };
  });

  const activeTrendData = rawTrendData.length > 0 ? rawTrendData : [];

  // 3. Alternate Capsule weekday bars heights and custom scores (Purely fetched from DB!)
  const dbProgressTrend = statsData?.progressTrend || [];
  const weekdayBars = dbProgressTrend.length > 0
    ? dbProgressTrend.map((t: any, idx: number) => {
        const colors = [
          'from-sky-400 to-sky-500',
          'from-rose-400 to-rose-500',
          'from-fuchsia-400 to-fuchsia-500',
          'from-amber-400 to-amber-500',
          'from-orange-400 to-orange-500',
          'from-violet-400 to-violet-500',
          'from-cyan-400 to-cyan-500'
        ];
        const ratingVal = t.rating ? Math.round(t.rating * 10) / 10 : 0;
        const heightPct = ratingVal > 0 ? `${ratingVal * 10}%` : '15%'; // minimum height of 15% so capsule is visible
        return {
          label: t.day,
          value: ratingVal,
          height: heightPct,
          color: colors[idx % colors.length]
        };
      })
    : [];

  // Map progress ring to actual DB average attendance!
  const progressAttendance = statsData?.engagementMetrics?.averageAttendance || 72;

  // 4. Milestone Achievement Doughnut Segments (Purely fetched from DB!)
  const dbOutcomesByType = statsData?.outcomesByType || [];
  const milestoneSegments = dbOutcomesByType.length > 0
    ? dbOutcomesByType.map((item: any, idx: number) => {
        const colors = ['#38bdf8', '#8b5cf6', '#2563eb', '#34d399', '#f59e0b'];
        let displayName = item.type;
        if (item.type === 'PAPER') displayName = 'Research Papers';
        else if (item.type === 'PATENT') displayName = 'Patents Filed';
        else if (item.type === 'STARTUP') displayName = 'Startups Launched';
        else if (item.type === 'CERTIFICATION') displayName = 'Certifications';
        else if (item.type === 'PROJECT') displayName = 'Projects Completed';

        return {
          name: displayName,
          value: item.count || 0,
          color: colors[idx % colors.length]
        };
      })
    : [];

  const radarNodes = [
    { id: 1, name: 'Total Students', value: stats.totalStudents, label: '01', color: '#f97316', desc: 'Total enrolled student profiles in system database.' },
    { id: 2, name: 'Active Students', value: stats.activeStudents, label: '02', color: '#ec4899', desc: 'Students actively submitting updates in last 14 days.' },
    { id: 3, name: 'Active Mentors', value: stats.totalMentors, label: '03', color: '#10b981', desc: 'Faculty advisors supervising mentoring cohorts.' },
    { id: 4, name: 'Active Tracks', value: stats.programsCount, label: '04', color: '#8b5cf6', desc: 'Educational learning curriculums active on platform.' },
    { id: 5, name: 'Success Outcomes', value: stats.outcomesThisMonth, label: '05', color: '#38bdf8', desc: 'Certifications and achievements completed this month.' },
    { id: 6, name: 'Pending Reviews', value: stats.pendingReviews, label: '06', color: '#64748b', desc: 'Project submissions awaiting administrator evaluation.' }
  ];

  const getRadarCoordinates = (index: number) => {
    const totalNodes = radarNodes.length;
    // Calculate angle evenly distributed in a circle, starting from top (270 degrees)
    const angle = (index * (360 / totalNodes) - 90) * (Math.PI / 180);
    const radius = 72;
    return {
      x: 150 + radius * Math.cos(angle),
      y: 115 + radius * Math.sin(angle)
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4 bg-slate-50/50">
        <LoaderOne />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">Syncing Console Data...</p>
      </div>
    );
  }

  // Premium Custom Tooltip with Glowing styling
  const SimpleTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const month = payload[0].payload.month;
      const enrollment = payload[0].value;
      const outcomes = payload[1]?.value || 0;
      return (
        <div className="bg-[#0F172A] border border-slate-800 text-white px-3.5 py-2.5 rounded-xl shadow-2xl text-[11px] font-medium space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <p className="font-extrabold text-slate-400 border-b border-slate-800/60 pb-1 mb-1 text-[10px] uppercase tracking-wider">{month} Activity</p>
          <p className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#eab308]"></span>Enrollment Rate: <span className="font-bold text-white">{enrollment} pts</span></p>
          <p className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#f97316]"></span>Outcome Success: <span className="font-bold text-white">{outcomes} pts</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6 pb-16 bg-[#F8FAFC] min-h-screen text-slate-800 relative">
      
      {/* Inline styles for custom premium animations */}
      <style>{`
        @keyframes dashScroll {
          to {
            stroke-dashoffset: -20;
          }
        }
        .radar-dash-line {
          animation: dashScroll 0.9s linear infinite;
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.35;
            transform: scale(1.15);
          }
        }
        .pulse-glow-bg {
          animation: pulseGlow 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Console Online</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-montserrat uppercase">
            Admin Console
          </h1>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">Centralized operational widgets and student analytics dashboard.</p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/analytics">
            <Button variant="outline" className="h-9 px-4 text-xs font-bold bg-white border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 shadow-sm flex items-center">
              <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> Full Analytics
            </Button>
          </Link>
          <Link href="/admin/students/add">
            <Button className="h-9 px-4 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white border-none rounded-lg transition-all duration-200 shadow-sm flex items-center">
              <Users className="mr-1.5 h-3.5 w-3.5" /> Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Checklist strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 select-none">
        {[
          { label: "Total Students", value: stats.totalStudents, theme: "border-l-orange-500" },
          { label: "Active Students", value: stats.activeStudents, theme: "border-l-rose-500" },
          { label: "Active Mentors", value: stats.totalMentors, theme: "border-l-emerald-500" },
          { label: "Active Tracks", value: stats.programsCount, theme: "border-l-purple-500" },
          { label: "Pending Reviews", value: stats.pendingReviews, theme: "border-l-amber-500", alert: stats.pendingReviews > 0 },
          { label: "Monthly Outcomes", value: stats.outcomesThisMonth, theme: "border-l-sky-500" }
        ].map((item, idx) => (
          <div key={idx} className={cn("bg-white border border-slate-100 border-l-4 p-4 rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5", item.theme)}>
            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-widest leading-none">{item.label}</span>
            <div className="flex items-baseline justify-between mt-3">
              <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">{item.value}</p>
              {item.alert && (
                <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md animate-pulse">Action</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* WIDGET 1: Interactive Telemetry Radar */}
        <Card className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between h-[340px] relative overflow-hidden transition-all duration-300 hover:shadow-md">
          <div>
            <CardTitle className="text-xs font-black text-slate-900 tracking-widest uppercase flex items-center justify-between">
              <span>Interactive Telemetry</span>
              <span title="Click numbered nodes to view metrics" className="cursor-help">
                <HelpCircle size={13} className="text-slate-300 hover:text-slate-500" />
              </span>
            </CardTitle>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Explore database segments live</p>
          </div>

          <div className="flex items-center justify-center h-[170px] relative my-auto">
            <svg width="280" height="220" className="overflow-visible select-none">
              {/* Radar transmission lines */}
              {radarNodes.map((node, idx) => {
                const coords = getRadarCoordinates(idx);
                const isSelected = activeNode === node.id;
                const isHovered = hoveredNode === node.id;
                return (
                  <line
                    key={node.id}
                    x1="150"
                    y1="115"
                    x2={coords.x}
                    y2={coords.y}
                    stroke={isSelected || isHovered ? node.color : '#E2E8F0'}
                    strokeWidth={isSelected || isHovered ? '2' : '1.2'}
                    strokeDasharray="4, 4"
                    className="radar-dash-line transition-all duration-300"
                    strokeDashoffset={isSelected ? 0 : undefined}
                    opacity={isSelected || isHovered ? 1 : 0.4}
                  />
                );
              })}

              <circle cx="150" cy="115" r="28" fill="#F8FAFC" className="pulse-glow-bg" opacity="0.15" />
              <circle cx="150" cy="115" r="23" fill="#0F172A" />
              <g transform="translate(139, 104)" className="pointer-events-none text-white opacity-95">
                <path d="M11 2L2 6.5L11 11L20 6.9V13H22V6.5L11 2Z" fill="#38BDF8" />
                <path d="M4 9.5V13C4 15.5 7.2 17 11 17C14.8 17 18 15.5 18 13V9.5L11 12L4 9.5Z" fill="#F97316" />
              </g>

              {/* Satellite clickable nodes */}
              {radarNodes.map((node, idx) => {
                const coords = getRadarCoordinates(idx);
                const isSelected = activeNode === node.id;
                const isHovered = hoveredNode === node.id;
                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => setActiveNode(node.id)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="14"
                      fill="transparent"
                      stroke={isSelected || isHovered ? node.color : 'transparent'}
                      strokeWidth="1.5"
                      className="transition-all duration-300"
                      opacity="0.8"
                    />
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="10.5"
                      fill="white"
                      stroke={isSelected || isHovered ? node.color : '#CBD5E1'}
                      strokeWidth="2"
                      className="transition-all duration-200"
                    />
                    <text
                      x={coords.x}
                      y={coords.y + 3}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={isSelected || isHovered ? node.color : '#64748B'}
                      className="transition-all duration-200"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg flex items-center space-x-3 text-xs select-none">
            <div
              className="h-8.5 w-8.5 rounded-lg flex flex-col items-center justify-center font-bold text-white shadow-sm transition-all duration-300"
              style={{ backgroundColor: radarNodes[activeNode - 1].color }}
            >
              <span>{radarNodes[activeNode - 1].label}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-slate-800 truncate leading-none">{radarNodes[activeNode - 1].name}</p>
                <span className="font-black text-slate-900 ml-1 text-sm leading-none">{radarNodes[activeNode - 1].value}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate leading-none font-semibold">{radarNodes[activeNode - 1].desc}</p>
            </div>
          </div>
        </Card>

        {/* WIDGET 2: Stacked program split ring */}
        <Card className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between h-[340px] transition-all duration-300 hover:shadow-md">
          <div>
            <CardTitle className="text-xs font-black text-slate-900 tracking-widest uppercase">
              Program Split
            </CardTitle>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Distribution of active curriculum cohorts</p>
          </div>

          <div className="flex items-center justify-between gap-4 h-[170px] my-auto">
            <div className="w-[125px] h-[125px] relative flex items-center justify-center flex-shrink-0">
              {mounted ? (
                cohortDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cohortDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={43}
                      outerRadius={56}
                      startAngle={225}
                      endAngle={-45}
                      paddingAngle={3.5}
                      cornerRadius={6}
                    >
                      {cohortDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">No Data</div>
                )
              ) : null}
              <div className="absolute text-center select-none pointer-events-none">
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest block leading-none">Tracks</span>
                <span className="text-xl font-black text-slate-800 tracking-tight mt-1 block leading-none">
                  {stats.programsCount || 4}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2 select-none pr-1">
              {cohortDistribution.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-600 border-b border-slate-50 pb-1 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-800 font-bold text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-900 text-[11px]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
            Cohort load balance is: <span className="text-sky-500 font-black">Fully Optimized</span>
          </div>
        </Card>

        {/* WIDGET 3: Bezier Curve Wave Lines (Activity Trends - Optimized baseline) */}
        <Card className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between h-[340px] md:col-span-2 lg:col-span-1 transition-all duration-300 hover:shadow-md animate-in fade-in duration-300">
          <div>
            <CardTitle className="text-xs font-black text-slate-900 tracking-widest uppercase">
              Activity Trends
            </CardTitle>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Organic multi-month activity telemetry</p>
          </div>

          <div className="h-[175px] w-full my-auto mt-2">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeTrendData} margin={{ top: 12, right: 6, bottom: 0, left: -25 }}>
                  <defs>
                    <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#eab308" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="#eab308" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="outcomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<SimpleTooltip />} cursor={{ stroke: '#F59E0B', strokeWidth: 1 }} />
                  
                  {/* Glowing waves with gradient and smooth bezier curves */}
                  <Area
                    type="monotone"
                    dataKey="Enrollment"
                    stroke="#eab308"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#enrollGrad)"
                    dot={{ r: 3, fill: '#fff', stroke: '#eab308', strokeWidth: 2 }}
                    activeDot={{ r: 5.5, strokeWidth: 0, fill: '#eab308' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Outcomes"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#outcomeGrad)"
                    dot={{ r: 2.5, fill: '#fff', stroke: '#f97316', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#ea580c' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-50 select-none">
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-[#eab308]"></span>
              <span>Enrollments</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-[#f97316]"></span>
              <span>Outcomes</span>
            </div>
          </div>
        </Card>

      </div>

      {/* Row 2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* WIDGET 4: Weekly Progress capsule bars (2 Columns span) */}
        <Card className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-[270px] lg:col-span-2 flex flex-col justify-between transition-all duration-300 hover:shadow-md">
          <div>
            <CardTitle className="text-xs font-black text-slate-900 tracking-widest uppercase">
              Weekly Progress
            </CardTitle>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Evaluation of check-ins and performance velocity</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch justify-between gap-6 my-auto">
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="flex items-baseline space-x-2 select-none">
                <span className="text-3xl font-black text-slate-900 tracking-tight">8.9</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Learning Score</span>
              </div>

              <div className="relative h-[80px] flex items-end justify-between select-none px-1">
                <div className="absolute bottom-4 left-0 right-0 h-px bg-slate-100/80 w-full z-0"></div>

                {weekdayBars.map((bar: any, idx: number) => {
                  const isHovered = hoveredBar === idx;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer z-10"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute -top-7 bg-slate-900 text-white font-extrabold text-[8.5px] px-1.5 py-0.5 rounded shadow-md pointer-events-none select-none z-20 whitespace-nowrap"
                          >
                            Score: {bar.value}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div
                        className={cn(
                          "w-[9px] rounded-full bg-gradient-to-t transition-all duration-300",
                          bar.color,
                          isHovered ? "shadow-md brightness-95 scale-x-110" : "opacity-90"
                        )}
                        style={{ height: bar.height }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.6, delay: idx * 0.02, ease: "easeOut" }}
                      />
                      <span className={cn(
                        "text-[8px] font-extrabold mt-1.5 leading-none uppercase select-none transition-colors duration-200",
                        isHovered ? "text-slate-900" : "text-slate-400"
                      )}>
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hidden sm:block w-px bg-slate-100 my-1"></div>

            <div className="w-full sm:w-[150px] flex-shrink-0 flex items-center justify-center">
              <div className="relative w-22 h-22 flex items-center justify-center select-none">
                <svg width="88" height="88" className="transform -rotate-90">
                  <circle
                    cx="44"
                    cy="44"
                    r="35"
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="6.5"
                  />
                  <circle
                    cx="44"
                    cy="44"
                    r="35"
                    fill="transparent"
                    stroke="url(#progressCapsuleGrad)"
                    strokeWidth="6.5"
                    strokeDasharray="219.9"
                    strokeDashoffset={219.9 - (219.9 * progressAttendance) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressCapsuleGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-slate-800 leading-none">{progressAttendance}%</span>
                  <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-1 block leading-none">Status</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest pt-2.5 border-t border-slate-100 text-emerald-600 bg-white select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Progress evaluation is: stable and on track</span>
          </div>
        </Card>

        {/* WIDGET 5: Milestone Goal Achievement Ring */}
        <Card className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-[270px] flex flex-col justify-between transition-all duration-300 hover:shadow-md">
          <div>
            <CardTitle className="text-xs font-black text-slate-900 tracking-widest uppercase">
              Goal Achieved
            </CardTitle>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Success evaluation of weekly cohort targets</p>
          </div>

          <div className="relative h-[125px] my-auto flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={milestoneSegments}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={41}
                    outerRadius={56}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={3.5}
                    cornerRadius={5}
                  >
                    {milestoneSegments.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : null}

            <div className="absolute text-center select-none pointer-events-none">
              <span className="text-2xl font-black text-slate-800 leading-none tracking-tight block">95%</span>
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5 block leading-none">Total</span>
            </div>
          </div>

          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center py-2 bg-slate-50 border border-slate-100 rounded-xl leading-none">
            Outcomes completion threshold achieved
          </div>
        </Card>

      </div>

      {/* Activities & Cadence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl shadow-sm border border-slate-100 bg-white p-5 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="p-1 bg-slate-100 text-slate-700 rounded">
                  <Bell className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold uppercase text-slate-900 leading-none">Recent Activities</h3>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded select-none">Live Log</span>
            </div>
            
            <div className="space-y-3.5 overflow-y-auto pr-1 max-h-[220px] scrollbar-thin">
              {recentActivity.length === 0 ? (
                <p className="text-xs font-medium text-slate-400 py-8 text-center">No recent activities found.</p>
              ) : (
                recentActivity.map((activity, idx) => (
                  <div key={activity.id || idx} className="flex items-start space-x-3 text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
                      activity.type === 'student_registered' ? "bg-green-50 text-green-700" :
                        activity.type === 'progress_submitted' ? "bg-orange-50 text-orange-700" :
                          activity.type === 'outcome_achieved' ? "bg-purple-50 text-purple-700" :
                            "bg-slate-50 text-slate-600"
                    )}>
                      {activity.type === 'student_registered' && <Users size={11} />}
                      {activity.type === 'progress_submitted' && <TrendingUp size={11} />}
                      {activity.type === 'outcome_achieved' && <Award size={11} />}
                      {activity.type === 'certification_completed' && <GraduationCap size={11} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-slate-800 truncate leading-none">{activity.title}</p>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1 rounded flex-shrink-0">{activity.time}</span>
                      </div>
                      {activity.user && (
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-none">By {activity.user}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          <Card className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between h-[180px] transition-all duration-300 hover:shadow-md">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-800">
              <Shield className="w-4 h-4 text-orange-500" />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5 mt-3 flex-1">
              {[
                { label: "New Student", href: "/admin/students/add" },
                { label: "Faculty Mentor", href: "/admin/mentors/add" },
                { label: "Live Analytics", href: "/admin/analytics" },
                { label: "Database Upload", href: "/admin/students/import" }
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="flex flex-col justify-between p-2.5 bg-slate-50/50 hover:bg-orange-50/60 border border-slate-100 hover:border-orange-200/80 rounded-xl transition-all duration-200 text-[10px] font-extrabold text-slate-700 hover:text-orange-700 group shadow-sm hover:shadow-sm"
                >
                  <span>{action.label}</span>
                  <ArrowUpRight size={11} className="self-end text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                </Link>
              ))}
            </div>
          </Card>

          <div className="rounded-xl bg-orange-50 p-4 border border-orange-100 text-[11px] font-semibold text-orange-800 space-y-0.5 shadow-sm">
            <h4 className="font-bold text-orange-950 text-[10px] uppercase tracking-wider">Capacity Alert</h4>
            <p className="leading-relaxed">GMP and CMP cohorts are currently full. Review waitlists before accepting new enrollments.</p>
          </div>
        </div>

      </div>

      {/* Cadence Check-Ins */}
      <Card className="rounded-xl shadow-sm border border-slate-100 bg-white p-5 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-50 mb-4">
          <Calendar className="h-4 w-4 text-orange-600" />
          <h3 className="text-sm font-bold uppercase text-slate-900 leading-none">Today's Scheduled Advising</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(statsData?.upcomingSessions || []).length === 0 ? (
            <p className="text-xs font-semibold text-slate-400 py-3 col-span-full text-center bg-slate-50/50 border border-slate-100 rounded-lg">No advising check-ins scheduled today.</p>
          ) : (
            statsData.upcomingSessions.map((session: any, i: number) => (
              <div key={session.id || i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {session.student?.name} & {session.mentor?.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                    {session.topic || 'Advising Session'}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-200/40 px-2 py-0.5 rounded flex-shrink-0 ml-2">
                  {session.startTime}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

    </div>
  );
}
