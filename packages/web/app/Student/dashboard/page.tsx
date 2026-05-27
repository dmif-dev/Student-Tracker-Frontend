"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    BarChart3,
    Users,
    FileText,
    Activity,
    Search,
    Calendar as CalendarIcon,
    Filter,
    LayoutGrid,
    List,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    ChevronRight,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    Hash,
    Paperclip,
    ArrowRight,
    UploadCloud,
    CheckCircle,
    TrendingUp,
    Loader2,
    X,
    History,
    Target,
    Video
} from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, startOfToday, isWithinInterval, parse, startOfWeek, getDay } from "date-fns";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";

// --- Calendar Setup ---
const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// --- Mock Data ---
interface StatCard {
    title: string;
    value: string;
    trend: number;
    icon: React.ReactNode;
}

interface ActivityItem {
    id: string;
    type: "upload" | "report" | "status" | "alert";
    user: string;
    description: string;
    timestamp: Date;
}

interface ProgressEntry {
    id: string;
    title: string;
    studentId: string;
    subject: string;
    topic: string;
    score: number;
    date: Date;
    status: "completed" | "pending";
}

const MOCK_ENTRIES: ProgressEntry[] = [
    { id: "1", title: "Configuring BGP for Enterprise", studentId: "MY-STUDY", subject: "Networking", topic: "BGP", score: 92, date: new Date(), status: "completed" },
    { id: "2", title: "Ansible Playbook Automation", studentId: "MY-STUDY", subject: "Automation", topic: "Ansible", score: 85, date: subDays(new Date(), 1), status: "completed" },
    { id: "3", title: "Securing JWT Auth in Node.js", studentId: "MY-STUDY", subject: "Security", topic: "Web Security", score: 78, date: subDays(new Date(), 2), status: "pending" },
    { id: "4", title: "Kubernetes Cluster Setup", studentId: "MY-STUDY", subject: "Cloud Computing", topic: "K8s", score: 88, date: subDays(new Date(), 3), status: "completed" },
    { id: "5", title: "DB Indexing Optimization", studentId: "MY-STUDY", subject: "Databases", topic: "PostgreSQL", score: 95, date: subDays(new Date(), 4), status: "completed" },
    { id: "6", title: "React Performance Tuning", studentId: "MY-STUDY", subject: "Frontend", topic: "React", score: 65, date: subDays(new Date(), 5), status: "pending" },
];

const MOCK_ACTIVITIES: ActivityItem[] = [
    { id: "a1", type: "status", user: "You", description: "Marked 'Networking Lab 4' as completed. High proficiency achieved.", timestamp: new Date() },
    { id: "a2", type: "report", user: "System", description: "Weekly skill breakdown for 'Cloud Computing' is ready for review.", timestamp: subDays(new Date(), 1) },
    { id: "a3", type: "upload", user: "You", description: "Uploaded project documentation for 'Security Audit' (Draft 1).", timestamp: subDays(new Date(), 1) },
    { id: "a4", type: "alert", user: "Coach", description: "Your average score in 'Frontend' dropped. Recommendation: Review Redux state management.", timestamp: subDays(new Date(), 2) },
];

// --- Mock Data moved to state inside component ---

const INITIAL_MOCK_EVENTS = [
    { id: 1, title: "React Performance Class", start: new Date(2026, 2, 3, 10, 0), end: new Date(2026, 2, 3, 11, 30), link: "https://zoom.it/react-class" },
    { id: 2, title: "Database Schema Design Quiz", start: new Date(2026, 2, 4, 14, 0), end: new Date(2026, 2, 4, 15, 0), link: "#" },
    { id: 3, title: "Submit Final Capstone Draft", start: new Date(2026, 2, 6, 9, 0), end: new Date(2026, 2, 6, 17, 0), link: "#" },
    { id: 4, title: "Mentorship Live Session", start: new Date(2026, 2, 5, 16, 0), end: new Date(2026, 2, 5, 17, 30), link: "https://meet.google.com/abc-defg-hij" },
    { id: 5, title: "Cloud Architecture Test", start: new Date(2026, 2, 10, 11, 0), end: new Date(2026, 2, 10, 12, 30), link: "#" },
    { id: 6, title: "System Design Workshop", start: new Date(2026, 2, 8, 13, 0), end: new Date(2026, 2, 8, 15, 0), link: "https://teams.microsoft.com/l/meetup-join" },
];




