// 'use client';

// import { ReactNode, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import AdminSidebar from '@/components/admin/AdminSidebar';
// import AdminHeader from '@/components/admin/AdminHeader';

// interface AdminLayoutProps {
//   children: ReactNode;
// }

// export default function AdminLayout({ children }: AdminLayoutProps) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     // Check authentication and admin role
//     // This would be replaced with actual auth logic
//     const checkAuth = async () => {
//       try {
//         // Mock authentication check
//         const userStr = localStorage.getItem('user');
//         if (!userStr) {
//           router.push('/login');
//           return;
//         }

//         const user = JSON.parse(userStr);
//         if (user.role !== 'admin') {
//           router.push('/dashboard');
//           return;
//         }

//         setIsAuthenticated(true);
//         setIsAdmin(true);
//       } catch (error) {
//         router.push('/login');
//       }
//     };

//     checkAuth();
//   }, [router]);

//   if (!isAuthenticated || !isAdmin) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

//       <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
//         <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

//         <main className="p-6">
//           <div className="max-w-7xl mx-auto">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }


// Replace the authentication check with this temporary version:

// 'use client';

// import { ReactNode, useState } from 'react';
// import AdminSidebar from '@/components/admin/AdminSidebar';
// import AdminHeader from '@/components/admin/AdminHeader';
// import { NotificationProvider } from '@/contexts/NotificationContext';

// interface AdminLayoutProps {
//   children: ReactNode;
// }

// export default function AdminLayout({ children }: AdminLayoutProps) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//   // TEMPORARY: Bypass authentication for development
//   // Remove this and restore real auth when backend is ready

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

//       <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
//         <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

//         <main className="p-6">
//           <div className="max-w-7xl mx-auto">
//             <NotificationProvider userId="admin">
//             {children}
//             </NotificationProvider>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

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
