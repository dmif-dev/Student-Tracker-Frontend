"use client";

import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    createContext,
} from "react";
import {
    BookOpen,
    Clock,
    Trophy,
    TrendingUp,
    Search,
    PlayCircle,
    FileText,
    Eye,
    Download,
    CheckCircle,
    GraduationCap,
    UserCircle,
    Target,
    BookMarked,
    ChevronRight,
    BarChart3,
    Activity,
    Star,
    Layers,
    Sparkles,
    ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import LoaderOne from "@/components/ui/loader-one";

import {
    useStudentProfile,
    useStudentStats,
    useStudentDocuments,
    useStudentOutcomes,
    useStudentProgressHistory,
} from "@/hooks/api/useStudent";
import { ApiService } from "@/services/api";
import { DocumentService } from "@/services/documentService";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
enum Strength { None = "none", Weak = "weak", Moderate = "moderate", Strong = "strong" }
type StrengthColors = Record<Strength, string[]>;

const getStrength = (s: number, max: number): Strength => {
    const p = s / max;
    if (p >= 0.8) return Strength.Strong;
    if (p >= 0.4) return Strength.Moderate;
    if (p > 0)    return Strength.Weak;
    return Strength.None;
};

const rHash = (n = 4) => {
    const b = crypto.getRandomValues(new Uint8Array(n));
    return [...b].map(x => "abcdef0123456789"[x % 16]).join("");
};

// ─── Animated Ring ────────────────────────────────────────────────────────────
function Ring({ value, max, size = 130, sw = 9, stops, children }: {
    value: number; max: number; size?: number; sw?: number;
    stops: string[]; children?: React.ReactNode;
}) {
    const id  = useRef(`r-${rHash()}`).current;
    const ref = useRef<SVGCircleElement>(null);
    const r   = (size - sw) / 2;
    const c   = 2 * Math.PI * r;
    const off = c - (value / max) * c;

    useEffect(() => {
        ref.current?.animate(
            [{ strokeDashoffset: String(c) }, { strokeDashoffset: String(off) }],
            { duration: 1200, easing: "cubic-bezier(0.65,0,0.35,1)", fill: "forwards" }
        );
    }, [value, c, off]);

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <defs>
                    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
                        {stops.map((col, i) => (
                            <stop key={i} offset={`${(100 / (stops.length - 1)) * i}%`} stopColor={col} />
                        ))}
                    </linearGradient>
                </defs>
                <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={sw} className="stroke-white/30" />
                <circle ref={ref} cx={size/2} cy={size/2} r={r} fill="none"
                    stroke={`url(#${id})`} strokeWidth={sw} strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
        </div>
    );
}

