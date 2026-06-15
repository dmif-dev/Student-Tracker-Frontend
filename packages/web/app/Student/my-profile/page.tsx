"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiService } from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Github,
    Globe,
    Edit,
    Save,
    X,
    Award,
    Briefcase,
    BookOpen,
    Users,
    Calendar,
    TrendingUp,
    Brain,
    Target,
    Sparkles,
    CheckCircle2,
    Clock,
    FileText,
    Zap,
    ArrowRight,
    Camera,
    Loader2,
    Trash2
} from "lucide-react";

interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    avatar: string;
    removeAvatar?: boolean;
    studentId: string;
    joinDate: string;
    programTrack: "G-GMP" | "G-CMP" | "E-TIP" | "PCP";
    mentor: string;
    mentorEmail: string;
    mentorDetails?: any;
    website?: string;
    linkedin?: string;
    github?: string;
    stats: {
        patentsCreated: number;
        paperPublished: number;
        productDeployed: number;
        venturesStarted: number;
        brainScore: number;
        mentorshipSessions: number;
    };
}

const defaultProfile: UserProfile = {
    id: "STU-2024-042",
    studentId: "cuid-placeholder",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@dmifstudent.org",
    phone: "+91 8765432109",
    location: "Mumbai, Maharashtra",
    bio: "Full-stack innovator passionate about AI-assisted development and creating products that solve real-world problems. Currently working on EdTech venture with focus on brain empowerment through gamified learning. Mentored by Dr. Maxx for the past 8 months. Believe in continuous learning and turning ideas into impactful outcomes.",
    avatar: "/assets/student-profile.jpg",
    joinDate: "June 2024",
    programTrack: "G-GMP",
    mentor: "Dr. Smith",
    mentorEmail: "smith@dmif.org",
    website: "https://smith.innovation.dev",
    linkedin: "https://linkedin.com/in/smith-innovation",
    github: "https://github.com/smith-innovation-hub",
    stats: {
        patentsCreated: 4,
        paperPublished: 5,
        productDeployed: 4,
        venturesStarted: 2,
        brainScore: 78,
        mentorshipSessions: 24,
    }
};

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserProfile>(defaultProfile);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    
    const queryClient = useQueryClient();

    const { data: profile = defaultProfile, isLoading } = useQuery<UserProfile>({
        queryKey: ['studentProfile'],
        queryFn: async () => {
            try {
                const data = await ApiService.getStudentProfile();
                return data || defaultProfile;
            } catch (error) {
                console.error("Failed to load profile:", error);
                toast.error("Failed to load profile data. Using default data for now.");
                return defaultProfile;
            }
        }
    });

    const updateMutation = useMutation({
        mutationFn: (updates: Partial<UserProfile>) => ApiService.updateStudentProfile(updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
            setIsEditing(false);
            toast.success("Profile updated successfully.");
        },
        onError: (error) => {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile. Please try again later.");
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditClick = () => {
        setFormData(profile);
        setSelectedAvatarFile(null);
        setPreviewAvatar(null);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (selectedAvatarFile) {
            setUploadingAvatar(true);
            const data = new FormData();
            data.append('avatar', selectedAvatarFile);
            try {
                const response = await ApiService.uploadStudentAvatar(data);
                if (response.avatar) {
                    setFormData(prev => ({ ...prev, avatar: response.avatar }));
                }
            } catch (err) {
                console.error("Avatar upload failed", err);
                toast.error("Failed to upload avatar");
            } finally {
                setUploadingAvatar(false);
            }
        }

        updateMutation.mutate({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio,
            website: formData.website,
            linkedin: formData.linkedin,
            github: formData.github,
            removeAvatar: formData.removeAvatar
        });
    };

    const handleCancel = () => {
        setFormData(profile);
        setSelectedAvatarFile(null);
        setPreviewAvatar(null);
        setIsEditing(false);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedAvatarFile(file);
        setPreviewAvatar(URL.createObjectURL(file));
        setFormData(prev => ({ ...prev, removeAvatar: false }));
    };

    const handleRemoveAvatar = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFormData(prev => ({ ...prev, removeAvatar: true }));
        setSelectedAvatarFile(null);
        setPreviewAvatar(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getAvatarUrl = (path: string | undefined | null) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/api\/?$/, '') || 'http://localhost:4000';
        return `${apiUrl}/api/student/${profile?.studentId}/avatar?v=${encodeURIComponent(path)}`;
    };

    const getMentorAvatarUrl = (path: string | undefined | null, mentorId: string | undefined | null) => {
        if (!path || !mentorId) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/api\/?$/, '') || 'http://localhost:4000';
        return `${apiUrl}/api/mentor/${mentorId}/avatar?v=${encodeURIComponent(path)}`;
    };

    const PROGRAM_TRACKS = {
        "G-GMP": "Global Guided Mentorship Program",
        "G-CMP": "Global Coding Mentorship Program",
        "E-TIP": "Executive Technology Immersion Program",
        "PCP": "Professional Certification Program",
    };

    const displayProfile = isEditing ? formData : profile;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                <p className="text-gray-500 font-medium">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Premium Header Background */}
            <div className="relative overflow-hidden border-b border-gray-200/50 bg-gradient-to-br from-white via-orange-50/40 to-white">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                        {/* Avatar Section */}
                        <div className={`relative w-32 h-32 ${isEditing ? 'group' : ''}`}>
                            <div 
                                className={`w-full h-full relative ${isEditing ? 'cursor-pointer' : ''}`}
                                onClick={() => isEditing && fileInputRef.current?.click()}
                            >
                                <Avatar className="h-32 w-32 border-4 border-orange-200 shadow-xl">
                                    <AvatarImage 
                                        src={
                                            formData.removeAvatar ? undefined : 
                                            previewAvatar ? previewAvatar : 
                                            getAvatarUrl(displayProfile.avatar) || undefined
                                        } 
                                        alt={displayProfile.firstName} 
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl font-bold">
                                        {displayProfile.firstName.charAt(0)}{displayProfile.lastName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>

                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                        {uploadingAvatar ? (
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        ) : (
                                            <>
                                                <Camera className="w-8 h-8 mb-1" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Upload</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isEditing && !formData.removeAvatar && (previewAvatar || displayProfile.avatar) && (
                                <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    className="absolute bottom-0 right-0 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                                    title="Remove avatar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleAvatarChange}
                                accept="image/*"
                                className="hidden" 
                            />
                        </div>

                        {/* Profile Header Info */}
                        <div className="flex-1 space-y-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-black text-gray-900">
                                        {displayProfile.firstName} {displayProfile.lastName}
                                    </h1>
                                    <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold">
                                        {displayProfile.id}
                                    </Badge>
                                </div>
                                <p className="text-lg text-gray-600">{PROGRAM_TRACKS[displayProfile.programTrack]}</p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                    <span>Joined {displayProfile.joinDate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4 text-orange-500" />
                                    <span>Mentored by {displayProfile.mentor}</span>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        {!isEditing ? (
                            <Button
                                onClick={handleEditClick}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">

                {/* Dynamic Telemetry Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="rounded-2xl border-gray-200/50 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <Award className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-gray-900">{profile.stats?.patentsCreated ?? 0}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Patents Filed</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border-gray-200/50 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <BookOpen className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-gray-900">{profile.stats?.paperPublished ?? 0}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Papers Published</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border-gray-200/50 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <Zap className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-gray-900">{profile.stats?.productDeployed ?? 0}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Products Deployed</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border-gray-200/50 shadow-sm p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-50 rounded-xl">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-gray-900">{profile.stats?.mentorshipSessions ?? 0}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mentoring Sessions</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Editable Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio Card */}
                        <Card className="rounded-2xl border-gray-200/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                            <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>

                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-orange-600" />
                                    About You
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="bio" className="text-sm font-bold">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                name="bio"
                                                value={formData.bio}
                                                onChange={handleInputChange}
                                                className="mt-2 rounded-lg border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 min-h-24"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact Information Card */}
                        <Card className="rounded-2xl border-gray-200/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                            <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>

                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-orange-600" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <>
                                            <div>
                                                <Label htmlFor="email" className="text-sm font-bold">Email</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="mt-2 rounded-lg border-gray-200 focus:border-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="phone" className="text-sm font-bold">Phone</Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="mt-2 rounded-lg border-gray-200 focus:border-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="location" className="text-sm font-bold">Location</Label>
                                                <Input
                                                    id="location"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    className="mt-2 rounded-lg border-gray-200 focus:border-orange-500"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-orange-500" />
                                                <span className="text-gray-700">{profile.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-orange-500" />
                                                <span className="text-gray-700">{profile.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <MapPin className="w-5 h-5 text-orange-500" />
                                                <span className="text-gray-700">{profile.location}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Social & Web Links */}
                        <Card className="rounded-2xl border-gray-200/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                            <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>

                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-orange-600" />
                                    Links & Social
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isEditing ? (
                                        <>
                                            <div>
                                                <Label htmlFor="website" className="text-sm font-bold">Website</Label>
                                                <Input
                                                    id="website"
                                                    name="website"
                                                    value={formData.website || ""}
                                                    onChange={handleInputChange}
                                                    placeholder="https://yoursite.com"
                                                    className="mt-2 rounded-lg border-gray-200 focus:border-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="linkedin" className="text-sm font-bold">LinkedIn</Label>
                                                <Input
                                                    id="linkedin"
                                                    name="linkedin"
                                                    value={formData.linkedin || ""}
                                                    onChange={handleInputChange}
                                                    placeholder="https://linkedin.com/in/yourprofile"
                                                    className="mt-2 rounded-lg border-gray-200 focus:border-orange-500"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="github" className="text-sm font-bold">GitHub</Label>
                                                <Input
                                                    id="github"
                                                    name="github"
                                                    value={formData.github || ""}
                                                    onChange={handleInputChange}
                                                    placeholder="https://github.com/yourprofile"
                                                    className="mt-2 rounded-lg border-gray-200 focus:border-orange-500"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-3">
                                            {profile.website && (
                                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                                                    <Globe className="w-5 h-5 text-orange-500" />
                                                    <span className="text-orange-700 font-medium text-sm">{profile.website}</span>
                                                    <ArrowRight className="w-4 h-4 ml-auto text-orange-500" />
                                                </a>
                                            )}
                                            {profile.linkedin && (
                                                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                                                    <Linkedin className="w-5 h-5 text-blue-600" />
                                                    <span className="text-blue-700 font-medium text-sm">LinkedIn Profile</span>
                                                    <ArrowRight className="w-4 h-4 ml-auto text-blue-600" />
                                                </a>
                                            )}
                                            {profile.github && (
                                                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                                                    <Github className="w-5 h-5 text-gray-900" />
                                                    <span className="text-gray-900 font-medium text-sm">GitHub Profile</span>
                                                    <ArrowRight className="w-4 h-4 ml-auto text-gray-900" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Program & Mentor Info */}
                    <div className="space-y-6">
                        {/* Program Track Card */}
                        <Card className="rounded-2xl border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                            <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>

                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-orange-600" />
                                    Program Track
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold w-full justify-center py-2">
                                    {displayProfile.programTrack}
                                </Badge>
                                <p className="text-sm text-gray-600">
                                    {PROGRAM_TRACKS[displayProfile.programTrack]}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Mentor Card */}
                        {displayProfile.programTrack !== 'PCP' && (
                            <Card className="rounded-2xl border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>

                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-orange-600" />
                                        Your Mentor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border-2 border-orange-200">
                                            <AvatarImage src={getMentorAvatarUrl(displayProfile.mentorDetails?.avatar, displayProfile.mentorDetails?.id) || undefined} />
                                            <AvatarFallback className="flex h-full w-full items-center justify-center bg-orange-500 text-white font-bold">
                                                {displayProfile.mentor && displayProfile.mentor !== 'Unassigned' ? displayProfile.mentor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'M'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-gray-900">{displayProfile.mentor}</p>
                                            <p className="text-xs text-gray-600">{displayProfile.mentorEmail}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => window.location.href = `mailto:${displayProfile.mentorEmail}`}
                                        variant="outline" 
                                        className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 font-bold gap-2"
                                    >
                                        <Mail className="w-4 h-4" />
                                        Contact Mentor
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Links */}
                        <Card className="rounded-2xl border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                            <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300"></div>

                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-orange-600" />
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button 
                                    onClick={() => toast.info("Coming Soon", { description: "CV download will be available soon." })}
                                    variant="outline" 
                                    className="w-full justify-start border-orange-200 text-orange-600 hover:bg-orange-50 font-bold gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    Download CV
                                </Button>
                                <Button 
                                    onClick={() => toast.info("Coming Soon", { description: "Portfolio viewer will be available soon." })}
                                    variant="outline" 
                                    className="w-full justify-start border-orange-200 text-orange-600 hover:bg-orange-50 font-bold gap-2"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    View Portfolio
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Edit/Save Buttons */}
                {isEditing && (
                    <div className="fixed bottom-6 right-6 flex gap-3 z-50">
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 font-bold gap-2 rounded-full px-6 py-6 shadow-lg"
                        >
                            <X className="w-5 h-5" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold gap-2 rounded-full px-6 py-6 shadow-lg disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}