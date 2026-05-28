"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
    BookOpen,
    Clock,
    Star,
    ArrowUpRight,
    Plus,
    Search,
    Filter,
    PlayCircle,
    CheckCircle2,
    Trophy,
    Target,
    UserCircle,
    LayoutGrid,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LiquidCard, CardContent as LiquidCardContent, CardHeader as LiquidCardHeader } from "@/components/ui/liquid-glass-card";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ApiService } from "@/services/api";
import { useStudentProfile } from "@/hooks/api/useStudent";

// --- Types and Enums from Inspiration ---
enum Strength {
    None = "none",
    Weak = "weak",
    Moderate = "moderate",
    Strong = "strong",
}

type Score = number | null;
type StrengthColors = Record<Strength, string[]>;

interface Course {
    id: number;
    title: string;
    code: string;
    instructor: string;
    progress: number;
    rating: number;
    duration: string;
    category: string;
    description: string;
    status: string;
    image: string;
}

// --- Utils Class from Inspiration ---
class Utils {
    static LOCALE = "en-US";
    static easings = {
        easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
        easeOut: "cubic-bezier(0.33, 1, 0.68, 1)",
    };

    static circumference(r: number): number {
        return 2 * Math.PI * r;
    }

    static formatNumber(n: number) {
        return new Intl.NumberFormat(this.LOCALE).format(n);
    }

    static getStrength(score: number | null, maxScore: number): Strength {
        if (score === null) return Strength.None;
        const percent = score / maxScore;
        if (percent >= 0.8) return Strength.Strong;
        if (percent >= 0.4) return Strength.Moderate;
        return Strength.Weak;
    }

    static randomHash(length = 4): string {
        const chars = "abcdef0123456789";
        const bytes = crypto.getRandomValues(new Uint8Array(length));
        return [...bytes].map((b) => chars[b % chars.length]).join("");
    }
}

// --- Context for Staggered Animations ---
type CounterContextType = {
    getNextIndex: () => number;
};
const CounterContext = createContext<CounterContextType | undefined>(undefined);

const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const counterRef = useRef(0);
    const getNextIndex = useCallback(() => {
        return counterRef.current++;
    }, []);
    return <CounterContext.Provider value={{ getNextIndex }}>{children}</CounterContext.Provider>;
};

const useCounter = () => {
    const context = useContext(CounterContext);
    if (!context) throw new Error("useCounter must be used within a CounterProvider");
    return context.getNextIndex;
};

// --- Sub-components for Course Card (Inspired by FinancialScore) ---

function CourseScoreHalfCircle({ value, max, colorStops }: { value: number; max: number; colorStops: string[] }) {
    const strokeRef = useRef<SVGCircleElement>(null);
    const gradIdRef = useRef(`grad-${Utils.randomHash()}`);
    const gradId = gradIdRef.current;
    const gradStroke = `url(#${gradId})`;
    const radius = 45;
    const dist = Utils.circumference(radius);
    const distHalf = dist / 2;
    const strokeDasharray = `${distHalf} ${distHalf}`;
    const distForValue = (value / max) * -distHalf;
    const strokeDashoffset = distForValue;

    useEffect(() => {
        const strokeStart = 400;
        const duration = 1400;

        strokeRef.current?.animate(
            [
                { strokeDashoffset: "0", offset: 0 },
                { strokeDashoffset: "0", offset: strokeStart / duration },
                { strokeDashoffset: strokeDashoffset.toString() },
            ],
            {
                duration,
                easing: Utils.easings.easeInOut,
                fill: "forwards",
            },
        );
    }, [value, max, strokeDashoffset]);

    return (
        <svg className="block mx-auto w-auto max-w-full h-32" viewBox="0 0 100 50" aria-hidden="true">
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                    {colorStops.map((stop, i) => {
                        const offset = `${(100 / (colorStops.length - 1)) * i}%`;
                        return <stop key={i} offset={offset} stopColor={stop} />;
                    })}
                </linearGradient>
            </defs>
            <g fill="none" strokeWidth="10" transform="translate(50, 50.5)">
                <circle stroke="currentColor" className="text-gray-100" r={radius} />
                <circle ref={strokeRef} stroke={gradStroke} strokeDasharray={strokeDasharray} r={radius} strokeLinecap="round" />
            </g>
        </svg>
    );
}

