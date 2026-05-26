"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isPast, startOfToday } from "date-fns";
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
    Brain,
    Target,
    Award
} from "lucide-react";
import { toast, Toaster } from "sonner";
import {
    Plus,
    X,
    UploadCloud,
    Trash2,
    FileText,
    History
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@student-tracker/shared/hooks/useLocalStorage";

// Components
import { RichTextEditor } from "@/components/forms/rich-text-editor";
import { TopicSelect } from "@/components/forms/topic-select";
import { ImageUpload } from "@/components/forms/image-upload";
import LoaderOne from "@/components/ui/loader-one";

const formSchema = z.object({
    title: z.string().min(5, "General title for today's entry is required"),
    date: z.date(),
    entries: z.array(z.object({
        studentId: z.string().min(1, "Student ID is required"),
        programTrack: z.string().min(1, "Program Track is required"),
        topic: z.string().min(1, "Topic title is required"),
        content: z.string().min(10, "Content must be at least 10 characters"),
        file: z.any().optional(),
        fileName: z.string().optional(),
    })).min(1, "At least one topic entry is required"),
});

type FormValues = z.infer<typeof formSchema>;

const DRAFT_KEY = "progress_entry_draft";

const PROGRAM_TRACKS = {
    "G-GMP": "Global Guided Mentorship Program",
    "G-CMP": "Global Coding Mentorship Program",
    "E-TIP": "Executive Technology Immersion Program",
    "PCP": "Professional Certification Program",
};

export default function ProgressPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDraftPrompt, setShowDraftPrompt] = useState(false);
    const [draft, setDraft] = useLocalStorage<FormValues | null>(DRAFT_KEY, null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isValid },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            date: new Date(),
            entries: [{ studentId: "", programTrack: "", topic: "", content: "" }],
        },
        mode: "onBlur",
    });

    const entries = watch("entries");

    const addEntry = () => {
        setValue("entries", [...entries, { studentId: "", programTrack: "", topic: "", content: "" }]);
    };

    const removeEntry = (index: number) => {
        if (entries.length > 1) {
            const newEntries = [...entries];
            newEntries.splice(index, 1);
            setValue("entries", newEntries);
        }
    };

    const formValues = watch();

    useEffect(() => {
        if (draft && Object.values(draft).some(v => v && (Array.isArray(v) ? v.length > 0 : true))) {
            setShowDraftPrompt(true);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isValid || Object.values(formValues).some(v => v && (Array.isArray(v) ? v.length > 0 : true))) {
                const hasData = Object.entries(formValues).some(([key, val]) => {
                    if (key === 'date') return false;
                    if (Array.isArray(val)) return val.length > 0;
                    return !!val;
                });
                if (hasData) {
                    setDraft(formValues);
                }
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [formValues, isValid, setDraft]);

    const restoreDraft = () => {
        if (draft) {
            const restored = { ...draft, date: new Date(draft.date) };
            reset(restored);
            toast.success("Draft restored successfully!");
        }
        setShowDraftPrompt(false);
    };

    const discardDraft = () => {
        setDraft(null);
        setShowDraftPrompt(false);
        toast.info("Draft discarded.");
    };

    const onSubmit = async (values: FormValues) => {
        setIsSubmitting(true);

        try {
            // Mock API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            toast.success("🎉 All daily topics recorded successfully!");
            setDraft(null);
            reset({
                title: "",
                date: new Date(),
                entries: [{ studentId: "", programTrack: "", topic: "", content: "" }],
            });
        } catch (error) {
            toast.error("Failed to publish entries. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/20 to-white">
            <Toaster position="top-right" richColors />

            <div className="space-y-8 pb-20 px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-8">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight font-montserrat text-gray-900">Log Progress</h1>
                        <p className="text-muted-foreground mt-2 text-lg text-gray-600">
                            Record your technical learning journey and project milestones.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                reset();
                                setDraft(null);
                                toast.info("Form cleared.");
                            }}
                            className="text-xs border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                            <RotateCcw className="mr-2 h-3.5 w-3.5" />
                            Reset Form
                        </Button>
                    </div>
                </div>

                {/* Draft Prompt */}
                {showDraftPrompt && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            <p className="text-sm font-medium text-orange-900">You have an unsaved draft from a previous session.</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="ghost" onClick={discardDraft}>Discard</Button>
                            <Button size="sm" onClick={restoreDraft} className="bg-orange-500 hover:bg-orange-600">Restore Draft</Button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Session Information Section */}
                        <div className="bg-white border-2 border-orange-100 rounded-3xl p-8 shadow-sm space-y-8">
                            <h2 className="text-xl font-bold font-montserrat flex items-center gap-2">
                                <Target className="h-5 w-5 text-orange-500" />
                                Session Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="title" className="text-sm font-bold font-montserrat text-gray-900 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-orange-500" />
                                        Entry Session Title
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Daily Progress for AI Module..."
                                        {...register("title")}
                                        className={cn("h-12 text-lg font-semibold border-gray-200 focus:border-orange-500", errors.title && "border-red-500")}
                                    />
                                    {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-bold font-montserrat text-gray-700">Session Date</Label>
                                    <Controller
                                        name="date"
                                        control={control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full h-11 justify-start font-bold border-gray-100">
                                                        <CalendarIcon className="mr-2 h-4 w-4 text-orange-500" />
                                                        {format(field.value, "PPP")}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-none shadow-2xl" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Dynamics Topics Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-bold font-montserrat flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-orange-500" />
                                    Learning Progress ({entries.length})
                                </h2>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addEntry}
                                    className="border-orange-200 text-orange-600 hover:bg-orange-50 font-bold px-6 rounded-xl h-10 transition-all active:scale-95"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Topic
                                </Button>
                            </div>

                            {entries.map((entry, index) => (
                                <div key={index} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-6 relative animate-in fade-in slide-in-from-bottom-4">
                                    {entries.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeEntry(index)}
                                            className="absolute top-6 right-6 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    )}

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Student ID</Label>
                                                <Input
                                                    placeholder="e.g., STU-123"
                                                    {...register(`entries.${index}.studentId` as const)}
                                                    className="h-11 font-bold border-gray-100 bg-gray-50/50 focus:bg-white"
                                                />
                                                {errors.entries?.[index]?.studentId && <p className="text-[10px] text-red-500 font-bold">{errors.entries[index].studentId?.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Program Track</Label>
                                                <select
                                                    {...register(`entries.${index}.programTrack` as const)}
                                                    className="w-full h-11 rounded-lg border border-gray-100 bg-gray-50/50 px-3 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 outline-none"
                                                >
                                                    <option value="">Select track...</option>
                                                    {Object.entries(PROGRAM_TRACKS).map(([code, name]) => (
                                                        <option key={code} value={code}>{code}</option>
                                                    ))}
                                                </select>
                                                {errors.entries?.[index]?.programTrack && <p className="text-[10px] text-red-500 font-bold">{errors.entries[index].programTrack?.message}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-gray-50">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Topic name</Label>
                                            <Input
                                                placeholder="What did you learn/build?"
                                                {...register(`entries.${index}.topic` as const)}
                                                className="h-11 font-bold border-gray-100 bg-gray-50/50 focus:bg-white"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description & Progress</Label>
                                            <Controller
                                                name={`entries.${index}.content` as const}
                                                control={control}
                                                render={({ field }) => (
                                                    <RichTextEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Detailed notes, code findings, and results..."
                                                        error={!!errors.entries?.[index]?.content}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Submission / Evidence</Label>
                                            <div className="flex items-center gap-4">
                                                <div
                                                    onClick={() => document.getElementById(`file-${index}`)?.click()}
                                                    className={cn(
                                                        "flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all",
                                                        entries[index].fileName ? "bg-orange-50 border-orange-200 shadow-sm" : "bg-gray-50/30 border-gray-200 hover:bg-gray-50 hover:border-orange-300"
                                                    )}
                                                >
                                                    <input
                                                        type="file"
                                                        id={`file-${index}`}
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setValue(`entries.${index}.file`, file);
                                                                setValue(`entries.${index}.fileName`, file.name);
                                                            }
                                                        }}
                                                    />
                                                    {entries[index].fileName ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-orange-500 rounded-lg text-white">
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{entries[index].fileName}</p>
                                                                <p className="text-[10px] text-orange-600 font-bold uppercase">Ready for submission</p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setValue(`entries.${index}.file`, undefined);
                                                                    setValue(`entries.${index}.fileName`, "");
                                                                }}
                                                                className="h-8 w-8 text-gray-400 hover:text-red-500 ml-auto"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                                                            <p className="text-sm font-bold text-gray-600">Click to upload file</p>
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">PDF, ZIP, JPG, PNG</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={addEntry}
                                className="w-full py-12 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50/30 transition-all font-bold flex flex-col gap-2 group"
                            >
                                <Plus className="h-10 w-10 transition-transform group-hover:scale-110" />
                                Add Another Task / Topic
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar Submission */}
                    <div className="space-y-6">
                        <div className="bg-white border-2 border-orange-100 rounded-3xl p-8 shadow-lg space-y-8 sticky top-24">
                            <div className="space-y-4">
                                <Label className="text-sm font-bold uppercase tracking-widest text-gray-500">Submission Summary</Label>

                                <Card className="border-none bg-orange-50/50 p-4 rounded-2xl shadow-none">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-bold uppercase">Total Tasks</span>
                                            <span className="text-orange-600 font-extrabold">{entries.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-500 font-bold uppercase">Date</span>
                                            <span className="text-orange-600 font-extrabold">{format(watch("date"), "MMM dd, yyyy")}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !isValid}
                                    className="w-full py-8 text-lg font-extrabold bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20 rounded-2xl transition-all active:scale-[0.98]"
                                >
                                    {isSubmitting ? <span className="scale-75"><LoaderOne /></span> : (
                                        <div className="flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Submit Entries
                                        </div>
                                    )}
                                </Button>
                                <div className="flex items-center justify-center gap-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                                    <History className="h-3 w-3" />
                                    Continuous Auto-save Active
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}