export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [viewType, setViewType] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "topic">("newest");
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    // Calendar States
    const [events, setEvents] = useState(INITIAL_MOCK_EVENTS);
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        date: new Date(),
        startTime: "10:00",
        endTime: "11:00",
        link: ""
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    // Filtered and Sorted Data
    const filteredEntries = useMemo(() => {
        let result = MOCK_ENTRIES.filter(entry =>
            (entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.studentId.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (!dateRange.from || !dateRange.to || isWithinInterval(entry.date, { start: dateRange.from, end: dateRange.to }))
        );

        if (sortOrder === "newest") result.sort((a, b) => b.date.getTime() - a.date.getTime());
        else if (sortOrder === "oldest") result.sort((a, b) => a.date.getTime() - b.date.getTime());
        else if (sortOrder === "topic") result.sort((a, b) => a.topic.localeCompare(b.topic));

        return result;
    }, [searchQuery, sortOrder, dateRange]);

    const stats: StatCard[] = [
        { title: "Skills Gained", value: "32", trend: 12.5, icon: <Activity className="h-5 w-5 text-primary" /> },
        { title: "Learning Hours", value: "245h", trend: 8.2, icon: <Clock className="h-5 w-5 text-primary" /> },
        { title: "Completed Projects", value: "18", trend: 4.1, icon: <FileText className="h-5 w-5 text-primary" /> },
        { title: "Average Proficiency", value: "88%", trend: 2.0, icon: <BarChart3 className="h-5 w-5 text-primary" /> },
    ];

    const handleAddEvent = () => {
        if (!newEvent.title) {
            toast.error("Please enter an event title");
            return;
        }

        const [startH, startM] = newEvent.startTime.split(":").map(Number);
        const [endH, endM] = newEvent.endTime.split(":").map(Number);

        const startDate = new Date(newEvent.date);
        startDate.setHours(startH, startM);

        const endDate = new Date(newEvent.date);
        endDate.setHours(endH, endM);

        const addedEvent = {
            id: events.length + 1,
            title: newEvent.title,
            start: startDate,
            end: endDate,
            link: newEvent.link || "#"
        };

        setEvents([...events, addedEvent]);
        setIsAddEventOpen(false);
        setNewEvent({ title: "", date: new Date(), startTime: "10:00", endTime: "11:00", link: "" });
        toast.success("Event added successfully");
    };

    if (isLoading) {
        return (
            <div className="space-y-8 p-6">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-[400px] w-full rounded-2xl" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-[400px] w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight font-montserrat">My Personal Dashboard</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Visualize your technical growth and upcoming milestones.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/Student/my-stats#contribution-graph">
                        <Button variant="outline" className="font-montserrat font-bold border-orange-200 text-orange-600 hover:bg-orange-50">
                            <History className="mr-2 h-4 w-4" /> View History
                        </Button>
                    </Link>
                    <Link href="/Student/progress/new">
                        <Button className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20">
                            <Plus className="mr-2 h-4 w-4" /> Enter Daily Progress
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-md bg-card/50 backdrop-blur-sm transition-all hover:translate-y-[-4px] hover:shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-2xl bg-primary/10">
                                    {stat.icon}
                                </div>
                                <div className={cn(
                                    "flex items-center text-xs font-bold",
                                    stat.trend > 0 ? "text-green-500" : "text-red-500"
                                )}>
                                    {stat.trend > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                    {Math.abs(stat.trend)}%
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground font-montserrat uppercase tracking-wider">{stat.title}</p>
                                <p className="text-3xl font-extrabold tracking-tighter">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Global Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-card/30 p-2 rounded-2xl border border-border/50 backdrop-blur-xs">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search entries, student IDs, or topics..."
                        className="pl-10 border-none bg-transparent focus-visible:ring-0 text-md"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 pr-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-10 px-4 font-semibold gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                                initialFocus
                                mode="range"
                                selected={{ from: dateRange.from, to: dateRange.to }}
                                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-10 px-4 font-semibold gap-2">
                                <Filter className="h-4 w-4" />
                                Sort: {sortOrder === "newest" ? "Newest" : sortOrder === "oldest" ? "Oldest" : "Topic"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSortOrder("newest")}>Date: Newest</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOrder("oldest")}>Date: Oldest</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOrder("topic")}>Topic (A-Z)</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex bg-muted p-1 rounded-lg">
                        <Button
                            size="icon"
                            variant={viewType === "grid" ? "secondary" : "ghost"}
                            className="h-8 w-8 rounded-md"
                            onClick={() => setViewType("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant={viewType === "list" ? "secondary" : "ghost"}
                            className="h-8 w-8 rounded-md"
                            onClick={() => setViewType("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>


            <Tabs defaultValue="calendar" className="space-y-8">
                <TabsList className="bg-transparent gap-6 p-0 h-auto">
                    <TabsTrigger value="calendar" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2 shadow-sm border">Calendar View</TabsTrigger>
                    <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 py-2 shadow-sm border">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="m-0">
                    <Card className="rounded-2xl shadow-xl border-none overflow-hidden bg-card/70 backdrop-blur-md">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-4xl font-extrabold tracking-tight font-montserrat text-gray-900">Schedule & Events</CardTitle>
                                    <CardDescription className="text-muted-foreground mt-2 text-lg">Track student exams, meetings, and project deadlines.</CardDescription>
                                </div>
                                <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">Add Event</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px] rounded-[32px]">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-extrabold">Add New Event</DialogTitle>
                                            <DialogDescription>
                                                Create a new manual entry for your schedule.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-6 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider">Event Title</Label>
                                                <Input
                                                    id="title"
                                                    placeholder="e.g., Project Discussion"
                                                    value={newEvent.title}
                                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                                    className="rounded-xl border-neutral-200 h-10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold uppercase tracking-wider text-neutral-500">Event Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-bold rounded-xl h-10 bg-neutral-50 border-neutral-200",
                                                                !newEvent.date && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4 text-orange-500" />
                                                            {newEvent.date ? format(newEvent.date, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={newEvent.date}
                                                            onSelect={(date) => date && setNewEvent({ ...newEvent, date })}
                                                            initialFocus
                                                            className="p-3"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="startTime" className="text-sm font-bold uppercase tracking-wider text-neutral-500">Start Time</Label>
                                                    <Input
                                                        id="startTime"
                                                        type="time"
                                                        value={newEvent.startTime}
                                                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                                        className="rounded-xl border-neutral-200 h-10"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="endTime" className="text-sm font-bold uppercase tracking-wider text-neutral-500">End Time</Label>
                                                    <Input
                                                        id="endTime"
                                                        type="time"
                                                        value={newEvent.endTime}
                                                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                                        className="rounded-xl border-neutral-200 h-10"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="link" className="text-sm font-bold uppercase tracking-wider text-neutral-500">Meeting Link (Optional)</Label>
                                                <Input
                                                    id="link"
                                                    placeholder="Invite link or URL (Meeting link, portal, etc.)"
                                                    value={newEvent.link}
                                                    onChange={(e) => setNewEvent({ ...newEvent, link: e.target.value })}
                                                    className="rounded-xl border-neutral-200 h-10"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" onClick={handleAddEvent} className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl h-11 font-bold shadow-lg shadow-orange-500/20">
                                                Create Event
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="h-[700px] font-sans">
                                <Calendar
                                    localizer={localizer}
                                    events={events}
                                    startAccessor="start"
                                    endAccessor="end"
                                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                                    defaultView={Views.MONTH}
                                    className="rounded-xl border-none custom-calendar"
                                    components={{
                                        event: ({ event }: any) => (
                                            <div className="flex items-center justify-between w-full h-full px-1 py-0.5">
                                                <span className="truncate">{event.title}</span>
                                                {event.link && event.link !== "#" && (
                                                    <a
                                                        href={event.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="hover:text-amber-200 transition-colors shrink-0 ml-1"
                                                        title="Join Meeting"
                                                    >
                                                        <Video className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        )
                                    }}
                                    eventPropGetter={(event) => ({
                                        className: "bg-primary border-none text-white rounded-lg font-bold text-xs shadow-sm overflow-hidden",
                                    })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reports" className="m-0">
                    <div className="flex flex-col items-center justify-center p-20 bg-muted/20 border-2 border-dashed rounded-3xl">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold font-montserrat">Reports Module Not Loaded</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm text-center">
                            The analytics engine is currently processing new data. Check back in a few minutes for real-time charts.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>

            <style jsx global>{`
        .rbc-calendar {
          font-family: var(--font-inter), sans-serif;
        }
        .rbc-header {
          padding: 12px 0;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
          color: hsl(var(--muted-foreground));
          border-bottom: 2px solid hsl(var(--border));
        }
        .rbc-off-range-bg {
          background-color: transparent;
        }
        .rbc-today {
          background-color: hsl(var(--primary) / 0.05);
        }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
          border: none;
        }
        .rbc-event {
          background-color: hsl(var(--primary));
          border-radius: 6px;
          margin-top: 2px;
        }
        .rbc-toolbar button {
          font-family: var(--font-montserrat), sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          border-radius: 50px;
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border)) !important;
          margin: 0 4px;
          padding: 6px 16px;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover {
          background-color: hsl(var(--primary) / 0.1) !important;
          color: hsl(var(--primary));
          border-color: hsl(var(--primary)) !important;
        }
        .rbc-toolbar button.rbc-active {
          background-color: hsl(var(--primary)) !important;
          color: white !important;
          box-shadow: 0 4px 12px hsl(var(--primary) / 0.25);
        }
        .rbc-toolbar-label {
          font-family: var(--font-montserrat), sans-serif;
          font-weight: 800;
          font-size: 1.25rem;
        }
      `}</style>
            <Toaster richColors position="top-right" />
        </div>
    );
}
