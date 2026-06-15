"use client";

import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { StudentNotificationProvider } from "@/contexts/StudentNotificationContext";
import StudentHeader from "@/components/student/StudentHeader";

export default function AppLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <StudentNotificationProvider>
            <DashboardLayout header={<StudentHeader />}>
                {children}
            </DashboardLayout>
        </StudentNotificationProvider>
    );
}