// ─── Stat Card — Glass ─────────────────────────────────────────────────────────
function GlassStat({ icon: Icon, label, value, sub, accent, delay = 0 }: {
    icon: React.ElementType; label: string; value: string; sub?: string;
    accent: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
            className="group relative flex items-center gap-4 p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 overflow-hidden"
        >
            {/* Subtle accent glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${accent} rounded-2xl`} style={{ opacity: 0 }} />
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 ${accent} rounded-2xl`} />

            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent.replace("bg-gradient-to-br", "bg-gradient-to-br")} shadow-sm`}
                style={{ background: "" }}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight leading-none mt-0.5">{value}</p>
                {sub && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{sub}</p>}
            </div>
        </motion.div>
    );
}

// ─── Document Row ─────────────────────────────────────────────────────────────
function DocRow({ doc, idx, onView, onDownload }: {
    doc: any; idx: number;
    onView: (id: string) => void;
    onDownload: (id: string, name: string) => void;
}) {
    const isVideo = doc.fileType?.includes("video");
    const isPdf   = doc.fileType?.includes("pdf");

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.035, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
            className="group flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-white/80 hover:shadow-sm transition-all duration-200 cursor-default border border-transparent hover:border-white/60"
        >
            {/* Icon */}
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                isVideo
                    ? "bg-blue-100/80 text-blue-500 group-hover:bg-blue-200/80"
                    : "bg-orange-100/80 text-orange-500 group-hover:bg-orange-200/80"
            )}>
                {isVideo ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{doc.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                    {doc.type || (isVideo ? "Video Lesson" : "Document")}
                    {doc.createdAt ? ` · ${format(new Date(doc.createdAt), "MMM d, yyyy")}` : ""}
                </p>
            </div>

            {/* Type chip */}
            <span className={cn(
                "hidden sm:block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex-shrink-0",
                isVideo ? "bg-blue-50 text-blue-500"
                : isPdf  ? "bg-orange-50 text-orange-500"
                         : "bg-gray-100 text-gray-500"
            )}>
                {isVideo ? "Video" : isPdf ? "PDF" : "Doc"}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={() => onView(doc.id)} title="View"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50/80 transition-all">
                    <Eye size={13} />
                </button>
                <button onClick={() => onDownload(doc.id, doc.fileName || doc.title || "document")} title="Download"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50/80 transition-all">
                    <Download size={13} />
                </button>
            </div>
        </motion.div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Page
// ═════════════════════════════════════════════════════════════════════════════
export default function MyCoursesPage() {
    const [search,    setSearch]    = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "video" | "docs">("all");
    const [programs,  setPrograms]  = useState<any[]>([]);
    const [loadingPg, setLoadingPg] = useState(true);

    const { data: profile,   isLoading: lProfile } = useStudentProfile();
    const sid = profile?.studentId ?? profile?.id;

    const { data: rawStats,  isLoading: lStats } = useStudentStats(sid);
    const { data: outcomes }                      = useStudentOutcomes(sid);
    const { data: documents, isLoading: lDocs }  = useStudentDocuments();
    const { data: history }                       = useStudentProgressHistory(sid);

    const recentTopics = useMemo(() => {
        const historyData = Array.isArray(history) ? history : (history?.data || []);
        if (!Array.isArray(historyData)) return [];
        const t: { label: string }[] = [];
        for (const e of historyData)
            if (Array.isArray(e.topicsCovered))
                e.topicsCovered.forEach((s: string) => t.push({ label: s }));
        return t.slice(0, 6);
    }, [history]);

    const handleView = async (id: string) => {
        const tid = toast.loading("Opening…");
        try {
            const url = await DocumentService.getFileContent(id);
            toast.dismiss(tid);
            url ? window.open(url, "_blank") : toast.error("Could not open document");
        } catch { toast.dismiss(tid); toast.error("Error"); }
    };

    const handleDownload = async (id: string, name: string) => {
        const tid = toast.loading("Downloading…");
        try {
            const url = await DocumentService.getFileContent(id);
            toast.dismiss(tid);
            if (url) { const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
            else toast.error("Could not download");
        } catch { toast.dismiss(tid); toast.error("Error"); }
    };

    useEffect(() => {
        ApiService.getPrograms().then(setPrograms).catch(console.error).finally(() => setLoadingPg(false));
    }, []);

    const enrolled = useMemo(() => {
        if (!profile?.programName || !programs.length) return null;
        return programs.find(p =>
            p.name.toLowerCase() === profile.programName.toLowerCase() ||
            p.id.toLowerCase()   === profile.programName.toLowerCase()
        ) || programs[0];
    }, [profile, programs]);

    const progress      = profile?.stats?.brainScore || rawStats?.progress || 0;
    const totalSessions = rawStats?.totalSessions ?? 0;
    const avgRating     = rawStats?.performance?._avg?.performanceRating ?? 0;
    const achievements  = outcomes?.total ?? 0;

    const docCount   = documents?.filter(d => !d.fileType?.includes("video")).length ?? 0;
    const videoCount = documents?.filter(d =>  d.fileType?.includes("video")).length ?? 0;

    const filtered = useMemo(() => {
        if (!documents) return [];
        let list = documents.filter(d =>
            d.title?.toLowerCase().includes(search.toLowerCase()) ||
            d.description?.toLowerCase().includes(search.toLowerCase())
        );
        if (activeTab === "video") list = list.filter(d =>  d.fileType?.includes("video"));
        if (activeTab === "docs")  list = list.filter(d => !d.fileType?.includes("video"));
        return list;
    }, [documents, search, activeTab]);

    const sColors: StrengthColors = {
        none:     ["#e5e7eb","#d1d5db"],
        weak:     ["#fca5a5","#ef4444"],
        moderate: ["#fcd34d","#f59e0b"],
        strong:   ["#6ee7b7","#10b981"],
    };
    const strength = getStrength(progress, 100);

    if (lProfile || loadingPg || lStats || lDocs) {
        return <div className="min-h-screen flex items-center justify-center"><LoaderOne /></div>;
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fafafa 0%, #fff7ed 50%, #f0f9ff 100%)" }}>

            {/* ── Ambient blobs ── */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-orange-200/30 blur-[100px]" />
                <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] rounded-full bg-blue-200/20 blur-[100px]" />
                <div className="absolute -bottom-32 right-1/3 w-[350px] h-[350px] rounded-full bg-amber-200/20 blur-[80px]" />
            </div>

            <div className="w-full px-6 py-8 space-y-7">

                {/* ════ HEADER ════ */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="flex items-end justify-between gap-4"
                >
                    <div>
                        <div className="inline-flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.2em]">Curriculum</span>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Courses</h1>
                        <p className="text-sm text-gray-500 mt-1">Track progress and access all your learning materials.</p>
                    </div>
                    {/* Active badge */}
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/60 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-gray-700">Enrolled &amp; Active</span>
                    </div>
                </motion.div>

                {/* ════ STATS STRIP ════ */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                        { icon: BookOpen,  label: "Active Courses", value: enrolled ? "1" : "0",               sub: enrolled?.name || "—",                        accent: "bg-gradient-to-br from-orange-500 to-amber-500", delay: 0 },
                        { icon: Clock,     label: "Learning Hours",  value: `${Math.round(totalSessions*1.5)}h`, sub: `${totalSessions} sessions completed`,         accent: "bg-gradient-to-br from-blue-500 to-indigo-500",  delay: 0.07 },
                        { icon: TrendingUp,label: "Performance",     value: avgRating ? avgRating.toFixed(1):"—",sub: "average session rating",                      accent: "bg-gradient-to-br from-emerald-500 to-teal-500", delay: 0.14 },
                        { icon: Trophy,    label: "Achievements",    value: String(achievements),               sub: "milestones earned",                           accent: "bg-gradient-to-br from-amber-500 to-yellow-500", delay: 0.21 },
                    ].map(s => (
                        <GlassStat key={s.label} icon={s.icon} label={s.label} value={s.value} sub={s.sub} accent={s.accent} delay={s.delay} />
                    ))}
                </div>

                {/* ════ MAIN GRID ════ */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                    {/* ── LEFT COLUMN ── */}
                    <div className="xl:col-span-3 flex flex-col gap-5">

                        {/* Program Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                            className="relative rounded-2xl bg-white/55 backdrop-blur-xl border border-white/70 shadow-lg overflow-hidden"
                        >
                            {/* Top accent line */}
                            <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300" />

                            <div className="p-5 space-y-4">
                                {/* Program label */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">
                                            <GraduationCap className="w-2.5 h-2.5" />
                                            {enrolled?.id?.toUpperCase() || profile?.programName || "Program"}
                                        </span>
                                        {profile?.trackName && (
                                            <span className="block text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{profile.trackName}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-600">Active</span>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-base font-black text-gray-900 leading-tight">{enrolled?.name || "Innovation Track"}</h2>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{enrolled?.description || "Curated learning modules to elevate your capabilities."}</p>
                                </div>

                                {/* Ring */}
                                <div className="flex items-center justify-center py-2">
                                    <Ring value={progress} max={100} size={120} sw={8} stops={sColors[strength]}>
                                        <span className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{Math.round(progress)}</span>
                                        <span className="text-[10px] text-gray-400 font-semibold">% done</span>
                                    </Ring>
                                </div>

                                {/* Strength pill */}
                                <div className="flex justify-center">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full",
                                        strength === Strength.Strong   && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                                        strength === Strength.Moderate && "bg-amber-50   text-amber-700   border border-amber-200",
                                        strength === Strength.Weak     && "bg-red-50     text-red-600     border border-red-200",
                                        strength === Strength.None     && "bg-gray-100   text-gray-500    border border-gray-200",
                                    )}>
                                        {strength === Strength.Strong   ? "🔥 Strong Performer"
                                         : strength === Strength.Moderate ? "⚡ On Track"
                                         : strength === Strength.Weak     ? "🎯 Keep Going"
                                         : "Not Started"}
                                    </span>
                                </div>

                                <div className="h-px bg-gray-100" />

                                {/* Mentor */}
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                                        <UserCircle className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest">Assigned Mentor</p>
                                        <p className="text-xs font-bold text-gray-800">{profile?.mentor || "Self-Paced"}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Topics */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
                            className="flex-1 rounded-2xl bg-white/55 backdrop-blur-xl border border-white/70 shadow-lg p-5"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center">
                                    <BookMarked className="w-3 h-3 text-white" />
                                </div>
                                <h3 className="text-sm font-black text-gray-900">Recent Topics</h3>
                                <span className="ml-auto text-[10px] text-gray-400 font-semibold">{recentTopics.length}</span>
                            </div>

                            {recentTopics.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                                    <Target className="w-7 h-7 text-gray-200" />
                                    <p className="text-xs text-gray-400">No topics covered yet</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {recentTopics.map((t, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.35 + i * 0.05 }}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/80 transition-all duration-200 group cursor-default border border-transparent hover:border-white/60"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                            <span className="text-xs font-medium text-gray-700 truncate flex-1">{t.label}</span>
                                            <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* ── RIGHT COLUMN (Materials) ── */}
                    <div className="xl:col-span-9 flex flex-col gap-5">

                        {/* Search + tabs */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22, duration: 0.4 }}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search materials…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-sm text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-300/80 focus:ring-2 focus:ring-orange-100/80 transition-all duration-200"
                                />
                            </div>

                            {/* Tab pills */}
                            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-sm h-11 self-start">
                                {([
                                    { key: "all",   label: "All",   count: documents?.length ?? 0 },
                                    { key: "video", label: "Video", count: videoCount },
                                    { key: "docs",  label: "Docs",  count: docCount },
                                ] as const).map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={cn(
                                            "h-9 px-4 rounded-lg text-xs font-bold transition-all duration-200",
                                            activeTab === tab.key
                                                ? "bg-gray-900 text-white shadow-sm"
                                                : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                                        )}
                                    >
                                        {tab.label}
                                        {tab.count > 0 && (
                                            <span className={cn("ml-1 text-[10px]", activeTab === tab.key ? "text-gray-400" : "text-gray-400")}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Materials Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.28, duration: 0.45 }}
                            className="flex-1 rounded-2xl bg-white/55 backdrop-blur-xl border border-white/70 shadow-lg overflow-hidden"
                        >
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/60 bg-white/40">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm font-black text-gray-800">Course Materials</span>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">{filtered.length} {filtered.length === 1 ? "item" : "items"}</span>
                            </div>

                            {/* Content */}
                            <div className="p-3">
                                <AnimatePresence mode="wait">
                                    {filtered.length === 0 ? (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center justify-center py-20 text-center gap-3"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white/80 border border-gray-100 flex items-center justify-center shadow-sm">
                                                <FileText className="w-5 h-5 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-500">
                                                    {search ? `No results for "${search}"` : "No materials available"}
                                                </p>
                                                {search && (
                                                    <button onClick={() => setSearch("")}
                                                        className="mt-2 text-xs text-orange-500 font-semibold hover:underline">
                                                        Clear search
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="list"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            {/* Column headings */}
                                            <div className="flex items-center gap-3.5 px-4 py-2 mb-1">
                                                <div className="w-8 shrink-0" />
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex-1">Name</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block w-16 text-right">Type</p>
                                                <div className="w-16 shrink-0" />
                                            </div>

                                            <div className="space-y-0.5">
                                                {filtered.map((doc, i) => (
                                                    <DocRow key={doc.id} doc={doc} idx={i} onView={handleView} onDownload={handleDownload} />
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Performance Card */}
                        {rawStats && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.38, duration: 0.45 }}
                                className="rounded-2xl bg-white/55 backdrop-blur-xl border border-white/70 shadow-lg overflow-hidden"
                            >
                                {/* Dark header */}
                                <div className="flex items-center gap-3 px-5 py-4 bg-gray-900/90 backdrop-blur-sm">
                                    <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                                        <BarChart3 className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-white">Performance Overview</p>
                                        <p className="text-[11px] text-gray-400">Based on your session data</p>
                                    </div>
                                </div>

                                {/* 3-col stats */}
                                <div className="grid grid-cols-3 divide-x divide-white/30">
                                    {[
                                        { label: "Total Sessions", value: rawStats?.totalSessions ?? 0,   icon: Activity, suffix: "",   color: "text-blue-500" },
                                        { label: "Entries Logged", value: rawStats?.totalEntries ?? 0,    icon: BookOpen, suffix: "",   color: "text-indigo-500" },
                                        { label: "Avg Rating",     value: rawStats?.performance?._avg?.performanceRating?.toFixed(1) ?? "0.0", icon: Star, suffix: "/5", color: "text-amber-500" },
                                    ].map(item => (
                                        <div key={item.label} className="flex flex-col items-center justify-center py-5 gap-1 hover:bg-white/20 transition-colors duration-200">
                                            <item.icon className={`w-4 h-4 ${item.color} mb-1`} />
                                            <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                                                {item.value}
                                                <span className="text-sm font-medium text-gray-400">{item.suffix}</span>
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
