'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Shield,
  Users,
  Globe,
  Mail,
  Database,
  Lock,
  Settings as SettingsIcon
} from 'lucide-react';

interface SettingsLayoutProps {
  children: ReactNode;
}

const settingsSections = [
  { id: 'general', name: 'General', icon: Globe, href: '/admin/settings' },
  { id: 'notifications', name: 'Notifications', icon: Bell, href: '/admin/settings/notifications' },
  { id: 'users', name: 'Users & Roles', icon: Users, href: '/admin/settings/users' },
  { id: 'email', name: 'Email Templates', icon: Mail, href: '/admin/settings/email' },
  { id: 'security', name: 'Security', icon: Shield, href: '/admin/settings/security' },
  { id: 'api', name: 'API Keys', icon: Lock, href: '/admin/settings/api' },
  { id: 'backup', name: 'Backup', icon: Database, href: '/admin/settings/backup' },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = pathname === section.href;

                return (
                  <Link
                    key={section.id}
                    href={section.href}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className="mr-3" />
                    {section.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
