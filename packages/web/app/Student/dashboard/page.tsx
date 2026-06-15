'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  format,
  subMonths,
  isSameMonth,
  formatDistanceToNow,
  isAfter,
} from 'date-fns';
import {
  Plus,
  History,
  Clock,
  BookOpen,
  Video,
  ChevronRight,
  Flame,
  BarChart2,
  Activity,
  Layers,
  CalendarDays,
  Star,
  TrendingUp,
  FileCheck2,
  Mail,
  Phone,
  User as UserIcon,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { useStudentDashboard } from '@/hooks/api/useStudent';
import LoaderOne from '@/components/ui/loader-one';

// ─── Brand Palette ────────────────────────────────────────────────────────────
// Primary: #FF6B00 (brand orange), Secondary: #003d7a (brand navy)
// Accents: complementary tones derived from primary palette
const BRAND = {
  orange:    '#FF6B00',
  orangeLight:'#FF8C33',
  orangePale: '#FFF0E6',
  orangeMid:  '#FFD4BE',
  navy:      '#003d7a',
  navyLight: '#0a5299',
  navyPale:  '#e8f0f9',
  teal:      '#0891b2',
  tealPale:  '#e0f7fc',
  green:     '#16a34a',
  greenPale: '#dcfce7',
  purple:    '#7c3aed',
  purplePale:'#ede9fe',
  rose:      '#e11d48',
  rosePale:  '#ffeef2',
  amber:     '#d97706',
  amberPale: '#fef3c7',
  gray50:    '#f9fafb',
  gray100:   '#f3f4f6',
  gray200:   '#e5e7eb',
  gray400:   '#9ca3af',
  gray500:   '#6b7280',
  gray700:   '#374151',
  gray900:   '#111827',
};

const TOPIC_COLORS = [
  BRAND.orange, BRAND.navy, BRAND.teal, BRAND.purple, BRAND.green,
];

// ─── Stat Card — compact glassmorphism ────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string;
  paleBg: string;
  index: number;
  href?: string;
  badge?: string;
}

