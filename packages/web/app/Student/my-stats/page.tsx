"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, subDays, subMonths } from "date-fns";
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
import { useStudentProfile, useStudentStats, useStudentTrends, useStudentOutcomes, useStudentProgressHistory } from "@/hooks/api/useStudent";

function ContributionGraph({ studentId }: { studentId?: string }) {
    type EntryType = "progress" | "patent" | "research" | "product" | "venture";
    type ViewMode = "week" | "month" | "year";

    const [viewMode, setViewMode] = useState<ViewMode>("year");
    const [pageOffset, setPageOffset] = useState(0);
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data: rawStats } = useStudentStats(studentId);

    const { data: progressHistory } = useStudentProgressHistory(studentId);

    const baseDate = useMemo(() => subDays(new Date(), pageOffset), [pageOffset]);

    // Generate data dynamically based on the available history
    const streakData = useMemo(() => {
        const data = [];
        
        // Create a map of dates to progress counts
        const progressMap = new Map();
        
        if (progressHistory?.data && progressHistory.data.length > 0) {
            progressHistory.data.forEach((p: any) => {
                const dateKey = new Date(p.date).toISOString().split('T')[0];
                progressMap.set(dateKey, (progressMap.get(dateKey) || 0) + 1);
            });
        }
        
        // Force exactly 52 weeks (364 days) for a complete UI grid and accurate filter slices
        const renderDays = 364;

        for (let i = 0; i < renderDays; i++) {
            const date = subDays(baseDate, i);
            const dateKey = date.toISOString().split('T')[0];
            const count = progressMap.get(dateKey) || 0;

            data.push({
                date,
                count,
                type: count > 0 ? "progress" : "none"
            });
        }
        return data.reverse();
    }, [progressHistory, baseDate]);

    const stats = useMemo(() => {
        let maxStreak = 0;
        let runningStreak = 0;
        let total = 0;
        let activeDays = 0;

        streakData.forEach((day) => {
            total += day.count;
            if (day.count > 0) {
                activeDays++;
                runningStreak++;
                if (runningStreak > maxStreak) {
                    maxStreak = runningStreak;
                }
            } else {
                runningStreak = 0;
            }
        });

        // Calculate current streak by walking backwards from today
        let currentStreak = 0;
        for (let i = streakData.length - 1; i >= 0; i--) {
            const day = streakData[i];
            if (day.count > 0) {
                currentStreak++;
            } else if (i === streakData.length - 1) {
                // If today is 0, we check yesterday (don't break streak if they just haven't logged yet today)
                continue;
            } else {
                break; // Break on first non-active day before today
            }
        }

        return { 
            total, 
            activeDays, 
            currentStreak, 
            maxStreak 
        };
    }, [streakData]);

    const getIntensityColor = (count: number) => {
        if (count === 0) return "bg-gray-50 border-gray-100";
        if (count === 1) return "bg-orange-200 border-orange-300";
        if (count === 2) return "bg-orange-400 border-orange-500";
        if (count === 3) return "bg-orange-500 border-orange-600";
        return "bg-orange-600 border-orange-700";
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
                return streakData.slice(364 - 28 + (weekIndex * 7), 364 - 28 + ((weekIndex + 1) * 7));
            });
        } else {
            // Current week (last 7 days)
            return [streakData.slice(364 - 7)];
        }
    };

    const handlePrev = () => {
        if (viewMode === "week") setPageOffset(p => p + 7);
        if (viewMode === "month") setPageOffset(p => p + 28);
        if (viewMode === "year") setPageOffset(p => p + 364);
    };

    const handleNext = () => {
        if (viewMode === "week") setPageOffset(p => Math.max(0, p - 7));
        if (viewMode === "month") setPageOffset(p => Math.max(0, p - 28));
        if (viewMode === "year") setPageOffset(p => Math.max(0, p - 364));
    };

    const filteredWeeks = getFilteredData();

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
            <Card className="rounded-3xl border-none shadow-xl bg-white text-gray-900 overflow-hidden p-8 border border-orange-100 transition-all hover:shadow-orange-500/10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-orange-600 leading-none">{stats.total}</span>
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">submissions in this period</span>
                        </div>
                        <div className="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 font-black">i</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8">
                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex gap-2 text-gray-500">
                                Total active days: <span className="text-orange-600">{stats.activeDays}</span>
                            </div>
                            <div className="flex gap-2 text-gray-500">
                                Max streak: <span className="text-orange-600">{stats.maxStreak}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-orange-50 p-1.5 rounded-2xl border border-orange-100">
                            {(["week", "month", "year"] as ViewMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setViewMode(m)}
                                    className={cn(
                                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        viewMode === m
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                                            : "text-gray-500 hover:text-orange-600"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button onClick={handlePrev} variant="outline" size="sm" className="bg-white border-orange-200 hover:bg-orange-50 text-orange-600 h-9 px-4 text-[10px] font-black gap-2 rounded-xl uppercase tracking-widest">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button onClick={handleNext} disabled={pageOffset === 0} variant="outline" size="sm" className="bg-white border-orange-200 hover:bg-orange-50 text-orange-600 h-9 px-4 text-[10px] font-black gap-2 rounded-xl uppercase tracking-widest disabled:opacity-50">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4 scrollbar-hide">
                    <div className={cn("mx-auto", viewMode === "year" ? "w-max" : "w-full")}>
                        <div className={cn(
                            "flex gap-1.5 min-w-max",
                            viewMode === "week" && "justify-center py-10",
                            viewMode === "month" && "justify-center py-6"
                        )}>
                        {filteredWeeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1.5 items-center">
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
                                            <PopoverContent className="w-auto p-4 bg-white border-orange-200 text-gray-900 shadow-xl rounded-2xl" side="top">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between gap-6">
                                                        <span className="text-[10px] font-black uppercase text-orange-600 px-2 py-0.5 bg-orange-50 rounded-full border border-orange-200">Entry Details</span>
                                                        <span className="text-[10px] font-bold text-gray-500">{format(day.date, "MMM dd")}</span>
                                                    </div>
                                                    <div className="font-black text-lg">{count} submissions</div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-orange-500">
                                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                                        {getTypeLabel(day.type)}
                                                    </div>
                                                    <div className="opacity-40 font-bold text-[9px] uppercase tracking-tighter">{format(day.date, "EEEE, yyyy")}</div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    );
                                })}
                                {viewMode === "month" && (
                                    <span className="mt-4 text-[9px] text-gray-400 font-black uppercase tracking-tighter whitespace-nowrap">
                                        {format(week[0].date, "MMM dd")}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                        {viewMode === "year" && (
                            <div className="flex justify-between mt-6 text-[10px] text-gray-400 font-black px-1 tracking-widest uppercase w-full">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <span key={i}>{format(subMonths(baseDate, 11 - i), "MMM")}</span>
                                ))}
                            </div>
                        )}
                        {viewMode === "week" && filteredWeeks.length > 0 && (
                            <div className="flex justify-center gap-2 mt-6 text-[10px] text-gray-400 font-black px-1 tracking-widest uppercase w-full">
                                <span>{format(filteredWeeks[0][0].date, "MMM dd, yyyy")}</span>
                                <span>-</span>
                                <span>{format(filteredWeeks[0][6]?.date || filteredWeeks[0][filteredWeeks[0].length - 1].date, "MMM dd, yyyy")}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Breakdown */}
                <div className="mt-10 pt-8 border-t border-orange-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Intensity Legend</span>
                            <div className="flex gap-2">
                                {[0, 1, 2, 3, 4].map(lvl => (
                                    <div key={lvl} className={cn("w-3.5 h-3.5 rounded-[3px]", getIntensityColor(lvl))} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8 lg:gap-12 backdrop-blur-sm bg-orange-50/50 p-4 rounded-3xl border border-orange-100">
                        {[
                            { label: "Progress Logs", val: stats.total, color: "text-orange-600", icon: FileText },
                            { label: "Active Days", val: stats.activeDays, color: "text-orange-500", icon: Award },
                        ].map((t, idx) => (
                            <div key={idx} className="flex items-center gap-3 group cursor-default">
                                <div className="p-2 bg-white rounded-lg group-hover:bg-orange-100 border border-orange-200 transition-colors shadow-sm">
                                    <t.icon className={cn("h-3.5 w-3.5", t.color)} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{t.label}</p>
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

function ResponseStreak({ historyData, currentStreak, maxStreak, totalEntries }: { historyData: any[], currentStreak: number, maxStreak: number, totalEntries: number }) {
    const days: string[] = [];
    const status: boolean[] = [];
    
    // Generate last 7 days including today
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i);
        days.push(format(d, "EEE"));
        
        // Check if there is an entry for this day
        const hasEntry = historyData.some(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getDate() === d.getDate() && 
                   entryDate.getMonth() === d.getMonth() && 
                   entryDate.getFullYear() === d.getFullYear();
        });
        status.push(hasEntry);
    }

    return (
        <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden p-8 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center relative">
                        <Flame className="h-8 w-8 text-orange-600 fill-orange-600 animate-pulse" />
                        <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">HOT</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">{currentStreak} Day Streak</h3>
                        <p className="text-sm text-gray-500 font-bold">You've recorded progress {currentStreak} days in a row!</p>
                    </div>
                </div>
                <div className="flex gap-8">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Best Streak</p>
                        <p className="text-xl font-black text-gray-900">{maxStreak} Days</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Responses</p>
                        <p className="text-xl font-black text-gray-900">{totalEntries}</p>
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
                        <p className="text-xs font-bold text-gray-600">Keep it up! Your response consistency is essential for growth.</p>
                    </div>
                    <a href="#contribution-graph">
                        <Button variant="link" className="text-xs font-black text-orange-600 p-0 h-auto">View Detailed History</Button>
                    </a>
                </div>
            </div>
        </Card>
    );
}

export default function ReportsPage() {
    const [hoveredStat, setHoveredStat] = useState<string | null>(null);

    const { data: profile } = useStudentProfile();
    const studentId = profile?.studentId;
    const programName = profile?.programName || '';
    const trackName = profile?.trackName || '';

    const { data: rawStats } = useStudentStats(studentId);
    const { data: trends } = useStudentTrends(studentId);
    const { data: outcomesSummary } = useStudentOutcomes(studentId);
    const { data: progressHistory } = useStudentProgressHistory(studentId);

    const calculatedStats = useMemo(() => {
        const progressMap = new Map();
        if (progressHistory?.data) {
            progressHistory.data.forEach((p: any) => {
                const dateKey = new Date(p.date).toISOString().split('T')[0];
                progressMap.set(dateKey, true);
            });
        }

        const streakData = [];
        const baseDate = new Date();
        const daysToScan = 365;
        for (let i = 0; i < daysToScan; i++) {
            const date = subDays(baseDate, i);
            const dateKey = date.toISOString().split('T')[0];
            streakData.push(progressMap.get(dateKey) || false);
        }
        streakData.reverse();

        let maxStreak = 0;
        let runningStreak = 0;

        streakData.forEach((isActive) => {
            if (isActive) {
                runningStreak++;
                if (runningStreak > maxStreak) maxStreak = runningStreak;
            } else {
                runningStreak = 0;
            }
        });

        let currentStreak = 0;
        for (let i = streakData.length - 1; i >= 0; i--) {
            if (streakData[i]) {
                currentStreak++;
            } else if (i === streakData.length - 1) {
                continue;
            } else {
                break;
            }
        }

        return { currentStreak, maxStreak };
    }, [progressHistory]);

    // Map trends data to the chart
    const outcomeData = useMemo(() => {
        if (!trends) return [];
        return trends.map((t: any) => {
            let label = t.month || '';
            // If it's a YYYY-MM format, format it nicely
            if (label.includes('-')) {
                const [year, month] = label.split('-');
                const d = new Date(parseInt(year), parseInt(month) - 1, 1);
                if (!isNaN(d.getTime())) {
                    label = d.toLocaleDateString('en-US', { month: 'short' });
                }
            }
            return {
                month: label,
                total: t.entries || 0
            };
        });
    }, [trends]);

    // Performance Trends mapped from trends
    const performanceTrendData = useMemo(() => {
        if (!trends) return [];
        return trends.map((t: any) => ({
            week: t.month,
            performance: t.averagePerformance || 0
        }));
    }, [trends]);

    // Real Outcomes Achieved mapped from outcomesSummary
    const realOutcomes = useMemo(() => {
        if (!outcomesSummary?.recent) return [];
        return outcomesSummary.recent.map((outcome: any, index: number) => {
            let icon = Award;
            let color = "from-[#6366f1] to-[#a855f7]";
            let lightColor = "bg-indigo-50/50";
            let glowColor = "shadow-indigo-500/20";

            if (outcome.type === 'PAPER') {
                icon = FileText; color = "from-[#10b981] to-[#3b82f6]"; lightColor = "bg-emerald-50/50"; glowColor = "shadow-emerald-500/20";
            } else if (outcome.type === 'PRODUCT') {
                icon = Lightbulb; color = "from-[#f59e0b] to-[#ef4444]"; lightColor = "bg-amber-50/50"; glowColor = "shadow-amber-500/20";
            } else if (outcome.type === 'STARTUP') {
                icon = Target; color = "from-[#ec4899] to-[#8b5cf6]"; lightColor = "bg-rose-50/50"; glowColor = "shadow-rose-500/20";
            } else if (outcome.type === 'PROJECT') {
                icon = Brain; color = "from-[#0ea5e9] to-[#2dd4bf]"; lightColor = "bg-blue-50/50"; glowColor = "shadow-blue-500/20";
            }

            let progressValue = 50;
            switch(outcome.status) {
                case 'PENDING': progressValue = 25; break;
                case 'FILED': progressValue = 50; break;
                case 'PUBLISHED':
                case 'GRANTED':
                case 'COMPLETED': progressValue = 100; break;
            }

            return {
                id: outcome.id,
                type: outcome.type,
                title: outcome.title,
                status: outcome.status,
                date: new Date(outcome.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                mentor: profile?.mentor || 'Unassigned',
                progress: progressValue,
                description: "Recent outcome from student's program.",
                impact: "View details",
                icon, color, lightColor, glowColor
            };
        });
    }, [outcomesSummary, profile]);


    const outcomeTypeDistribution = [
        { name: "Patents", value: outcomesSummary?.byType?.PATENT || 0, color: "#f97316" },
        { name: "Papers", value: outcomesSummary?.byType?.PAPER || 0, color: "#ea580c" },
        { name: "Products", value: outcomesSummary?.byType?.PRODUCT || 0, color: "#ff9f1c" },
        { name: "Ventures", value: outcomesSummary?.byType?.STARTUP || 0, color: "#fb8500" },
        { name: "Certifications", value: outcomesSummary?.byType?.CERTIFICATION || 0, color: "#f59e0b" },
        { name: "Brain Dev", value: outcomesSummary?.byType?.PROJECT || 0, color: "#ffa500" },
    ];

    const COLORS = ["#f97316", "#ea580c", "#ff9f1c", "#fb8500", "#f59e0b", "#ffa500"];

    const allStats = [
        { id: "patents", type: "PATENT", label: "Patents Filed", value: `${outcomesSummary?.byType?.PATENT || 0}`, subtext: "Total Filed", icon: Award, color: "from-orange-500 to-orange-600" },
        { id: "papers", type: "PAPER", label: "Research Papers", value: `${outcomesSummary?.byType?.PAPER || 0}`, subtext: "Published", icon: FileText, color: "from-orange-600 to-orange-700" },
        { id: "products", type: "PRODUCT", label: "Products", value: `${outcomesSummary?.byType?.PRODUCT || 0}`, subtext: "Deployed", icon: Lightbulb, color: "from-orange-500 to-orange-600" },
        { id: "ventures", type: "STARTUP", label: "Ventures", value: `${outcomesSummary?.byType?.STARTUP || 0}`, subtext: "In Dev", icon: Target, color: "from-orange-600 to-orange-500" },
        { id: "certifications", type: "CERTIFICATION", label: "Certifications", value: `${outcomesSummary?.byType?.CERTIFICATION || 0}`, subtext: "Earned", icon: Award, color: "from-orange-500 to-orange-600" },
        { id: "projects", type: "PROJECT", label: "Projects", value: `${outcomesSummary?.byType?.PROJECT || 0}`, subtext: "Completed", icon: Brain, color: "from-orange-500 to-orange-600" },
    ];

    const brainScoreStat = { 
        id: "brain", 
        label: "Brain Score", 
        value: `${profile?.stats?.brainScore || rawStats?.currentProgress || 0}%`, 
        subtext: "Overall", 
        icon: Brain, 
        color: "from-orange-500 to-red-500" 
    };

    let visibleStats = [];
    let outcomesText = "Outcomes created over 6 months.";

    if (programName === 'G_GMP' || programName === 'G-GMP') {
        if (trackName.includes('Patent')) {
            visibleStats.push(allStats.find(s => s.id === 'patents'));
            outcomesText = "Patents filed over 6 months.";
        } else if (trackName.includes('Research')) {
            visibleStats.push(allStats.find(s => s.id === 'papers'));
            outcomesText = "Research papers published over 6 months.";
        } else if (trackName.includes('Entrepreneurship')) {
            visibleStats.push(allStats.find(s => s.id === 'ventures'));
            outcomesText = "Ventures developed over 6 months.";
        } else if (trackName.includes('Inventor')) {
            visibleStats.push(allStats.find(s => s.id === 'projects'));
            outcomesText = "Projects created over 6 months.";
        } else {
            visibleStats.push(allStats.find(s => s.id === 'patents'), allStats.find(s => s.id === 'papers'), allStats.find(s => s.id === 'ventures'));
            outcomesText = "Patents, papers, and ventures created over 6 months.";
        }
    } else if (programName === 'G_CMP' || programName === 'G-CMP') {
        visibleStats.push(allStats.find(s => s.id === 'products'));
        visibleStats.push(allStats.find(s => s.id === 'projects'));
        outcomesText = "Products and applications developed over 6 months.";
    } else if (programName === 'E_TIP' || programName === 'E-TIP') {
        visibleStats.push(allStats.find(s => s.id === 'products'));
        visibleStats.push(allStats.find(s => s.id === 'projects'));
        outcomesText = "Systems and products architected over 6 months.";
    } else if (programName === 'PCP') {
        visibleStats.push(allStats.find(s => s.id === 'certifications'));
        visibleStats.push(allStats.find(s => s.id === 'projects'));
        outcomesText = "Certifications and projects completed over 6 months.";
    } else {
        visibleStats.push(allStats.find(s => s.id === 'patents'), allStats.find(s => s.id === 'papers'), allStats.find(s => s.id === 'products'), allStats.find(s => s.id === 'ventures'));
    }

    const stats: any[] = [...visibleStats.filter(Boolean), brainScoreStat];

    const performanceStats = [
        { id: "streak", label: "Total Entries", value: `${rawStats?.totalEntries || 0}`, subtext: "Lifetime", icon: Flame, color: "from-orange-500 to-red-600" },
        { id: "duration", label: "Attendance", value: `${Math.round(rawStats?.attendance?.rate || 0)}%`, subtext: "Session Presence", icon: Clock, color: "from-blue-500 to-indigo-600" },
        { id: "completion", label: "Reports", value: `${rawStats?.weeklyReports || 0}`, subtext: "Weekly Gen", icon: CheckCircle2, color: "from-emerald-500 to-teal-600" },
        { id: "status", label: "Avg Rating", value: `${Math.round(rawStats?.performance?.average || 0)}/10`, subtext: "Mentor Eval", icon: ZapIcon, color: "from-purple-500 to-pink-600" },
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
                <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", 
                    stats.length === 2 ? "lg:grid-cols-2" : 
                    stats.length === 3 ? "lg:grid-cols-3" : 
                    stats.length === 4 ? "lg:grid-cols-4" : 
                    "lg:grid-cols-5"
                )}>
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
                <div id="contribution-graph" className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <History className="h-5 w-5 text-orange-500" />
                        <h2 className="text-xl font-bold font-montserrat text-gray-900 uppercase tracking-tight">Submission Streak</h2>
                    </div>
                    <ContributionGraph studentId={studentId} />
                </div>

                {/* Response Streak Section */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 px-2">
                        <ZapIcon className="h-5 w-5 text-orange-500" />
                        <h2 className="text-xl font-bold font-montserrat text-gray-900 uppercase tracking-tight">Response Consistency</h2>
                    </div>
                    <ResponseStreak 
                        historyData={progressHistory?.data || []} 
                        currentStreak={calculatedStats.currentStreak}
                        maxStreak={calculatedStats.maxStreak}
                        totalEntries={rawStats?.totalEntries || 0}
                    />
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
                                        <p className="text-sm text-gray-600">{outcomesText}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[300px] w-full min-w-0">
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

                    {/* Performance Trends - Compact */}
                    <div className="rounded-3xl border border-gray-200/50 bg-white p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 group overflow-hidden">
                        {/* Top accent */}
                        <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2.5 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Performance Trend</h3>
                                        <p className="text-xs text-gray-600">Average Rating</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[300px] w-full min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={performanceTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                        <XAxis dataKey="week" fontSize={11} tickLine={false} axisLine={false} stroke="#999" />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#999" domain={[0, 10]} />
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
                                            dataKey="performance"
                                            stroke="#f97316"
                                            strokeWidth={2.5}
                                            dot={{ fill: "#f97316", r: 4 }}
                                            name="Avg Rating"
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