function CourseScoreDisplay({ value, max }: { value: number; max: number }) {
    const digits = String(Math.floor(value)).split("");
    const maxFormatted = Utils.formatNumber(max);

    return (
        <div className="absolute bottom-0 w-full text-center">
            <div className="text-3xl font-black h-10 overflow-hidden relative">
                <div className="absolute inset-0">
                    {digits.map((digit, i) => (
                        <span
                            key={i}
                            className="inline-block animate-in slide-in-from-bottom-full duration-800 fill-mode-both"
                            style={{
                                animationDelay: `${400 + i * 100}ms`,
                                animationDuration: `${800 + i * 300}ms`,
                            }}
                        >
                            {digit}
                        </span>
                    ))}
                    <span className="text-xl ml-0.5 opacity-60">%</span>
                </div>
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Progress</div>
        </div>
    );
}

// Removed static COURSES array
function CourseCard({ course }: { course: Course }) {
    const getNextIndex = useCounter();
    const indexRef = useRef<number | null>(null);
    const [appearing, setAppearing] = useState(false);

    if (indexRef.current === null) {
        indexRef.current = getNextIndex();
    }

    useEffect(() => {
        const delay = 300 + indexRef.current! * 150;
        const timer = setTimeout(() => setAppearing(true), delay);
        return () => clearTimeout(timer);
    }, []);

    const strengthColors: StrengthColors = {
        none: ["hsl(220, 13%, 69%)", "hsl(220, 9%, 46%)"],
        weak: ["#fee2e2", "#ef4444", "#991b1b"],
        moderate: ["#fef3c7", "#f59e0b", "#92400e"],
        strong: ["#dcfce7", "#22c55e", "#166534"],
    };

    const strength = Utils.getStrength(course.progress, 100);
    const colorStops = strengthColors[strength];

    if (!appearing) return <div className="h-[450px] w-full bg-gray-50/50 rounded-[2.5rem] animate-pulse" />;

    return (
        <LiquidCard className="h-full flex flex-col group animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both border-white/40 shadow-2xl hover:shadow-orange-100/50 transition-all">
            <LiquidCardHeader className="pb-6 pt-8 px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-900 text-white", course.code === "G-CMP" ? "bg-indigo-600" : course.code === "E-TIP" ? "bg-orange-600" : "bg-gray-900")}>
                                {course.code}
                            </span>
                            <Badge variant="outline" className="border-gray-200 text-[9px] font-black uppercase tracking-widest py-0.5">
                                {course.category}
                            </Badge>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 truncate tracking-tight group-hover:text-orange-600 transition-colors">
                            {course.title}
                        </h3>
                    </div>
                </div>
            </LiquidCardHeader>
            <LiquidCardContent className="px-8 pb-8 flex-1 flex flex-col space-y-6">
                {/* Half Circle Progress (Inspired by FinancialScore) */}
                <div className="relative pt-6">
                    <CourseScoreHalfCircle value={course.progress} max={100} colorStops={colorStops} />
                    <CourseScoreDisplay value={course.progress} max={100} />
                </div>

                <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-3 min-h-[4.5rem]">
                    {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserCircle className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{course.instructor}</span>
                            <div className="flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                <span className="text-[10px] font-bold text-gray-400">{course.rating}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</span>
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{course.duration}</span>
                    </div>
                </div>

                <Link href={`/Student/my-courses/${course.code}`} className="block mt-4">
                    <LiquidButton
                        className={cn(
                            "w-full h-14 rounded-2xl group/btn",
                            course.status === "Completed" ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100" : "bg-white/50 text-gray-900 hover:bg-white"
                        )}
                    >
                        <span className="relative z-10 uppercase tracking-widest text-[11px] font-black flex items-center gap-2">
                            {course.status === "Completed" ? "View Certificate" : "Continue Learning"}
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                    </LiquidButton>
                </Link>
            </LiquidCardContent>
        </LiquidCard>
    );
}

