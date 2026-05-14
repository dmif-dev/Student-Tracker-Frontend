'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    dailyReminders: false,
    outcomeAlerts: true,
    mentorUpdates: true,
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminNotificationSettings'],
    queryFn: () => ApiService.getAdminNotificationSettings(),
  });

  useEffect(() => {
    if (data) {
      setSettings((prev) => ({ ...prev, ...data }));
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (newSettings: typeof settings) => ApiService.updateAdminNotificationSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotificationSettings'] });
      toast.success('Notification settings saved successfully!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to save notification settings.');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">Loading notification settings...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6">Notification Settings</h2>

      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-200 mt-6">
        <button 
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          <Save size={18} className="mr-2" />
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
