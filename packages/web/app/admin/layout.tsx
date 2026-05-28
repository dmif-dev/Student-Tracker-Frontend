// packages/web/app/admin/layout.tsx

'use client';

import { ReactNode } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { AdminNotificationProvider } from '@/contexts/AdminNotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import LoaderOne from '@/components/ui/loader-one';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoaderOne />
      </div>
    );
  }

  // Use the authenticated user's ID if available, otherwise fallback to empty string
  const userId = user?.id || '';

  return (
    <AdminNotificationProvider userId={userId}>
      <DashboardLayout header={<AdminHeader toggleSidebar={() => { }} />}>
        {children}
      </DashboardLayout>
    </AdminNotificationProvider>
  );
}
