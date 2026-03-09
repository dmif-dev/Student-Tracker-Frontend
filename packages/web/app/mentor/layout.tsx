// packages/web/app/mentor/layout.tsx

'use client';

import { ReactNode } from 'react';
import { MentorNotificationProvider } from '@/contexts/MentorNotificationContext';
import DashboardLayout from '@/components/layout/dashboard-layout';
import MentorHeader from '@/components/mentor/MentorHeader';

interface MentorLayoutProps {
  children: ReactNode;
}

const MOCK_MENTOR = {
  id: '1',
  name: 'Dr. Smith',
  email: 'smith@dmif.org',
  avatar: '/avatars/smith.jpg',
  role: 'Mentor',
  programs: ['G-GMP', 'G-CMP'],
};

export default function MentorLayout({ children }: MentorLayoutProps) {
  return (
    <MentorNotificationProvider mentorId={MOCK_MENTOR.id}>
      <DashboardLayout header={<MentorHeader />}>
        {children}
      </DashboardLayout>
    </MentorNotificationProvider>
  );
}