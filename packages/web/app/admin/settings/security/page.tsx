'use client';

import { useState, useEffect } from 'react';
import { Shield, Key, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

export default function SecuritySettingsPage() {
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);

  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['adminSecuritySettings'],
    queryFn: () => ApiService.getAdminSecuritySettings(),
  });

  useEffect(() => {
    if (data) {
      setSettings(prev => ({
        ...prev,
        ...data,
        passwordPolicy: { ...prev.passwordPolicy, ...(data.passwordPolicy || {}) }
      }));
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (newSettings: typeof settings) => ApiService.updateAdminSecuritySettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSecuritySettings'] });
      toast.success('Security settings saved successfully!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to save security settings.');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  if (isLoading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">Loading security settings...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6">Security Settings</h2>

      <div className="space-y-6">
        {/* Password Change */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="font-medium mb-4 flex items-center">
            <Key size={18} className="mr-2 text-gray-500" />
            Change Password
          </h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Update Password
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="font-medium mb-4 flex items-center">
            <Shield size={18} className="mr-2 text-gray-500" />
            Two-Factor Authentication
          </h3>
          <div className="flex items-center justify-between max-w-md">
            <div>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {settings.twoFactorEnabled ? '2FA is enabled' : '2FA is disabled'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={(e) => setSettings({ ...settings, twoFactorEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          {settings.twoFactorEnabled && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg max-w-md">
              <p className="text-sm text-orange-700">
                Scan this QR code with your authenticator app
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg text-center">
                <div className="w-32 h-32 bg-gray-200 mx-auto mb-2 flex items-center justify-center text-gray-400">
                  QR Code Placeholder
                </div>
                <p className="text-xs text-gray-500">Setup key: ABCD-EFGH-IJKL-MNOP</p>
              </div>
            </div>
          )}
        </div>

        {/* Session Settings */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="font-medium mb-4 flex items-center">
            <Lock size={18} className="mr-2 text-gray-500" />
            Session Settings
          </h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="5"
              max="480"
            />
            <p className="text-xs text-gray-500 mt-1">
              Users will be automatically logged out after this period of inactivity
            </p>
          </div>
        </div>

        {/* Password Policy */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="font-medium mb-4">Password Policy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Length
              </label>
              <input
                type="number"
                value={settings.passwordPolicy.minLength}
                onChange={(e) => setSettings({ ...settings, passwordPolicy: { ...settings.passwordPolicy, minLength: parseInt(e.target.value) }})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="6"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Expiry (days)
              </label>
              <input
                type="number"
                value={settings.passwordPolicy.expiryDays}
                onChange={(e) => setSettings({ ...settings, passwordPolicy: { ...settings.passwordPolicy, expiryDays: parseInt(e.target.value) }})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
                max="365"
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.passwordPolicy.requireUppercase}
                onChange={(e) => setSettings({ ...settings, passwordPolicy: { ...settings.passwordPolicy, requireUppercase: e.target.checked }})}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm">Require uppercase letters</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.passwordPolicy.requireLowercase}
                onChange={(e) => setSettings({ ...settings, passwordPolicy: { ...settings.passwordPolicy, requireLowercase: e.target.checked }})}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm">Require lowercase letters</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.passwordPolicy.requireNumbers}
                onChange={(e) => setSettings({ ...settings, passwordPolicy: { ...settings.passwordPolicy, requireNumbers: e.target.checked }})}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm">Require numbers</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.passwordPolicy.requireSpecialChars}
                onChange={(e) => setSettings({ ...settings, passwordPolicy: { ...settings.passwordPolicy, requireSpecialChars: e.target.checked }})}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm">Require special characters (!@#$%)</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            <Save size={18} className="mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Security Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
