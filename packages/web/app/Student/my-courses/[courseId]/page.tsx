"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    FileText,
    Trophy,
    Send,
    AlertCircle,
    Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LiquidCard, CardContent, CardHeader } from "@/components/ui/liquid-glass-card";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const COURSE_CONTENT = {
    "GGMP": {
        title: "Global Guided Mentorship Program",
        description: "A comprehensive journey across school, college, and professional levels to build your foundation as a future founder or global leader.",
        category: "Mentorship",
        modules: [
            { id: 1, title: "Foundations of Global Mentorship", duration: "35:00", status: "completed", videoUrl: "" },
            { id: 2, title: "Building a Founder's Mindset", duration: "50:00", status: "completed", videoUrl: "" },
            { id: 3, title: "Ethics in Global Leadership", duration: "45:00", status: "completed", videoUrl: "" }
        ],
        assignments: [
            { id: 1, title: "Vision Statement Draft", status: "Graded", score: 100, dueDate: "Jan 15, 2026" },
            { id: 2, title: "Leadership Self-Assessment", status: "Graded", score: 98, dueDate: "Jan 30, 2026" }
        ],
        overallProgress: 100,
        totalModules: 3,
        completedModules: 3
    },
    "G-CMP": {
        title: "Global Coding Mentorship Program",
        description: "Master industry-standard coding practices, system design, and product development under the guidance of elite software engineers.",
        category: "Software Engineering",
        modules: [
            { id: 1, title: "International Job Market Landscapes", duration: "45:00", status: "completed", videoUrl: "https://vimeo.com/example1" },
            { id: 2, title: "Universal Professional Ethics", duration: "1:12:00", status: "completed", videoUrl: "https://vimeo.com/example2" },
            { id: 3, title: "Advanced Personal Branding Strategy", duration: "58:30", status: "current", videoUrl: "https://vimeo.com/example3" },
            { id: 4, title: "High-Impact Networking for Innovation", duration: "1:05:00", status: "locked", videoUrl: "" },
            { id: 5, title: "Cross-Cultural Communication", duration: "52:15", status: "locked", videoUrl: "" }
        ],
        assignments: [
            { id: 1, title: "Profile Audit & Refinement", status: "Graded", score: 95, dueDate: "Feb 20, 2026" },
            { id: 2, title: "Value Proposition Canvas", status: "Submitted", score: null, dueDate: "Mar 05, 2026" },
            { id: 3, title: "Global Network Expansion Plan", status: "Pending", score: null, dueDate: "Mar 15, 2026" }
        ],
        overallProgress: 65,
        totalModules: 15,
        completedModules: 9
    },
    "E-TIP": {
        title: "Executive Technology Immersion Program",
        description: "Designed for mid-to-senior leaders and aspiring CXOs to deeply immerse in emerging technologies and strategic tech integration.",
        category: "Leadership",
        modules: [
            { id: 1, title: "The Foundation of Deep Tech", duration: "1:20:00", status: "completed", videoUrl: "https://vimeo.com/example4" },
            { id: 2, title: "AI Integration in Modern Enterprise", duration: "1:45:00", status: "current", videoUrl: "https://vimeo.com/example5" },
            { id: 3, title: "Blockchain Architectures", duration: "1:15:00", status: "locked", videoUrl: "" },
            { id: 4, title: "Quantum Computing Basics", duration: "2:05:00", status: "locked", videoUrl: "" }
        ],
        assignments: [
            { id: 1, title: "Tech Stack Feasibility Analysis", status: "Submitted", score: null, dueDate: "Mar 10, 2026" },
            { id: 2, title: "System Design for AI Agent", status: "Pending", score: null, dueDate: "Mar 25, 2026" }
        ],
        overallProgress: 35,
        totalModules: 12,
        completedModules: 4
    },
    "PCP": {
        title: "Professional Certification Program",
        description: "A professional-grade certification track for aspiring IT pros and product developers to validate their expertise in modern tech stacks.",
        category: "Certification",
        modules: [
            { id: 1, title: "Foundation of Professional Dev", duration: "1:10:00", status: "locked", videoUrl: "" },
            { id: 2, title: "Modern Tech Stack Mastery", duration: "2:30:00", status: "locked", videoUrl: "" }
        ],
        assignments: [
            { id: 1, title: "Skill Baseline Test", status: "Pending", score: null, dueDate: "Apr 01, 2026" }
        ],
        overallProgress: 0,
        totalModules: 10,
        completedModules: 0
    }
};

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const course = COURSE_CONTENT[courseId as keyof typeof COURSE_CONTENT];

    const [activeModule, setActiveModule] = useState(course?.modules.find(m => m.status === "current") || course?.modules[0]);

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <AlertCircle className="w-16 h-16 text-gray-300" />
                <h2 className="text-2xl font-black text-gray-900">Course Not Found</h2>
                <Button onClick={() => router.push("/Student/my-courses")}>Back to Courses</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-8 space-y-8">
            {/* Top Navigation & Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">{course.category}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{courseId}</span>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{course.title}</h1>
                    </div>
                </div>

                <div className="w-full md:w-80 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="transparent" stroke="#f3f4f6" strokeWidth="4" />
                            <circle
                                cx="24" cy="24" r="20" fill="transparent" stroke="#f97316" strokeWidth="4"
                                strokeDasharray={126} strokeDashoffset={126 - (126 * course.overallProgress / 100)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="text-xs font-black text-gray-900">{course.overallProgress}%</span>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Overall Completion</p>
                        <p className="text-sm font-bold text-gray-900">{course.completedModules} of {course.totalModules} modules finished</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Main Content: Module Details */}
                <div className="space-y-8">
                    {/* Module Info & Assignments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <LiquidCard className="bg-white border-white/40 shadow-xl">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Active Module</h3>
                                    <Badge className="bg-orange-500 text-[10px] font-black">CONTINUE</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    In this module, you'll learn industry-standard frameworks for {activeModule?.title.toLowerCase()}. This includes strategic implementation and verification of performance metrics.
                                </p>
                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2">
                                        <Download className="w-4 h-4" /> Resources
                                    </Button>
                                    <Button variant="outline" className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest gap-2">
                                        <FileText className="w-4 h-4" /> Notes
                                    </Button>
                                </div>
                            </CardContent>
                        </LiquidCard>

                        <LiquidCard className="bg-white border-white/40 shadow-xl">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Assignment Status</h3>
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {course.assignments.map((assignment) => (
                                    <div key={assignment.id} className="p-3 rounded-xl border border-gray-50 bg-gray-50/50 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-gray-900 truncate max-w-[120px]">{assignment.title}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due: {assignment.dueDate}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {assignment.score && (
                                                <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md">{assignment.score}%</span>
                                            )}
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-black uppercase border-none px-2",
                                                assignment.status === "Graded" ? "bg-green-100 text-green-700" :
                                                    assignment.status === "Submitted" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                                            )}>
                                                {assignment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                <Button className="w-full h-12 bg-gray-900 hover:bg-orange-600 font-black uppercase tracking-widest text-[10px] rounded-xl mt-2">
                                    Submit New Assignment <Send className="w-3 h-3 ml-2" />
                                </Button>
                            </CardContent>
                        </LiquidCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
