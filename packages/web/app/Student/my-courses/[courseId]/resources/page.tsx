"use client";
import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    BookOpen,
    FileCheck,
    ArrowLeft,
    Download,
    ExternalLink,
    Search,
    Filter,
    Clock,
    ChevronRight,
    LayoutGrid,
    List
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

import { useStudentProfile, useStudentDocuments } from "@/hooks/api/useStudent";
import { formatDistanceToNow } from "date-fns";

// --- Formatter for file size ---
const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const RESOURCE_CATEGORIES = [
    { id: "all", label: "All Resources", icon: null },
    { id: "pre-reading", label: "Pre-Reading", icon: <BookOpen className="w-4 h-4" /> },
    { id: "learning", label: "Learning", icon: <FileText className="w-4 h-4" /> },
    { id: "assignments", label: "Assignments", icon: <FileCheck className="w-4 h-4" /> },
];

const ResourceCard = ({ resource, index }: { resource: any; index: number }) => {
    const iconMap: Record<string, any> = {
        "pre-reading": <BookOpen className="w-5 h-5 text-blue-500" />,
        "learning": <FileText className="w-5 h-5 text-orange-500" />,
        "assignments": <FileCheck className="w-5 h-5 text-emerald-500" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-2xl hover:shadow-orange-100/30 hover:border-orange-100 transition-all duration-500"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                    resource.category === "pre-reading" ? "bg-blue-50" :
                        resource.category === "learning" ? "bg-orange-50" : "bg-emerald-50"
                )}>
                    {iconMap[resource.category]}
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        {resource.type} • {resource.size}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {resource.title}
                </h3>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-medium">{resource.time}</span>
                </div>
                <span className="text-xs font-bold text-gray-300">{resource.date}</span>
            </div>
        </motion.div>
    );
};

function TrackResourcesPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const trackName = searchParams.get("track") || "AI Product Development";
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: profile } = useStudentProfile();
    const programName = profile?.program?.name || profile?.programName;
    const trackNameReal = profile?.track?.name || profile?.trackName || trackName;

    const { data: documentsData, isLoading } = useStudentDocuments(programName, trackNameReal);

    const documents = React.useMemo(() => {
        if (!documentsData) return [];
        return documentsData.map((doc: any) => {
            let category = "learning";
            if (doc.type === "PRE_READING_MATERIAL") category = "pre-reading";
            if (doc.type === "ASSIGNMENT_MATERIAL") category = "assignments";

            return {
                id: doc.id,
                title: doc.title,
                category,
                type: doc.fileType?.split('/').pop()?.toUpperCase() || 'FILE',
                size: formatBytes(doc.fileSize),
                time: doc.metadata?.duration || "15 mins",
                date: new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };
        });
    }, [documentsData]);

    const filteredResources = documents.filter((res: any) => {
        const matchesCategory = selectedCategory === "all" || res.category === selectedCategory;
        const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-100/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10" />

            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href={`/Student/my-courses/${params.courseId}`}
                            className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 transition-all group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">RESOURCE HUB</span>
                                <ChevronRight className="w-3 h-3 text-gray-300" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                    {trackName}
                                </span>
                            </div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">Digital Library</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-12 gap-12">
                    {/* Sidebar Filters */}
                    <div className="col-span-12 lg:col-span-3 space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-2">Categories</h3>
                            <nav className="space-y-1">
                                {RESOURCE_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                            selectedCategory === cat.id
                                                ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                                                : "text-gray-500 hover:bg-white hover:shadow-sm"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {cat.icon}
                                            {cat.label}
                                        </div>
                                        {selectedCategory === cat.id && <motion.div layoutId="active" className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6 rounded-2xl bg-orange-600 text-white space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                            <h4 className="text-lg font-black leading-tight">Need Help with Assignments?</h4>
                            <p className="text-orange-100 text-xs font-medium leading-relaxed">Schedule a quick 15-min sync with your mentor for any blockers.</p>
                            <Link href="/Student/mentor-details" className="w-full">
                                <button className="w-full py-3 bg-white text-orange-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-colors">
                                    BOOK SYNC
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Resource Grid */}
                    <div className="col-span-12 lg:col-span-9 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {RESOURCE_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                                </h2>
                                <p className="text-sm font-medium text-gray-500">Showing {filteredResources.length} resources for this track</p>
                            </div>
                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                <button className="p-2 rounded-md bg-white shadow-sm text-gray-900"><LayoutGrid className="w-4 h-4" /></button>
                                <button className="p-2 rounded-md text-gray-400"><List className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredResources.map((res: any, i: number) => (
                                    <ResourceCard key={res.id} resource={res} index={i} />
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredResources.length === 0 && (
                            <div className="py-32 text-center space-y-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                    <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-gray-900">No resources found</p>
                                    <p className="text-sm text-gray-500">Try adjusting your search or category filters.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function TrackResourcesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        }>
            <TrackResourcesPageContent />
        </Suspense>
    );
}

