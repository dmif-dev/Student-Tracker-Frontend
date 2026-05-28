 "use client";

import { UserCircle, Mail, MessageSquare, Calendar, ExternalLink, Award, Users, Star, Clock, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "sonner";
import { useState, useMemo } from "react";
import { apiClient } from "@/utils/apiClient";
import { createClient } from "@/utils/supabase/client";

import { format, addDays } from "date-fns";
import { useStudentProfile, useStudentSessionsHistory } from "@/hooks/api/useStudent";

export default function MentorDetailsPage() {
    const { data: profile, isLoading } = useStudentProfile();
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isSessionOpen, setIsSessionOpen] = useState(false);
    const [sessionDate, setSessionDate] = useState("");
    const [sessionTime, setSessionTime] = useState("");
    const [sessionTopic, setSessionTopic] = useState("");
    const [isBooking, setIsBooking] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const { data: sessionHistoryData, isLoading: isHistoryLoading } = useStudentSessionsHistory();
    
    const mentor = profile?.mentorDetails;

    const getAvatarUrl = (path: string | undefined | null) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/api\/?$/, '') || 'http://localhost:4000';
        return `${apiUrl}/api/mentor/${mentor?.id}/avatar?v=${encodeURIComponent(path)}`;
    };

    // Helper to format availability
    const officeHours = useMemo(() => {
        if (!mentor?.availability || mentor.availability.length === 0) {
            return { days: "TBA", time: "Contact mentor" };
        }
        
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayStrs = mentor.availability.map((a: any) => days[a.dayOfWeek]);
        const uniqueDays = Array.from(new Set(dayStrs)).join(", ");
        
        // Take the first availability time as representative for simplicity
        const { startTime, endTime } = mentor.availability[0];
        
        return { days: uniqueDays, time: `${startTime} - ${endTime} (IST)` };
    }, [mentor]);

    // Generate next 7 days for calendar
    const calendarDays = useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = addDays(today, i);
            const dayOfWeek = date.getDay();
            
            // Check if mentor has availability on this day
            const avail = mentor?.availability?.find((a: any) => a.dayOfWeek === dayOfWeek);
            
            days.push({
                date,
                isAvailable: !!avail,
                timeSlot: avail ? `${avail.startTime} - ${avail.endTime}` : null,
                startTime: avail?.startTime
            });
        }
        return days;
    }, [mentor]);

    const handleBookSession = async () => {
        if (!sessionDate || !sessionTime || !sessionTopic) {
            toast.error("Please fill all fields.");
            return;
        }
        setIsBooking(true);
        try {
            // Calculate an end time based on a default 1-hour session
            const [hours, minutes] = sessionTime.split(":");
            let endHours = parseInt(hours) + 1;
            let endMinutes = minutes;
            if (endHours >= 24) {
                endHours = 23;
                endMinutes = "59";
            }
            const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes}`;

            await apiClient.post('sessions', {
                studentId: profile?.studentId,
                mentorId: mentor?.id,
                date: new Date(sessionDate).toISOString(),
                startTime: sessionTime,
                endTime: endTime,
                topic: sessionTopic
            });
            toast.success("Session requested successfully!");
            setIsSessionOpen(false);
            setSessionDate("");
            setSessionTime("");
            setSessionTopic("");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to book session. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageContent.trim()) return;
        setIsSending(true);
        try {
            await apiClient.post('notifications', {
                targetUserId: mentor?.userId, // Mentor's underlying User ID
                type: 'MESSAGE',
                category: 'student',
                title: `Message from ${profile?.firstName} ${profile?.lastName}`,
                message: messageContent,
                studentId: profile?.studentId
            });
            toast.success("Message sent to your mentor!");
            setIsMessageOpen(false);
            setMessageContent("");
        } catch (error) {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Loading mentor details...</div>;
    }

    if (!mentor) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <UserCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">No Mentor Assigned</h2>
                <p className="text-gray-500 max-w-md">You have not been assigned a mentor yet. Please contact your program coordinator.</p>
            </div>
        );
    }

    return (
        <>
        <div className="space-y-8 animate-in fade-in duration-700">
            <Toaster position="top-right" richColors />
            {/* Header / Mentor Hero */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-orange-200/50 bg-gradient-to-br from-white via-orange-50/40 to-white p-10 lg:p-14 shadow-sm">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-orange-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <Avatar className="w-40 h-40 border-8 border-white shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                            <AvatarImage src={getAvatarUrl(mentor?.avatar) || undefined} />
                            <AvatarFallback className="w-full h-full flex items-center justify-center bg-orange-600 text-white text-5xl font-black">
                                {mentor?.name?.charAt(0).toUpperCase() || "M"}
                            </AvatarFallback>
                        </Avatar>
                        <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-black border-4 border-white py-1.5 px-6 rounded-full z-20 shadow-lg whitespace-nowrap">
                            {mentor?.designation || "SENIOR MENTOR"}
                        </Badge>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-gray-900 tracking-tight">{mentor?.name || "Dr. Maxx"}</h1>
                            <p className="text-xl text-orange-600 font-bold italic">{(Array.isArray(mentor?.expertise) ? mentor.expertise.join(', ') : mentor?.expertise) || "Principal Innovation Architect & IP Strategist"}</p>
                        </div>
                        <p className="text-lg text-gray-600 font-medium max-w-3xl leading-relaxed">
                            {mentor?.bio || "Guides students through the complexities of technical mastery and innovation."}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                            <Dialog open={isSessionOpen} onOpenChange={setIsSessionOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        className="bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl px-8 h-12 shadow-lg shadow-orange-600/20 gap-2"
                                    >
                                        <Calendar className="w-5 h-5" /> Request Additional Session
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black">Request Additional Session</DialogTitle>
                                        <DialogDescription className="font-medium text-gray-500">
                                            Request an additional 1-on-1 session outside your regular schedule.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Topic / Agenda</label>
                                            <Input
                                                value={sessionTopic}
                                                onChange={(e) => setSessionTopic(e.target.value)}
                                                placeholder="e.g. Code Review, Career Advice..."
                                                className="rounded-xl border-gray-200 font-medium"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Date</label>
                                                <Input
                                                    type="date"
                                                    value={sessionDate}
                                                    onChange={(e) => setSessionDate(e.target.value)}
                                                    className="rounded-xl border-gray-200 font-medium"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Start Time</label>
                                                <Input
                                                    type="time"
                                                    value={sessionTime}
                                                    onChange={(e) => setSessionTime(e.target.value)}
                                                    className="rounded-xl border-gray-200 font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button 
                                            onClick={handleBookSession} 
                                            disabled={isBooking || !sessionTopic || !sessionDate || !sessionTime}
                                            className="bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl h-11 px-8 w-full"
                                        >
                                            {isBooking ? "Booking..." : "Request Session"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            
                            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 font-black rounded-2xl px-8 h-12 gap-2 shadow-sm">
                                        <MessageSquare className="w-5 h-5" /> Send Message
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black">Message {mentor?.name}</DialogTitle>
                                        <DialogDescription className="font-medium text-gray-500">
                                            Send a direct notification to your mentor. They will receive it in their portal.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <Textarea
                                            value={messageContent}
                                            onChange={(e) => setMessageContent(e.target.value)}
                                            placeholder="Write your message here..."
                                            className="min-h-[120px] rounded-2xl border-gray-200 resize-none font-medium"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button 
                                            onClick={handleSendMessage} 
                                            disabled={isSending || !messageContent.trim()}
                                            className="bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl h-11 px-8"
                                        >
                                            {isSending ? "Sending..." : "Send Message"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <a href={`mailto:${profile?.mentorEmail || ""}`}>
                                <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 font-black rounded-2xl px-8 h-12 gap-2 shadow-sm">
                                    <Mail className="w-5 h-5" /> Email Mentor
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Mentor Quick Info */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black flex items-center gap-3">
                                <Briefcase className="w-6 h-6 text-orange-500" /> Expertise
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="grid gap-4">
                                {[
                                    { label: "Technical Focus", value: mentor?.expertise?.join(', ') || mentor?.expertise || "Cloud Systems & AI" },
                                    { label: "Email", value: profile?.mentorEmail || "Contact via portal" },
                                    { label: "Experience", value: mentor?.experience || "Expert" },
                                    { label: "Active Students", value: `${mentor?.assignedStudents?.length ?? mentor?.students ?? 0} Students` }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col p-4 rounded-2xl bg-gray-50 border border-gray-100/50">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</span>
                                        <span className="text-md font-bold text-gray-800">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-none shadow-md overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest">Office Hours</p>
                                    <h3 className="text-xl font-black">{officeHours.days}</h3>
                                    <p className="text-orange-50/80 font-medium">{officeHours.time}</p>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                                    <Clock className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <Button 
                                onClick={() => setIsCalendarOpen(true)}
                                variant="secondary" 
                                className="w-full bg-white text-orange-600 font-black hover:bg-orange-50 h-12 rounded-2xl shadow-xl"
                            >
                                Check Availability
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Details */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-md bg-white p-2">
                        <CardHeader className="p-8">
                            <CardTitle className="text-2xl font-black">Mentor Background</CardTitle>
                            <CardDescription className="text-md font-medium italic">"Empowering the next generation of technical innovators."</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">Biography</p>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {mentor?.bio || "Mentorship style is hands-on, focusing on bridging the gap between theoretical computer science and commercial product implementation."}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-gray-50 flex flex-wrap gap-8 items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-5 h-5 ${i <= (mentor?.rating || 5) ? 'fill-orange-500 text-orange-500' : 'text-gray-300'}`} />)}
                                    </div>
                                    <span className="font-black text-gray-900">{mentor?.rating || 5}/5 Rating</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 font-bold">
                                    <Users className="w-5 h-5 text-orange-500" />
                                    <span>Mentored {mentor?.assignedStudents?.length ?? mentor?.students ?? 0} students</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-orange-50 border border-orange-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white rounded-2xl shadow-sm">
                                <Award className="w-8 h-8 text-orange-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-black text-gray-900">Your Connection</h4>
                                <p className="text-sm text-gray-500 font-medium">Assigned as your Principal Mentor since {profile?.joinDate || "Enrollment"}.</p>
                            </div>
                        </div>
                        <Button onClick={() => setIsHistoryOpen(true)} variant="ghost" className="text-orange-600 font-black hover:bg-orange-100 h-12 px-6 rounded-2xl gap-2 font-montserrat tracking-tight">
                            View Mentorship History <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>

            {/* Mentor Calendar Dialog */}
            <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col overflow-hidden rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Mentor Availability</DialogTitle>
                        <DialogDescription className="font-medium text-gray-500">
                            Upcoming available slots for {mentor?.name || "your mentor"}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4 overflow-y-auto pr-2 -mr-2">
                        {calendarDays.map((day, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border ${day.isAvailable ? 'bg-orange-50/50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${day.isAvailable ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-gray-200 text-gray-400'}`}>
                                        <span className="text-[10px] font-bold uppercase">{format(day.date, 'MMM')}</span>
                                        <span className="text-lg font-black leading-none">{format(day.date, 'd')}</span>
                                    </div>
                                    <div>
                                        <h4 className={`font-black ${day.isAvailable ? 'text-orange-900' : 'text-gray-500'}`}>{format(day.date, 'EEEE')}</h4>
                                        <p className="text-sm font-medium text-gray-500">{day.timeSlot || "Unavailable"}</p>
                                    </div>
                                </div>
                                {day.isAvailable && (
                                    <Button 
                                        size="sm"
                                        onClick={() => {
                                            setSessionDate(format(day.date, 'yyyy-MM-dd'));
                                            setSessionTime(day.startTime || "10:00");
                                            setIsCalendarOpen(false);
                                            setIsSessionOpen(true);
                                        }}
                                        className="bg-orange-100 text-orange-600 hover:bg-orange-200 font-bold rounded-xl"
                                    >
                                        Book
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Mentorship History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col overflow-hidden rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Mentorship History</DialogTitle>
                        <DialogDescription className="font-medium text-gray-500">
                            Your past sessions and interactions with your mentor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 overflow-y-auto pr-2 -mr-2">
                        {isHistoryLoading ? (
                            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
                        ) : sessionHistoryData?.data?.length > 0 ? (
                            sessionHistoryData.data.map((session: any) => (
                                <div key={session.id} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={session.status === 'COMPLETED' ? 'default' : 'secondary'} className={session.status === 'COMPLETED' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}>
                                                    {session.status}
                                                </Badge>
                                                <span className="text-xs font-bold text-gray-400 uppercase">{format(new Date(session.date), 'MMM d, yyyy')}</span>
                                            </div>
                                            <h4 className="font-black text-gray-900 text-lg">{session.topic}</h4>
                                        </div>
                                    </div>
                                    {session.notes && session.notes.length > 0 && (
                                        <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
                                            <p className="text-sm font-medium text-gray-700">
                                                <span className="font-bold text-orange-800">Notes: </span> 
                                                {session.notes[0].content}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="font-black text-gray-900">No Past Sessions</h3>
                                <p className="text-sm text-gray-500 mt-1">You haven't completed any sessions yet.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
