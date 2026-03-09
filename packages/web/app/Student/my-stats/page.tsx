"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    CartesianGrid
} from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Award,
    Brain,
    Lightbulb,
    Target,
    TrendingUp,
    CheckCircle2,
    FileText,
    Zap,
    ArrowUpRight,
    Flame,
    Sparkles,
    Clock,
    Zap as ZapIcon,
    History,
    Calendar,
    BarChart3,
    X,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ContributionGraph() {
    type EntryType = "progress" | "patent" | "research" | "product" | "venture";
    type ViewMode = "week" | "month" | "year";

    const [viewMode, setViewMode] = useState<ViewMode>("year");
    const [currentDate, setCurrentDate] = useState(new Date());

    // Generate mock data for the last 365 days with types
    const streakData = useMemo(() => {
        const types: EntryType[] = ["progress", "patent", "research", "product", "venture"];
        const data = [];
        const baseDate = new Date();

        for (let i = 0; i < 365; i++) {
            const date = subDays(baseDate, i);
            let count = 0;
            const rand = Math.random();
            if (rand > 0.7) count = Math.floor(Math.random() * 5) + 1;

            data.push({
                date,
                count,
                type: types[Math.floor(Math.random() * types.length)]
            });
        }
        return data.reverse();
    }, []);

    const stats = useMemo(() => {
        const total = streakData.reduce((acc, day) => acc + day.count, 0);
        const activeDays = streakData.filter(d => d.count > 0).length;

        const typeStats = {
            progress: streakData.filter(d => d.count > 0 && d.type === "progress").length,
            patent: streakData.filter(d => d.count > 0 && d.type === "patent").length,
            research: streakData.filter(d => d.count > 0 && d.type === "research").length,
            product: streakData.filter(d => d.count > 0 && d.type === "product").length,
            venture: streakData.filter(d => d.count > 0 && d.type === "venture").length,
        };

        return { total, activeDays, currentStreak: 12, maxStreak: 34, typeStats };
    }, [streakData]);

    const getIntensityColor = (count: number) => {
        if (count === 0) return "bg-[#161b22] border-zinc-800/10";
        if (count === 1) return "bg-[#0e4429] border-green-900/20";
        if (count === 2) return "bg-[#006d32] border-green-800/30";
        if (count === 3) return "bg-[#26a641] border-green-600/50";
        return "bg-[#39d353] border-green-400";
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            progress: "Progress Log",
            patent: "Patent Filed",
            research: "Paper Published",
            product: "Product Deployed",
            venture: "Venture Started",
        };
        return labels[type] || "Progress";
    };

    const getFilteredData = () => {
        if (viewMode === "year") {
            // Last 52 weeks
            return Array.from({ length: 52 }).map((_, weekIndex) => {
                return streakData.slice(weekIndex * 7, (weekIndex + 1) * 7);
            });
        } else if (viewMode === "month") {
            // Last 4 weeks (representative of a month view)
            return Array.from({ length: 4 }).map((_, weekIndex) => {
                return streakData.slice(365 - 28 + (weekIndex * 7), 365 - 28 + ((weekIndex + 1) * 7));
            });
        } else {
            // Current week (last 7 days)
            return [streakData.slice(365 - 7)];
        }
    };

    const filteredWeeks = getFilteredData();
    const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

    return (
        <div className="space-y-6">
            {/* Top Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Submissions", value: stats.total, icon: Calendar, color: "text-orange-500", sub: "Lifetime" },
                    { label: "Current Streak", value: `${stats.currentStreak} Days`, icon: Flame, color: "text-orange-600", sub: "🔥 Performance" },
                    { label: "Max Streak", value: `${stats.maxStreak} Days`, icon: Award, color: "text-orange-500", sub: "Personal Best" },
                    { label: "Active Days", value: stats.activeDays, icon: Zap, color: "text-orange-400", sub: "Engagement" },
                ].map((s, i) => (
                    <Card key={i} className="rounded-2xl border-none shadow-sm bg-gray-50/50 hover:bg-white transition-all hover:shadow-md group">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                                <p className="text-[10px] font-bold text-gray-500">{s.sub}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-orange-50 group-hover:bg-orange-100 transition-colors">
                                <s.icon className={cn("h-6 w-6", s.color)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Heatmap Card */}
            <Card className="rounded-3xl border-none shadow-2xl bg-[#0d1117] text-white overflow-hidden p-8 border border-zinc-800/50 transition-all hover:shadow-green-500/10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white leading-none">{stats.total}</span>
                            <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">submissions in the past year</span>
                        </div>
                        <div className="h-6 w-6 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 font-black">i</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8">
                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex gap-2 text-zinc-500">
                                Total active days: <span className="text-white">{stats.activeDays}</span>
                            </div>
                            <div className="flex gap-2 text-zinc-500">
                                Max streak: <span className="text-white">{stats.maxStreak}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800">
                            {(["week", "month", "year"] as ViewMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={cn(
                                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        viewMode === m
                                            ? "bg-green-600 text-white shadow-lg shadow-green-950/50"
                                            : "text-zinc-500 hover:text-white"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white h-9 px-4 text-[10px] font-black gap-2 rounded-xl uppercase tracking-widest">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white h-9 px-4 text-[10px] font-black gap-2 rounded-xl uppercase tracking-widest">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4 scrollbar-hide">
                    <div className={cn(
                        "flex gap-1.5 min-w-max",
                        viewMode === "week" && "justify-center py-10",
                        viewMode === "month" && "justify-center py-6"
                    )}>
                        {filteredWeeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1.5">
                                {week.map((day, dayIndex) => {
                                    const count = day.count;
                                    const color = getIntensityColor(count);
                                    const size = viewMode === "year" ? "w-[14px] h-[14px]" : viewMode === "month" ? "w-6 h-6" : "w-12 h-12";

                                    return (
                                        <Popover key={dayIndex}>
                                            <PopoverTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "rounded-[4px] cursor-pointer transition-all hover:scale-125 hover:z-20 shadow-sm border",
                                                        size,
                                                        color
                                                    )}
                                                />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-4 bg-[#0d1117] border-zinc-800 text-white shadow-2xl rounded-2xl" side="top">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between gap-6">
                                                        <span className="text-[10px] font-black uppercase text-zinc-500 px-2 py-0.5 bg-zinc-900 rounded-full border border-zinc-800">Entry Details</span>
                                                        <span className="text-[10px] font-bold text-green-500">{format(day.date, "MMM dd")}</span>
                                                    </div>
                                                    <div className="font-black text-lg">{count} submissions</div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                        {getTypeLabel(day.type)}
                                                    </div>
                                                    <div className="opacity-40 font-bold text-[9px] uppercase tracking-tighter">{format(day.date, "EEEE, yyyy")}</div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {viewMode === "year" && (
                        <div className="flex justify-between mt-6 text-[10px] text-zinc-500 font-black px-1 tracking-widest uppercase opacity-50">
                            {months.map(m => <span key={m}>{m}</span>)}
                        </div>
                    )}
                </div>

                {/* Footer Breakdown */}
                <div className="mt-10 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Intensity Legend</span>
                            <div className="flex gap-2">
                                {[0, 1, 2, 3, 4].map(lvl => (
                                    <div key={lvl} className={cn("w-3.5 h-3.5 rounded-[3px]", getIntensityColor(lvl))} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 lg:gap-12 backdrop-blur-sm bg-zinc-900/30 p-4 rounded-3xl border border-zinc-800/50">
                        {[
                            { label: "Progress Logs", val: stats.typeStats.progress, color: "text-white", icon: FileText },
                            { label: "Patents Filed", val: stats.typeStats.patent, color: "text-emerald-500", icon: Award },
                            { label: "Research Papers", val: stats.typeStats.research, color: "text-green-400", icon: History },
                            { label: "Products", val: stats.typeStats.product, color: "text-teal-500", icon: Zap },
                            { label: "Ventures", val: stats.typeStats.venture, color: "text-emerald-300", icon: Target },
                        ].map((t, idx) => (
                            <div key={idx} className="flex items-center gap-3 group cursor-default">
                                <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors">
                                    <t.icon className={cn("h-3.5 w-3.5", t.color)} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">{t.label}</p>
                                    <p className={cn("text-sm font-black", t.color)}>{t.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
}

function ResponseStreak() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const status = [true, true, true, true, false, true, true]; // Mock data for current week

    return (
        <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center relative">
                        <Flame className="h-8 w-8 text-orange-600 fill-orange-600 animate-pulse" />
                        <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">HOT</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">12 Day Streak</h3>
                        <p className="text-sm text-gray-500 font-bold">You've responded to feedback 12 days in a row!</p>
                    </div>
                </div>
                <div className="flex gap-8">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Best Streak</p>
                        <p className="text-xl font-black text-gray-900">42 Days</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Responses</p>
                        <p className="text-xl font-black text-gray-900">156</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-3 md:gap-4">
                {days.map((day, i) => (
                    <div key={day} className="flex flex-col items-center gap-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day}</span>
                        <div className={cn(
                            "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                            status[i]
                                ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white scale-105 shadow-orange-200"
                                : "bg-gray-100 text-gray-300 border border-gray-200"
                        )}>
                            {status[i] ? <CheckCircle2 className="h-6 w-6" /> : <X className="h-5 w-5" />}
                        </div>
                        {i === 6 && (
                            <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">TODAY</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-orange-400" />
                        <p className="text-xs font-bold text-gray-600">Keep it up! Your response time improved by <span className="text-green-600">14%</span> this week.</p>
                    </div>
                    <Button variant="link" className="text-xs font-black text-orange-600 p-0 h-auto">View Detailed History</Button>
                </div>
            </div>
        </Card>
    );
}

export default function ReportsPage() {
    const [hoveredStat, setHoveredStat] = useState<string | null>(null);

    // DMIF Outcome Tracking Data
    const outcomeData = useMemo(() => [
        { month: "Jan", patents: 0, research: 0, products: 1, ventures: 0, total: 1 },
        { month: "Feb", patents: 1, research: 1, products: 1, ventures: 0, total: 3 },
        { month: "Mar", patents: 2, research: 2, products: 2, ventures: 1, total: 7 },
        { month: "Apr", patents: 2, research: 3, products: 3, ventures: 1, total: 9 },
        { month: "May", patents: 3, research: 4, products: 3, ventures: 2, total: 12 },
        { month: "Jun", patents: 4, research: 5, products: 4, ventures: 2, total: 15 },
    ], []);

    // Brain Development Metrics
    const brainDevelopmentData = useMemo(() => [
        { week: "W1", creative: 45, analytical: 50, clarity: 40 },
        { week: "W2", creative: 52, analytical: 55, clarity: 48 },
        { week: "W3", creative: 58, analytical: 62, clarity: 55 },
        { week: "W4", creative: 65, analytical: 68, clarity: 62 },
        { week: "W5", creative: 72, analytical: 75, clarity: 70 },
        { week: "W6", creative: 78, analytical: 82, clarity: 78 },
    ], []);

    // Real Outcomes Achieved
    const realOutcomes = useMemo(() => [
        {
            id: 1,
            type: "Patent",
            title: "AI-Assisted Code Generation",
            status: "Filed (India & US)",
            date: "May 2024",
            mentor: "Dr. Madhan",
            progress: 100,
            description: "Provisional patents filed in both India and US. Ready for full patent application.",
            impact: "2 jurisdictions",
            icon: Award,
            color: "from-[#6366f1] to-[#a855f7]",
            lightColor: "bg-indigo-50/50",
            glowColor: "shadow-indigo-500/20"
        },
        {
            id: 2,
            type: "Research Paper",
            title: "Thinking Frameworks in Innovation",
            status: "Published (IEEE)",
            date: "Apr 2024",
            mentor: "Dr. Padma",
            progress: 100,
            description: "Published in IEEE Xplore. 2 citations received. Presented at symposium.",
            impact: "2 citations",
            icon: FileText,
            color: "from-[#10b981] to-[#3b82f6]",
            lightColor: "bg-emerald-50/50",
            glowColor: "shadow-emerald-500/20"
        },
        {
            id: 3,
            type: "Product",
            title: "Learning Tracker Dashboard",
            status: "Deployed",
            date: "Jun 2024",
            mentor: "Prof. Rajesh",
            progress: 100,
            description: "Full-stack application deployed to production. 500+ users on platform.",
            impact: "500+ users",
            icon: Lightbulb,
            color: "from-[#f59e0b] to-[#ef4444]",
            lightColor: "bg-amber-50/50",
            glowColor: "shadow-amber-500/20"
        },
        {
            id: 4,
            type: "Venture",
            title: "EdTech Startup MVP",
            status: "In Development",
            date: "Ongoing",
            mentor: "Dr. Ananya",
            progress: 65,
            description: "Business plan completed, MVP development phase 2. Mentorship on funding strategy.",
            impact: "Phase 2",
            icon: Target,
            color: "from-[#ec4899] to-[#8b5cf6]",
            lightColor: "bg-rose-50/50",
            glowColor: "shadow-rose-500/20"
        },
        {
            id: 5,
            type: "Brain Dev",
            title: "Creative Problem Solving",
            status: "In Progress",
            date: "Ongoing",
            mentor: "Dr. Madhan",
            progress: 78,
            description: "Significant improvement in thinking flexibility and innovative ideation.",
            impact: "+33 pts",
            icon: Brain,
            color: "from-[#0ea5e9] to-[#2dd4bf]",
            lightColor: "bg-blue-50/50",
            glowColor: "shadow-blue-500/20"
        },
    ], []);


    const outcomeTypeDistribution = [
        { name: "Patents", value: 4, color: "#f97316" },
        { name: "Papers", value: 5, color: "#ea580c" },
        { name: "Products", value: 4, color: "#ff9f1c" },
        { name: "Ventures", value: 2, color: "#fb8500" },
        { name: "Brain Dev", value: 1, color: "#ffa500" },
    ];

    const COLORS = ["#f97316", "#ea580c", "#ff9f1c", "#fb8500", "#ffa500"];

    const stats = [
        { id: "patents", label: "Patents Filed", value: "4", subtext: "India & US", icon: Award, color: "from-orange-500 to-orange-600" },
        { id: "papers", label: "Research Papers", value: "5", subtext: "Published", icon: FileText, color: "from-orange-600 to-orange-700" },
        { id: "products", label: "Products", value: "4", subtext: "Deployed", icon: Lightbulb, color: "from-orange-500 to-orange-600" },
        { id: "ventures", label: "Ventures", value: "2", subtext: "In Dev", icon: Target, color: "from-orange-600 to-orange-500" },
        { id: "brain", label: "Brain Score", value: "78%", subtext: "+33 points", icon: Brain, color: "from-orange-500 to-red-500" },
    ];

    const performanceStats = [
        { id: "streak", label: "Daily Streak", value: "12 Days", subtext: "🔥 3 to Personal Best", icon: Flame, color: "from-orange-500 to-red-600" },
        { id: "duration", label: "Time Duration", value: "4.5 hrs", subtext: "⏱️ Today's Session", icon: Clock, color: "from-blue-500 to-indigo-600" },
        { id: "completion", label: "Curriculum Prog", value: "82%", subtext: "✅ Module 4/5", icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
        { id: "status", label: "Daily Status", value: "Active", subtext: "🚀 Goal: On Track", icon: ZapIcon, color: "from-purple-500 to-pink-600" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
            } as const,
        },
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Premium Header Section */}
            <div className="relative overflow-hidden border-b border-gray-200/50 bg-gradient-to-br from-white via-orange-50/30 to-white">
                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-20">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-orange-500" />
                            <span className="text-sm font-bold text-orange-600 uppercase tracking-wider">Your Innovation Impact</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                            Innovation
                            <br />
                            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-clip-text text-transparent">
                                Journey Report
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl font-medium leading-relaxed">
                            Track your real-world creations, brain empowerment progress, and the impact of guided mentorship on your innovation path.
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-12 space-y-12">
                {/* Premium Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.map((stat) => {
                        const IconComponent = stat.icon;
                        const isHovered = hoveredStat === stat.id;
                        return (
                            <div
                                key={stat.id}
                                onMouseEnter={() => setHoveredStat(stat.id)}
                                onMouseLeave={() => setHoveredStat(null)}
                                className="group relative overflow-hidden rounded-2xl p-6 bg-white border border-gray-200/50 transition-all duration-300 cursor-pointer hover:border-orange-300 hover:shadow-2xl"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                <div className="relative space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                            <div className="flex items-baseline gap-2 mt-2">
                                                <h3 className={`text-4xl font-black transition-all duration-300 ${isHovered ? "text-orange-600 scale-110" : "text-gray-900"}`}>{stat.value}</h3>
                                                {stat.value !== "78%" && <ArrowUpRight className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                            </div>
                                            <p className="text-xs text-gray-600 font-medium mt-1">{stat.subtext}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    {stat.id === "brain" && <div className="pt-2"><Progress value={78} className="h-1.5" /></div>}
                                </div>
                                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.color} w-0 group-hover:w-full transition-all duration-300`}></div>
                            </div>
                        );
                    })}
                </div>

                {/* Daily Submission Streak (Contribution Graph) */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <History className="h-5 w-5 text-orange-500" />
                        <h2 className="text-xl font-bold font-montserrat text-gray-900 uppercase tracking-tight">Submission Streak</h2>
                    </div>
                    <ContributionGraph />
                </div>

                {/* Response Streak Section */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 px-2">
                        <ZapIcon className="h-5 w-5 text-orange-500" />
                        <h2 className="text-xl font-bold font-montserrat text-gray-900 uppercase tracking-tight">Response Consistency</h2>
                    </div>
                    <ResponseStreak />
                </div>

                {/* Performance & Active Metrics Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        <h2 className="text-xl font-bold font-montserrat text-gray-900 uppercase tracking-tight">Active Performance</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {performanceStats.map((pStat) => {
                            const PIcon = pStat.icon;
                            return (
                                <div key={pStat.id} className="group relative">
                                    <div className={`absolute -inset-0.5 bg-gradient-to-br ${pStat.color} opacity-20 blur-sm rounded-3xl group-hover:opacity-40 transition-opacity duration-500`}></div>
                                    <Card className="relative h-full border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden rounded-3xl transition-transform duration-500 hover:-translate-y-2">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${pStat.color} text-white shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                                    <PIcon className="h-6 w-6" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{pStat.label}</p>
                                                    <p className="text-2xl font-black text-gray-900 font-montserrat tracking-tight leading-none">{pStat.value}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-gray-500">{pStat.subtext}</span>
                                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${pStat.color} shadow-sm transition-all duration-1000 ease-out group-hover:w-full`}
                                                        style={{ width: "75%" }}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Charts Section - Premium Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart - Spans 2 columns */}
                    <div className="lg:col-span-2 rounded-3xl border border-gray-200/50 bg-white p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 group overflow-hidden">
                        {/* Top accent */}
                        <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Real Outcomes Growth</h3>
                                        <p className="text-sm text-gray-600">Patents, papers, products, and ventures created over 6 months.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[300px] -mx-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={outcomeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPatents" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#999" />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#999" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "12px",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#f97316"
                                            fill="url(#colorPatents)"
                                            strokeWidth={3}
                                            dot={{ fill: "#f97316", r: 5 }}
                                            activeDot={{ r: 7 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Brain Development - Compact */}
                    <div className="rounded-3xl border border-gray-200/50 bg-white p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 group overflow-hidden">
                        {/* Top accent */}
                        <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2.5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl">
                                        <Brain className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Brain 2.0</h3>
                                        <p className="text-xs text-gray-600">Thinking development</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[300px] -mx-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={brainDevelopmentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="week" fontSize={11} tickLine={false} axisLine={false} stroke="#999" />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#999" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "12px",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="creative"
                                            stroke="#f97316"
                                            strokeWidth={2.5}
                                            dot={{ fill: "#f97316", r: 4 }}
                                            name="Creative"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="analytical"
                                            stroke="#ea580c"
                                            strokeWidth={2.5}
                                            dot={{ fill: "#ea580c", r: 4 }}
                                            name="Analytical"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
