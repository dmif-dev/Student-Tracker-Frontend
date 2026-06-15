"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowLeft, Clock, Calendar, User, BookOpen, Target, CheckCircle, FileText, ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SessionNotesViewerPage() {
    const params = useParams();
    const router = useRouter();
    const sessionId = params.id as string;

    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!sessionId) return;

        const loadSession = async () => {
            try {
                const data = await ApiService.getSessionById(sessionId);
                setSession(data);
            } catch (error) {
                console.error("Failed to load session details", error);
                toast.error("Failed to load session notes.");
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, [sessionId]);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[300px] w-full" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <FileText className="w-16 h-16 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-800">Session not found</h3>
                <Button onClick={() => router.push("/Student/dashboard")} variant="outline">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-20">
            {/* Header / Navigation */}
            <div className="flex items-center space-x-4 mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 hover:bg-orange-50 hover:text-orange-600 text-gray-500 font-bold"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            {/* Session Info Card */}
            <Card className="rounded-2xl border-none shadow-xl bg-gradient-to-br from-orange-500 to-amber-600 overflow-hidden text-white">
                <CardContent className="p-8 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-4">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-bold uppercase tracking-wider text-xs">
                                Session Details
                            </Badge>
                            <h1 className="text-3xl font-extrabold tracking-tight font-montserrat">
                                {session.topic || "Mentorship Session"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 mt-4">
                                <div className="flex items-center gap-2 text-orange-50 font-medium">
                                    <User className="w-5 h-5 text-white/70" />
                                    <span>Mentor: <strong className="text-white">{session.mentor?.name}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-orange-50 font-medium">
                                    <Calendar className="w-5 h-5 text-white/70" />
                                    <span>{format(new Date(session.date), "PPP")}</span>
                                </div>
                                <div className="flex items-center gap-2 text-orange-50 font-medium">
                                    <Clock className="w-5 h-5 text-white/70" />
                                    <span>{session.startTime} - {session.endTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notes Section */}
            {session.notes && session.notes.length > 0 ? (
                <div className="space-y-6">
                    {session.notes.map((note: any) => (
                        <Card key={note.id} className="rounded-2xl border-gray-200/50 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold font-montserrat text-gray-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-orange-500" />
                                        Session Notes
                                    </CardTitle>
                                    <CardDescription className="font-medium mt-1">
                                        Added on {format(new Date(note.createdAt), "PPP 'at' p")}
                                    </CardDescription>
                                </div>
                                {note.duration && (
                                    <Badge variant="outline" className="font-bold text-gray-600">
                                        {note.duration} mins
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                {/* Topics Covered */}
                                {note.topics && note.topics.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" /> Topics Covered
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {note.topics.map((topic: string, i: number) => (
                                                <Badge key={i} className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 font-bold px-3 py-1">
                                                    {topic}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Main Content */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                                        Summary & Notes
                                    </h3>
                                    <div className="prose prose-orange max-w-none text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">
                                        {note.content.split('\n').map((paragraph: string, i: number) => (
                                            <p key={i} className={paragraph.trim() ? "mb-4 last:mb-0" : ""}>
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Feedback */}
                                {note.feedback && (
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" /> Mentor Feedback
                                        </h3>
                                        <div className="bg-green-50 text-green-800 p-6 rounded-xl border border-green-100 font-medium">
                                            {note.feedback}
                                        </div>
                                    </div>
                                )}

                                {/* Next Steps */}
                                {note.nextSteps && (
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                                            <Target className="w-4 h-4 text-blue-500" /> Action Items & Next Steps
                                        </h3>
                                        <div className="bg-blue-50 text-blue-800 p-6 rounded-xl border border-blue-100 font-medium">
                                            {note.nextSteps}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-2xl border-gray-200/50 border-dashed bg-gray-50/50 shadow-none">
                    <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Notes Yet</h3>
                        <p className="text-gray-500 font-medium max-w-sm">
                            Your mentor has not added any notes for this session yet. Check back later or reach out to them directly.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
