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
import { ProcessSection } from "@/components/display/ProcessSection";
import { CourseTracks } from "@/components/display/CourseTracks";
import { MentorshipModel } from "@/components/display/MentorshipModel";
import { ExecutiveTracks } from "@/components/display/ExecutiveTracks";
import { useStudentProfile, useStudentStats } from "@/hooks/api/useStudent";
import { ApiService } from "@/services/api";

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const [program, setProgram] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { data: profile } = useStudentProfile();
    const studentId = profile?.studentId;
    const { data: rawStats } = useStudentStats(studentId);

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const allPrograms = await ApiService.getPrograms();
                const matched = allPrograms.find(p => p.id.toUpperCase() === courseId.toUpperCase());
                setProgram(matched);
            } catch (error) {
                console.error("Failed to fetch program", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProgram();
    }, [courseId]);

    // Use actual stats for progress, fallback to 0
    const progress = rawStats?.currentProgress || 0;
    const completedModules = Math.floor(progress / 10) || 0;
    const totalModules = 10; // Assuming 10 total as a placeholder

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!program) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <AlertCircle className="w-16 h-16 text-gray-300" />
                <h2 className="text-2xl font-black text-gray-900">Course Not Found</h2>
                <Button onClick={() => router.push("/Student/my-courses")}>Back to Courses</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-orange-50/20 p-4 md:p-8 space-y-8 relative overflow-hidden">
            {/* Soft decorative background blurs */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-200/20 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2 -z-10" />
            {/* Top Navigation & Status */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="h-12 w-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">Mentorship</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{courseId}</span>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{program.name}</h1>
                    </div>
                </div>

                <div className="w-full md:w-80 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="transparent" stroke="#f3f4f6" strokeWidth="4" />
                            <circle
                                cx="24" cy="24" r="20" fill="transparent" stroke="#f97316" strokeWidth="4"
                                strokeDasharray={126} strokeDashoffset={126 - (126 * progress / 100)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="text-xs font-black text-gray-900">{progress}%</span>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Overall Completion</p>
                        <p className="text-sm font-bold text-gray-900">{completedModules} of {totalModules} modules finished</p>
                    </div>
                </div>
            </motion.div>

            {courseId === "G-CMP" && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="max-w-7xl mx-auto px-4 md:px-0 pt-4"
                    >
                        <ProcessSection />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="max-w-7xl mx-auto px-4 md:px-0"
                    >
                        <CourseTracks />
                    </motion.div>
                </>
            )}

            {courseId === "E-TIP" && (
                <div className="max-w-7xl mx-auto px-4 md:px-0 space-y-12">
                    <MentorshipModel />
                    <ExecutiveTracks />
                </div>
            )}

        </div>
    );
}