export default function MyCoursesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [programs, setPrograms] = useState<any[]>([]);
    const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
    const { data: profile, isLoading: isProfileLoading } = useStudentProfile();

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const allPrograms = await ApiService.getPrograms();
                // Filter if needed, but for now we'll just map them. Ideally, filter to student's enrolled program.
                const studentProgramId = profile?.student?.program?.toLowerCase();
                const enrolledPrograms = allPrograms.filter(p => p.id.toLowerCase() === studentProgramId);
                // If not enrolled in any, maybe show all or just the ones they are in.
                const programsToShow = enrolledPrograms.length > 0 ? enrolledPrograms : [];

                setPrograms(programsToShow.map((p, i) => ({
                    id: i + 1,
                    code: p.id.toUpperCase(),
                    title: p.name,
                    instructor: p.hasMentors ? "Program Mentor" : "Self-paced",
                    progress: 0, // Should be fetched from student progress API
                    rating: 5.0,
                    duration: (p as any).duration || "Self-paced",
                    category: "Technology",
                    description: p.description,
                    status: "In Progress",
                    image: "from-indigo-600 to-blue-500"
                })));
            } catch (error) {
                console.error("Error fetching programs:", error);
            } finally {
                setIsLoadingPrograms(false);
            }
        };

        if (!isProfileLoading) {
            fetchPrograms();
        }
    }, [profile, isProfileLoading]);

    const stats = [
        { label: "Active Courses", value: programs.length.toString(), icon: BookOpen, color: "text-indigo-500" },
        { label: "Innovation Points", value: "1.8k", icon: Sparkles, color: "text-orange-500" },
        { label: "Learning Hours", value: "142h", icon: Clock, color: "text-blue-500" },
        { label: "Achievements", value: "7", icon: Trophy, color: "text-amber-500" },
    ];

    return (
        <div className="space-y-10 p-6 pb-20 bg-gradient-to-br from-white via-orange-50/10 to-white min-h-screen">
            <CounterProvider>
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 animate-in fade-in duration-1000">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-orange-100/50">
                            <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">Curriculum Dashboard</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.8] py-2">
                            My Future <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-600 to-orange-400">Pathways</span>
                        </h1>
                        <p className="text-gray-500 font-medium tracking-tight text-xl max-w-xl leading-relaxed">
                            A highly curated selection of innovation tracks designed to accelerate your technical and global career growth.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <LiquidButton variant="default" className="h-16 px-8 rounded-3xl bg-gray-900 text-white hover:bg-orange-600 border-none transition-all">
                            <Plus className="mr-3 h-5 w-5" />
                            <span className="uppercase font-black tracking-widest text-xs">Enroll Course</span>
                        </LiquidButton>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                            >
                                <LiquidCard className="border-none bg-white shadow-xl shadow-gray-100/50 group overflow-hidden">
                                    <LiquidCardContent className="p-8">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{stat.label}</p>
                                                <p className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-gray-50 group-hover:bg-orange-50 transition-all duration-500 transform group-hover:rotate-6">
                                                <Icon className={cn("w-6 h-6 transition-colors", stat.color)} />
                                            </div>
                                        </div>
                                    </LiquidCardContent>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                </LiquidCard>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Search & Selection */}
                <div className="flex flex-col md:flex-row gap-4 bg-white/40 p-3 rounded-[2rem] border border-white/60 backdrop-blur-xl shadow-xl shadow-orange-100/20">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search curriculum, modules, or tracks..."
                            className="h-14 pl-16 pr-6 border-none bg-transparent focus-visible:ring-0 text-lg font-bold text-gray-900 placeholder:text-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 px-4">
                        <div className="h-8 w-[1px] bg-gray-200 hidden md:block" />
                        <LiquidButton variant="ghost" className="h-12 w-12 p-0 rounded-2xl bg-gray-50 flex items-center justify-center">
                            <LayoutGrid className="w-5 h-5 text-gray-400" />
                        </LiquidButton>
                        <LiquidButton className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-orange-500 text-white border-none hover:bg-orange-600">
                            Apply Filters
                        </LiquidButton>
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoadingPrograms ? (
                        <div className="col-span-full flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    ) : programs.length > 0 ? (
                        programs.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-white/50 rounded-3xl border border-white">
                            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Courses</h3>
                            <p className="text-gray-500">You are not currently enrolled in any programs.</p>
                        </div>
                    )}
                </div>
            </CounterProvider>
        </div>
    );
}