function StatCard({ label, value, icon, accentColor, paleBg, index, href }: StatCardProps) {
  const Inner = (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
      className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer
                 bg-white/70 backdrop-blur-md border-white/80 shadow-[0_2px_16px_rgba(0,0,0,0.06)]
                 hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full"
        style={{ background: accentColor }}
      />

      {/* Icon chip */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{ backgroundColor: paleBg, color: accentColor }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-[0.16em] leading-none mb-1"
           style={{ color: accentColor }}>
          {label}
        </p>
        <p className="text-xl font-black leading-none tracking-tight text-gray-900">
          {value}
        </p>
      </div>

      {href && (
        <ArrowUpRight
          size={13}
          className="opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0"
          style={{ color: accentColor }}
        />
      )}
    </motion.div>
  );

  return href ? <Link href={href}>{Inner}</Link> : Inner;
}

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function CircularRing({
  pct,
  label,
  color,
  size = 72,
}: {
  pct: number;
  label: string;
  color: string;
  size?: number;
}) {
  const R = (size - 10) / 2;
  const circ = 2 * Math.PI * R;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="none"
            stroke={BRAND.gray100}
            strokeWidth={6}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] font-black" style={{ color: BRAND.gray900 }}>
            {pct}%
          </span>
        </div>
      </div>
      <p className="text-[10px] font-bold text-gray-500 text-center leading-tight max-w-[70px] truncate">
        {label}
      </p>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-3 py-2.5 text-xs z-50">
      <p className="font-black text-gray-700 uppercase tracking-wider mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-black text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Donut Center Label ───────────────────────────────────────────────────────
function DonutCenter({ label, value }: { label: string; value: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">
        {label}
      </span>
      <span className="text-2xl font-black text-gray-900 leading-none mt-0.5">{value}</span>
    </div>
  );
}

// ─── Learning Telemetry Node Diagram ─────────────────────────────────────────
function LearningTelemetry({
  entries,
  totalEntries,
  studentName,
}: {
  entries: any[];
  totalEntries: number;
  studentName: string;
}) {
  const [hoveredIdx, setHoveredIdx]   = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const CX = 130, CY = 130, RING_R = 92;
  const nodes = entries.slice(0, 8);

  const getPos = (idx: number, count: number) => {
    const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
    return { x: CX + RING_R * Math.cos(angle), y: CY + RING_R * Math.sin(angle) };
  };

  const initials = studentName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const selectedEntry = selectedIdx !== null ? nodes[selectedIdx] : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center relative">
        <svg viewBox="0 0 260 260" className="w-full" style={{ maxHeight: 240 }}>
          <defs>
            <filter id="tele-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="tele-glow-selected">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="centerGrad2" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor={BRAND.navyLight} />
              <stop offset="100%" stopColor={BRAND.navy} />
            </radialGradient>
            <radialGradient id="orangeGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor={BRAND.orangeLight} />
              <stop offset="100%" stopColor={BRAND.orange} />
            </radialGradient>
          </defs>

          {/* Orbit ring */}
          <circle
            cx={CX} cy={CY} r={RING_R}
            fill="none" stroke={BRAND.gray200} strokeWidth="1.5" strokeDasharray="5 4"
          />

          {/* Spokes */}
          {nodes.map((_, idx) => {
            const pos = getPos(idx, nodes.length);
            const isSelected = selectedIdx === idx;
            return (
              <line
                key={`spoke-${idx}`}
                x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                stroke={isSelected ? BRAND.orange : BRAND.gray200}
                strokeWidth={isSelected ? 1.5 : 1}
                strokeDasharray={isSelected ? undefined : undefined}
                opacity={isSelected ? 1 : 0.7}
              />
            );
          })}

          {/* Center */}
          <circle cx={CX} cy={CY} r={38} fill="url(#centerGrad2)" />
          <text x={CX} y={CY - 5} textAnchor="middle" fontSize="12" fontWeight="900" fill="white" letterSpacing="1.5">
            {initials || 'ME'}
          </text>
          <text x={CX} y={CY + 10} textAnchor="middle" fontSize="7" fontWeight="700" fill={BRAND.orangeLight} letterSpacing="1.5">
            JOURNEY
          </text>

          {/* Nodes */}
          {nodes.map((entry, idx) => {
            const pos = getPos(idx, nodes.length);
            const isNewest   = idx === 0;
            const isHovered  = hoveredIdx === idx;
            const isSelected = selectedIdx === idx;
            const nodeR = isNewest ? 19 : isSelected ? 17 : 15;

            return (
              <g
                key={`node-${idx}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                style={{ cursor: 'pointer' }}
              >
                {/* Selection pulse ring */}
                {isSelected && (
                  <circle
                    cx={pos.x} cy={pos.y} r={nodeR + 6}
                    fill="none"
                    stroke={BRAND.orange}
                    strokeWidth="1.5"
                    opacity="0.35"
                  />
                )}
                <circle
                  cx={pos.x} cy={pos.y} r={nodeR}
                  fill={
                    isSelected ? 'url(#orangeGrad)'
                    : isNewest  ? 'url(#orangeGrad)'
                    : isHovered ? BRAND.orangePale
                    : 'white'
                  }
                  stroke={
                    isSelected ? BRAND.orange
                    : isNewest  ? BRAND.orange
                    : isHovered ? BRAND.orange
                    : BRAND.gray200
                  }
                  strokeWidth={isNewest || isSelected ? 0 : 1.5}
                  filter={isNewest || isSelected ? 'url(#tele-glow)' : undefined}
                />
                <text
                  x={pos.x} y={pos.y + 4}
                  textAnchor="middle"
                  fontSize={isNewest || isSelected ? '10' : '9'}
                  fontWeight="800"
                  fill={isNewest || isSelected ? 'white' : isHovered ? BRAND.orange : BRAND.gray500}
                >
                  {String(idx + 1).padStart(2, '0')}
                </text>
                {/* Hover tooltip (topic preview) */}
                {isHovered && !isSelected && entry.topicsCovered?.[0] && (
                  <g>
                    <rect x={pos.x - 46} y={pos.y - nodeR - 22} width={92} height={18} rx={4} fill={BRAND.navy} opacity={0.92} />
                    <text x={pos.x} y={pos.y - nodeR - 9} textAnchor="middle" fontSize="8" fontWeight="700" fill="white">
                      {entry.topicsCovered[0].slice(0, 16)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Selected Entry Detail Panel ── */}
      {selectedEntry ? (
        <motion.div
          key={selectedIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="mt-2 rounded-xl border border-orange-200 bg-orange-50/60 p-3.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ background: BRAND.orange }}>
                {String((selectedIdx ?? 0) + 1).padStart(2, '0')}
              </div>
              <p className="text-[11px] font-black text-gray-900 uppercase tracking-wider">Entry Detail</p>
            </div>
            <button
              onClick={() => setSelectedIdx(null)}
              className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-orange-200 hover:text-orange-600 transition-all text-[10px] font-black"
            >
              ✕
            </button>
          </div>

          {/* Date */}
          {selectedEntry.date && (
            <p className="text-[10px] text-gray-400 font-semibold mb-2">
              📅 {format(new Date(selectedEntry.date), 'EEE, MMM d yyyy')}
            </p>
          )}

          {/* Hours */}
          {selectedEntry.hoursSpent != null && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: BRAND.orange }} />
              <p className="text-[11px] text-gray-700 font-semibold">
                <span className="font-black text-gray-900">{selectedEntry.hoursSpent}h</span> logged
              </p>
            </div>
          )}

          {/* Topics */}
          {Array.isArray(selectedEntry.topicsCovered) && selectedEntry.topicsCovered.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedEntry.topicsCovered.map((t: string, i: number) => (
                <span
                  key={i}
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: BRAND.navyPale, color: BRAND.navy }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Topic / notes */}
          {(selectedEntry.topic || selectedEntry.notes) && (
            <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
              {selectedEntry.topic || selectedEntry.notes}
            </p>
          )}
        </motion.div>
      ) : (
        /* Footer stat — shown when nothing is selected */
        <div className="flex items-center gap-3 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 mt-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
            <BookOpen size={14} className="text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-gray-900 leading-none">Total Progress Entries</p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-none">Click a node to view details</p>
          </div>
          <p className="text-xl font-black text-gray-900 shrink-0">{totalEntries}</p>
        </div>
      )}
    </div>
  );
}




// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { profile, stats, progressHistory, sessions, documents, isLoading } =
    useStudentDashboard();

  const studentName = profile?.name || profile?.fullName || profile?.firstName
    ? `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim()
    : 'Student';

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const entries = useMemo(() => (Array.isArray(progressHistory) ? progressHistory : (progressHistory?.data || [])), [progressHistory]);

  const totalSubmissions = entries.length;
  const totalDocuments   = Array.isArray(documents) ? documents.length : 0;

  const topicSet = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e: any) => (e.topicsCovered ?? []).forEach((t: string) => s.add(t)));
    return s;
  }, [entries]);

  const daySet = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e: any) => { if (e.date) s.add(e.date.split('T')[0]); });
    return s;
  }, [entries]);

  // ── Stat cards ───────────────────────────────────────────────────────────────
  const statCards = useMemo<StatCardProps[]>(() => {
    const s = stats ?? {};
    return [
      {
        label: 'Total Submissions',
        value: totalSubmissions,
        icon: <FileCheck2 size={17} />,
        accentColor: BRAND.orange,
        paleBg: BRAND.orangePale,
        index: 0,
        badge: 'Live',
        href: '/Student/my-stats',
      },
      {
        label: 'Current Streak',
        value: `${s.currentStreak ?? 0}d`,
        icon: <Flame size={17} />,
        accentColor: BRAND.rose,
        paleBg: BRAND.rosePale,
        index: 1,
      },
      {
        label: 'Total Sessions',
        value: s.totalSessions ?? sessions.length ?? 0,
        icon: <Video size={17} />,
        accentColor: BRAND.navy,
        paleBg: BRAND.navyPale,
        index: 2,
        href: '/Student/my-courses',
      },
      {
        label: 'Avg Performance',
        value: `${s.averagePerformance ?? s.totalProgress ?? 0}%`,
        icon: <TrendingUp size={17} />,
        accentColor: BRAND.green,
        paleBg: BRAND.greenPale,
        index: 3,
        href: '/Student/my-stats',
      },
      {
        label: 'Topics Covered',
        value: topicSet.size,
        icon: <Layers size={17} />,
        accentColor: BRAND.purple,
        paleBg: BRAND.purplePale,
        index: 4,
      },
      {
        label: 'Days Active',
        value: daySet.size,
        icon: <CalendarDays size={17} />,
        accentColor: BRAND.teal,
        paleBg: BRAND.tealPale,
        index: 5,
      },
      {
        label: 'Max Streak',
        value: `${s.maxStreak ?? 0}d`,
        icon: <Star size={17} />,
        accentColor: BRAND.amber,
        paleBg: BRAND.amberPale,
        index: 6,
      },
      {
        label: 'Documents',
        value: totalDocuments,
        icon: <BookOpen size={17} />,
        accentColor: BRAND.teal,
        paleBg: BRAND.tealPale,
        index: 7,
      },
    ];
  }, [stats, sessions, topicSet, daySet, totalSubmissions, totalDocuments]);

  // ── Topic distribution donut ─────────────────────────────────────────────────
  const topicData = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e: any) =>
      (e.topicsCovered ?? []).forEach((t: string) => {
        counts[t] = (counts[t] ?? 0) + 1;
      })
    );
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5);
    const total = sorted.reduce((s, [, v]) => s + v, 0);
    return sorted.map(([name, value], i) => ({
      name,
      value,
      pct: total > 0 ? Math.round((value / total) * 100) : 0,
      color: TOPIC_COLORS[i % TOPIC_COLORS.length],
    }));
  }, [entries]);

  // ── 6-month bar chart data ───────────────────────────────────────────────────
  const trendData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(today, 5 - i));
    return months.map((month) => {
      const mEntries  = entries.filter((e: any) => e.date && isSameMonth(new Date(e.date), month));
      const mSessions = sessions.filter((s: any) => s.date && isSameMonth(new Date(s.date), month));
      return {
        month: format(month, 'MMM'),
        Submissions: mEntries.length,
        Sessions:    mSessions.length,
      };
    });
  }, [entries, sessions]);

  // ── Telemetry entries ────────────────────────────────────────────────────────
  const telemetryEntries = useMemo(() =>
    [...entries]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8),
    [entries]
  );

  // ── Upcoming sessions ────────────────────────────────────────────────────────
  const upcomingSessions = useMemo(
    () =>
      sessions
        .filter((s: any) => isAfter(new Date(s.date), today))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 4),
    [sessions]
  );

  // ── Linked mentors ───────────────────────────────────────────────────────────
  const linkedMentors = useMemo(() => {
    const map = new Map<string, { name: string; topic: string; specialization?: string }>();

    // Primary source: student's assigned mentor from their profile
    const profileMentorName = profile?.mentorName ?? profile?.mentor?.name ?? profile?.mentor;
    if (
      profileMentorName &&
      typeof profileMentorName === 'string' &&
      profileMentorName.trim() &&
      profileMentorName.toLowerCase() !== 'unassigned'
    ) {
      map.set(profileMentorName, {
        name: profileMentorName,
        topic: profile?.trackName ?? profile?.track?.name ?? 'General Mentorship',
        specialization: profile?.mentor?.specialization,
      });
    }

    // Supplement from sessions (may add extra mentors for group programmes)
    sessions.forEach((s: any) => {
      const mName = s.mentorName ?? s.mentor?.name;
      if (mName && !map.has(mName)) {
        map.set(mName, { name: mName, topic: s.topic || 'General Mentorship' });
      }
    });

    return Array.from(map.values()).slice(0, 3);
  }, [profile, sessions]);

  // ── Recent activity feed ─────────────────────────────────────────────────────
  const activityFeed = useMemo(() => {
    const feed: { id: string; label: string; sub: string; color: string; icon: 'progress' | 'session' }[] = [];
    entries.slice(0, 4).forEach((e: any) => {
      feed.push({
        id:    `p-${e.id}`,
        label: e.topicsCovered?.[0] ?? 'Progress logged',
        sub:   formatDistanceToNow(new Date(e.date), { addSuffix: true }),
        color: BRAND.orange,
        icon:  'progress',
      });
    });
    sessions
      .filter((s: any) => (s.status ?? '').toLowerCase() === 'completed')
      .slice(0, 2)
      .forEach((s: any) => {
        feed.push({
          id:    `s-${s.id}`,
          label: s.topic ?? 'Session completed',
          sub:   formatDistanceToNow(new Date(s.date), { addSuffix: true }),
          color: BRAND.green,
          icon:  'session',
        });
      });
    return feed.slice(0, 5);
  }, [entries, sessions]);

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderOne />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 p-5 md:p-6 space-y-6">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl text-white"
        style={{ background: `linear-gradient(135deg, ${BRAND.orange} 0%, #FF4500 60%, ${BRAND.navy} 100%)` }}
      >
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 -translate-y-1/2 translate-x-1/4"
          style={{ background: 'white' }} />
        <div className="absolute bottom-0 right-24 w-40 h-40 rounded-full opacity-10 translate-y-1/3"
          style={{ background: 'white' }} />
        <div className="absolute top-4 right-48 w-24 h-24 rounded-full opacity-5"
          style={{ background: 'white' }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 px-7 py-7">
          {/* Left: Welcome */}
          <div>
            <p className="text-sm font-semibold text-orange-100 mb-1 tracking-wide">{greeting} 👋</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-montserrat mb-2">
              {studentName}!
            </h1>
            <p className="text-sm text-orange-100 max-w-sm leading-relaxed font-medium">
              You've logged{' '}
              <span className="font-black text-white">{totalSubmissions} submissions</span> and attended{' '}
              <span className="font-black text-white">{stats?.totalSessions ?? sessions.length} sessions</span> so far.
              Keep up the great work!
            </p>
            <div className="flex items-center gap-3 mt-5">
              <Link href="/Student/progress/new">
                <Button
                  size="sm"
                  className="h-9 text-xs font-black bg-white text-orange-600 hover:bg-orange-50 shadow-lg uppercase tracking-wider rounded-full px-5"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Log Progress
                </Button>
              </Link>
              <Link href="/Student/my-stats#contribution-graph">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-xs font-black border-white/30 text-white hover:bg-white/10 uppercase tracking-wider rounded-full px-5 bg-transparent"
                >
                  <History className="mr-1.5 h-3.5 w-3.5" />
                  View History
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Key metrics — compact glassmorphism chips */}
          <div className="flex gap-3 flex-wrap md:flex-nowrap shrink-0">
            {[
              { label: 'Submissions',  value: totalSubmissions,                 icon: <FileCheck2 size={14} /> },
              { label: 'Streak',       value: `${stats?.currentStreak ?? 0}d`, icon: <Flame size={14} /> },
              { label: 'Topics',       value: topicSet.size,                    icon: <Layers size={14} /> },
            ].map((m) => (
              <div
                key={m.label}
                className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md border border-white/25
                           rounded-xl px-4 py-2.5 hover:bg-white/20 transition-colors duration-200"
              >
                <div className="text-white/70">{m.icon}</div>
                <div>
                  <p className="text-lg font-black text-white leading-none">{m.value}</p>
                  <p className="text-[9px] font-bold text-orange-100/80 uppercase tracking-wider mt-0.5 leading-none">{m.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards — compact glassmorphism row ───────────────────────────── */}
      <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-orange-50/60 via-white/40 to-blue-50/30 backdrop-blur-md p-3 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </div>

      {/* ── Main 3-Panel Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Panel 1 – Learning Telemetry */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-900">
                Learning Telemetry
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Interactive progress node map</p>
            </div>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND.orangePale }}>
              <Activity size={14} style={{ color: BRAND.orange }} />
            </div>
          </div>

          {telemetryEntries.length > 0 ? (
            <LearningTelemetry
              entries={telemetryEntries}
              totalEntries={totalSubmissions}
              studentName={studentName}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <div className="w-14 h-14 rounded-full bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center mb-3">
                <BookOpen size={20} className="text-gray-300" />
              </div>
              <p className="text-xs font-bold text-gray-400">No progress entries yet</p>
              <p className="text-[10px] text-gray-300 mt-1 mb-4">Log your first entry to activate telemetry</p>
              <Link href="/Student/progress/new">
                <Button size="sm" className="text-xs font-bold h-8 rounded-full px-4" style={{ background: BRAND.orange }}>
                  Log First Entry
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Panel 2 – Topic Distribution Donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-900">
                Topic Split
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Distribution of your study topics</p>
            </div>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND.purplePale }}>
              <Layers size={14} style={{ color: BRAND.purple }} />
            </div>
          </div>

          {topicData.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="relative h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topicData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {topicData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-3 py-2 text-xs">
                            <p className="font-black text-gray-900">{d.name}</p>
                            <p className="text-gray-400">{d.pct}% · {d.value} entries</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <DonutCenter label="Topics" value={topicData.length} />
              </div>

              <div className="mt-3 space-y-2.5">
                {topicData.map((t) => (
                  <div key={t.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                      <span className="text-[11px] font-semibold text-gray-700 truncate">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${t.pct}%`, backgroundColor: t.color }} />
                      </div>
                      <span className="text-[11px] font-black w-7 text-right" style={{ color: t.color }}>{t.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 text-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Study balance is </span>
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: BRAND.orange }}>
                  {topicData.length >= 3 ? 'WELL OPTIMISED' : 'GROWING'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs font-bold text-gray-300 text-center">
                Log entries with topics<br />to see distribution
              </p>
            </div>
          )}
        </div>

        {/* Panel 3 – 6-Month Activity Trends Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-900">
                Activity Trends
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">6-month submissions & sessions</p>
            </div>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: BRAND.navyPale }}>
              <BarChart2 size={14} style={{ color: BRAND.navy }} />
            </div>
          </div>

          <div className="flex-1" style={{ minHeight: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 8, right: 4, left: -28, bottom: 0 }} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BRAND.gray100} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: BRAND.gray400, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: BRAND.gray400, fontWeight: 600 }}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: BRAND.gray50, radius: 4 }} />
                <Bar dataKey="Submissions" fill={BRAND.orange} radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="Sessions"    fill={BRAND.navy}   radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-5 justify-center mt-3 pt-3 border-t border-gray-50">
            {[
              { label: 'SUBMISSIONS', color: BRAND.orange },
              { label: 'SESSIONS',    color: BRAND.navy },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Upcoming Sessions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-900">
                Upcoming Sessions
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Your next scheduled mentoring calls</p>
            </div>
            <Link
              href="/Student/my-courses"
              className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
              style={{ color: BRAND.orange }}
            >
              View all <ChevronRight size={11} />
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                <Clock size={18} className="text-gray-300" />
              </div>
              <p className="text-xs font-bold text-gray-400">No upcoming sessions</p>
              <p className="text-[10px] text-gray-300 mt-0.5">Your mentor will schedule sessions soon</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {upcomingSessions.map((session: any) => (
                <motion.div
                  key={session.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: BRAND.orangePale }}
                  >
                    <Video size={16} style={{ color: BRAND.orange }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {session.topic ?? 'Mentorship Session'}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                      with {session.mentorName ?? 'Your Mentor'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-gray-900">
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p
                      className="text-[10px] font-black uppercase tracking-wider mt-0.5"
                      style={{ color: BRAND.orange }}
                    >
                      {session.startTime}{session.endTime ? ` – ${session.endTime}` : ''}
                    </p>
                    {session.meetingLink && session.meetingLink !== '#' && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[9px] font-black mt-0.5 transition-opacity hover:opacity-70"
                        style={{ color: BRAND.navy }}
                      >
                        <Video size={9} /> Join
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Linked Mentors + Recent Activity */}
        <div className="flex flex-col gap-5">

          {/* Linked Mentors */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-900">
                Linked Mentors
              </p>
              <Link href="/Student/mentor-details">
                <span className="text-[9px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity cursor-pointer" style={{ color: BRAND.navy }}>
                  See all
                </span>
              </Link>
            </div>

            {linkedMentors.length > 0 ? (
              <div className="space-y-3">
                {linkedMentors.map((mentor, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm text-white"
                      style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.navy})` }}
                    >
                      {mentor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{mentor.name}</p>
                      <p className="text-[10px] text-gray-400 font-semibold truncate">{mentor.topic}</p>
                    </div>
                    <div className="flex gap-2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Mail size={13} className="cursor-pointer hover:text-orange-500 transition-colors" />
                      <Phone size={13} className="cursor-pointer hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 border border-dashed border-gray-100 rounded-xl">
                <UserIcon size={18} className="text-gray-200 mx-auto mb-1.5" />
                <p className="text-[11px] font-bold text-gray-300">No linked mentors yet</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1 hover:shadow-md transition-shadow duration-300">
            <div className="mb-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-900">
                Recent Activity
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Your latest learning events</p>
            </div>

            {activityFeed.length === 0 ? (
              <p className="text-xs font-bold text-gray-300 text-center py-5">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {activityFeed.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}80` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-gray-800 leading-snug truncate">{item.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick navigation */}
            <div className="mt-4 pt-3 border-t border-gray-50 space-y-1.5">
              {[
                { href: '/Student/progress/new',  label: 'Log Progress',  color: BRAND.orange },
                { href: '/Student/my-stats',       label: 'View My Stats', color: BRAND.navy },
                { href: '/Student/my-courses',     label: 'My Courses',    color: BRAND.teal },
              ].map(({ href, label, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-transparent text-[11px] font-bold text-gray-600 hover:text-gray-900 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </div>
                  <ChevronRight size={11} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
