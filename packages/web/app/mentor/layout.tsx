// packages/web/app/mentor/layout.tsx

'use client';

import { ReactNode } from 'react';
import { MentorNotificationProvider } from '@/contexts/MentorNotificationContext';
import DashboardLayout from '@/components/layout/dashboard-layout';
import MentorHeader from '@/components/mentor/MentorHeader';
import { useCurrentMentor } from '@/hooks/api/useMentor';

interface MentorLayoutProps {
  children: ReactNode;
}

export default function MentorLayout({ children }: MentorLayoutProps) {
  const { data: mentor, isLoading } = useCurrentMentor();

  // We could show a loading spinner here while fetching the mentor
  // if (!mentor && isLoading) return <div>Loading...</div>;

  return (
    <MentorNotificationProvider mentorId={mentor?.id || ''}>
      <DashboardLayout header={<MentorHeader />}>
        {children}
      </DashboardLayout>
    </MentorNotificationProvider>
  );
}