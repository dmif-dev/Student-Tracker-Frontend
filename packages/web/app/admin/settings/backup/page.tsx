'use client';

import { useState } from 'react';
import { Download, Upload, Clock, Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface Backup {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in-progress';
  type: 'auto' | 'manual';
}

export default function BackupSettingsPage() {
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: '1',
      name: 'backup-2024-03-21-1200.sql',
      size: '156 MB',
      createdAt: '2024-03-21 12:00 PM',
      status: 'completed',
      type: 'auto'
    },
    {
      id: '2',
      name: 'backup-2024-03-20-1200.sql',
      size: '152 MB',
      createdAt: '2024-03-20 12:00 PM',
      status: 'completed',
      type: 'auto'
    },
    {
      id: '3',
      name: 'pre-upgrade-backup.sql',
      size: '148 MB',
      createdAt: '2024-03-19 03:30 PM',
      status: 'completed',
      type: 'manual'
    }
  ]);

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');

  const handleManualBackup = () => {
    setIsBackingUp(true);
    // Simulate backup process
    setTimeout(() => {
      setIsBackingUp(false);
      alert('Backup completed successfully!');
    }, 3000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6">Backup & Restore</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Settings */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h3 className="font-medium mb-4 flex items-center">
              <Database size={18} className="mr-2 text-gray-500" />
              Backup Configuration
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Automatic Backups</p>
                  <p className="text-xs text-gray-500">Schedule regular backups</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBackupEnabled}
                    onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              {autoBackupEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Frequency
                  </label>
                  <select
                    value={backupFrequency}
                    onChange={(e) => setBackupFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retention Period
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Manual Backup */}
          <div>
            <button
              onClick={handleManualBackup}
              disabled={isBackingUp}
              className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                  Creating backup...
                </>
              ) : (
                <>
                  <Download size={18} className="mr-2" />
                  Create Manual Backup
                </>
              )}
            </button>
          </div>

          {/* Restore Options */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-medium mb-4">Restore</h3>
            <button className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
              <Upload size={18} className="mr-2" />
              Upload Backup File
            </button>
          </div>
        </div>

        {/* Recent Backups */}
        <div>
          <h3 className="font-medium mb-4 flex items-center">
            <Clock size={18} className="mr-2 text-gray-500" />
            Recent Backups
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{backup.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{backup.createdAt}</p>
                  </div>
                  {backup.status === 'completed' && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                  {backup.status === 'failed' && (
                    <AlertCircle size={16} className="text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{backup.size}</span>
                  <span className={`px-2 py-1 rounded-full ${
                    backup.type === 'auto' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {backup.type}
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-2 mt-3">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Download
                  </button>
                  <button className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700">
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
