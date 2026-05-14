// 'use client';

// import { useState } from 'react';
// import {
//   Bell,
//   Shield,
//   Users,
//   Globe,
//   Mail,
//   Database,
//   Lock,
//   Save
// } from 'lucide-react';

// interface SettingsSection {
//   id: string;
//   name: string;
//   icon: any;
//   component: React.ReactNode;
// }

// export default function SettingsPage() {
//   const [activeSection, setActiveSection] = useState('general');

//   const sections: SettingsSection[] = [
//     {
//       id: 'general',
//       name: 'General',
//       icon: Globe,
//       component: <GeneralSettings />,
//     },
//     {
//       id: 'notifications',
//       name: 'Notifications',
//       icon: Bell,
//       component: <NotificationSettings />,
//     },
//     {
//       id: 'users',
//       name: 'Users & Roles',
//       icon: Users,
//       component: <UserSettings />,
//     },
//     {
//       id: 'email',
//       name: 'Email Templates',
//       icon: Mail,
//       component: <EmailSettings />,
//     },
//     {
//       id: 'security',
//       name: 'Security',
//       icon: Shield,
//       component: <SecuritySettings />,
//     },
//     {
//       id: 'data',
//       name: 'Data Management',
//       icon: Database,
//       component: <DataSettings />,
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* Sidebar */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
//             <nav className="space-y-1">
//               {sections.map((section) => {
//                 const Icon = section.icon;
//                 return (
//                   <button
//                     key={section.id}
//                     onClick={() => setActiveSection(section.id)}
//                     className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
//                       activeSection === section.id
//                         ? 'bg-orange-50 text-orange-600'
//                         : 'text-gray-700 hover:bg-gray-50'
//                     }`}
//                   >
//                     <Icon size={18} className="mr-3" />
//                     {section.name}
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="lg:col-span-3">
//           {sections.find(s => s.id === activeSection)?.component}
//         </div>
//       </div>
//     </div>
//   );
// }

// // General Settings Component
// function GeneralSettings() {
//   const [settings, setSettings] = useState({
//     siteName: 'DMIF Student Tracker',
//     siteUrl: 'https://tracker.dmif.org',
//     timezone: 'UTC+5:30',
//     dateFormat: 'YYYY-MM-DD',
//     language: 'en',
//     maintenanceMode: false,
//   });

//   const handleSave = () => {
//     console.log('Saving settings:', settings);
//     alert('Settings saved successfully!');
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//       <h2 className="text-lg font-semibold mb-6">General Settings</h2>

//       <div className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Site Name
//           </label>
//           <input
//             type="text"
//             value={settings.siteName}
//             onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Site URL
//           </label>
//           <input
//             type="url"
//             value={settings.siteUrl}
//             onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Timezone
//             </label>
//             <select
//               value={settings.timezone}
//               onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//             >
//               <option value="UTC+5:30">IST (UTC+5:30)</option>
//               <option value="UTC+0">UTC</option>
//               <option value="UTC-5">EST (UTC-5)</option>
//               <option value="UTC-8">PST (UTC-8)</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Date Format
//             </label>
//             <select
//               value={settings.dateFormat}
//               onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//             >
//               <option value="YYYY-MM-DD">YYYY-MM-DD</option>
//               <option value="DD/MM/YYYY">DD/MM/YYYY</option>
//               <option value="MM/DD/YYYY">MM/DD/YYYY</option>
//             </select>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Language
//           </label>
//           <select
//             value={settings.language}
//             onChange={(e) => setSettings({ ...settings, language: e.target.value })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//           >
//             <option value="en">English</option>
//             <option value="es">Spanish</option>
//             <option value="fr">French</option>
//             <option value="de">German</option>
//           </select>
//         </div>

//         <div className="flex items-center justify-between">
//           <div>
//             <p className="font-medium text-gray-900">Maintenance Mode</p>
//             <p className="text-sm text-gray-500">Enable maintenance mode for the site</p>
//           </div>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={settings.maintenanceMode}
//               onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
//               className="sr-only peer"
//             />
//             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
//           </label>
//         </div>

//         <div className="pt-6 border-t border-gray-200">
//           <button
//             onClick={handleSave}
//             className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
//           >
//             <Save size={18} className="mr-2" />
//             Save Changes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Notification Settings Component
// function NotificationSettings() {
//   const [settings, setSettings] = useState({
//     emailNotifications: true,
//     pushNotifications: true,
//     weeklyReports: true,
//     dailyReminders: false,
//     outcomeAlerts: true,
//     mentorUpdates: true,
//   });

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//       <h2 className="text-lg font-semibold mb-6">Notification Settings</h2>

//       <div className="space-y-4">
//         {Object.entries(settings).map(([key, value]) => (
//           <div key={key} className="flex items-center justify-between">
//             <div>
//               <p className="font-medium text-gray-900 capitalize">
//                 {key.replace(/([A-Z])/g, ' $1').trim()}
//               </p>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={value}
//                 onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
//                 className="sr-only peer"
//               />
//               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
//             </label>
//           </div>
//         ))}
//       </div>

//       <div className="pt-6 border-t border-gray-200 mt-6">
//         <button className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
//           <Save size={18} className="mr-2" />
//           Save Changes
//         </button>
//       </div>
//     </div>
//   );
// }

// // User Settings Component
// function UserSettings() {
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//       <h2 className="text-lg font-semibold mb-6">User & Role Settings</h2>
//       <p className="text-gray-500">User management interface will be implemented here.</p>
//     </div>
//   );
// }

// // Email Settings Component
// function EmailSettings() {
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//       <h2 className="text-lg font-semibold mb-6">Email Templates</h2>
//       <p className="text-gray-500">Email template management will be implemented here.</p>
//     </div>
//   );
// }

// // Security Settings Component
// function SecuritySettings() {
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//       <h2 className="text-lg font-semibold mb-6">Security Settings</h2>
//       <p className="text-gray-500">Security configuration will be implemented here.</p>
//     </div>
//   );
// }

// // Data Settings Component
// function DataSettings() {
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//       <h2 className="text-lg font-semibold mb-6">Data Management</h2>
//       <p className="text-gray-500">Data management options will be implemented here.</p>
//     </div>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'DMIF Student Tracker',
    siteUrl: 'https://tracker.dmif.org',
    timezone: 'UTC+5:30',
    dateFormat: 'YYYY-MM-DD',
    language: 'en',
    maintenanceMode: false,
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminGeneralSettings'],
    queryFn: () => ApiService.getAdminGeneralSettings(),
  });

  useEffect(() => {
    if (data) {
      setSettings((prev) => ({ ...prev, ...data }));
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (newSettings: typeof settings) => ApiService.updateAdminGeneralSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGeneralSettings'] });
      toast.success('Settings saved successfully!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to save settings.');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">Loading settings...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6">General Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site Name
          </label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site URL
          </label>
          <input
            type="url"
            value={settings.siteUrl}
            onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="UTC+5:30">IST (UTC+5:30)</option>
              <option value="UTC+0">UTC</option>
              <option value="UTC-5">EST (UTC-5)</option>
              <option value="UTC-8">PST (UTC-8)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Maintenance Mode</p>
            <p className="text-sm text-gray-500">Enable maintenance mode for the site</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button
            disabled={updateMutation.isPending}
            onClick={handleSave}
            className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            <Save size={18} className="mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
