"use client";

import { UserCircle, Mail, MessageSquare, Calendar, ExternalLink, Award, Users, Star, Clock, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MentorDetailsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
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
                            <AvatarImage src="/assets/mentor-profile.jpg" />
                            <AvatarFallback className="bg-orange-600 text-white text-5xl font-black italic">MX</AvatarFallback>
                        </Avatar>
                        <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-black border-4 border-white py-1.5 px-6 rounded-full z-20 shadow-lg">
                            SENIOR MENTOR
                        </Badge>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black text-gray-900 tracking-tight">Dr. Maxx</h1>
                            <p className="text-xl text-orange-600 font-bold italic">Principal Innovation Architect & IP Strategist</p>
                        </div>
                        <p className="text-lg text-gray-600 font-medium max-w-3xl leading-relaxed">
                            With over 15 years of experience in product development and 40+ global patents,
                            Dr. Maxx guides students through the complexities of technical mastery and innovation.
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                            <Button className="bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl px-8 h-12 shadow-lg shadow-orange-600/20 gap-2">
                                <MessageSquare className="w-5 h-5" /> Book a Session
                            </Button>
                            <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 font-black rounded-2xl px-8 h-12 gap-2 shadow-sm">
                                <Mail className="w-5 h-5" /> Send Message
                            </Button>
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
                                    { label: "Technical Focus", value: "Cloud Systems & AI" },
                                    { label: "Innovation Focus", value: "IP Creation & Tech-Law" },
                                    { label: "Experience", value: "15+ Years" },
                                    { label: "Active Students", value: "12 Students" }
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
                                    <h3 className="text-xl font-black">Mon - Thu</h3>
                                    <p className="text-orange-50/80 font-medium">2:00 PM - 5:00 PM (IST)</p>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                                    <Clock className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <Button variant="secondary" className="w-full bg-white text-orange-600 font-black hover:bg-orange-50 h-12 rounded-2xl shadow-xl">
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
                                    Dr. Masters leads our Advanced IP Creation stream. She previously served as a Senior Architect at
                                    MajorTech Corp where she specialized in globally distributed systems and patentable infrastructure.
                                    Her mentorship style is hands-on, focusing on bridging the gap between theoretical computer science
                                    and commercial product implementation.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">Recent Milestones</p>
                                <div className="space-y-4">
                                    {[
                                        "Published 'The Future of AI Patents in Web3' (2024)",
                                        "Facilitated 5 Student Patent Filings in Q3",
                                        "Awarded Excellence in Technical Mentorship"
                                    ].map((milestone, i) => (
                                        <div key={i} className="flex items-center gap-4 group">
                                            <div className="h-2 w-2 rounded-full bg-orange-500 group-hover:scale-150 transition-transform"></div>
                                            <span className="font-bold text-gray-700">{milestone}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-50 flex flex-wrap gap-8 items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />)}
                                    </div>
                                    <span className="font-black text-gray-900">4.9/5 Rating</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 font-bold">
                                    <Users className="w-5 h-5 text-orange-500" />
                                    <span>Mentored 150+ students</span>
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
                                <p className="text-sm text-gray-500 font-medium">Assigned as your Principal Mentor since Oct 2024.</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="text-orange-600 font-black hover:bg-orange-100 h-12 px-6 rounded-2xl gap-2 font-montserrat tracking-tight">
                            View Mentorship History <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
