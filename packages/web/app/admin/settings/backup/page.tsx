'use client';

import { useState } from 'react';
import { Download, Upload, Clock, Database, RefreshCw, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

interface Backup {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: string;
}

export default function BackupSettingsPage() {
  const queryClient = useQueryClient();

  const { data: backups = [], isLoading } = useQuery<Backup[]>({
    queryKey: ['adminBackups'],
    queryFn: () => ApiService.getBackups(),
  });

  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');

  const createMutation = useMutation({
    mutationFn: () => ApiService.createBackup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBackups'] });
      toast.success('Backup created successfully!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to create backup.');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => ApiService.restoreBackup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBackups'] });
      toast.success('Database restored successfully!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to restore backup.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteBackup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBackups'] });
      toast.success('Backup deleted successfully!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to delete backup.');
    }
  });

  const handleManualBackup = () => {
    createMutation.mutate();
  };

  const handleRestore = (id: string) => {
    if (confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      restoreMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this backup record?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">Loading backups...</div>;
  }

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
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {createMutation.isPending ? (
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
                    <p className="font-medium text-sm">{backup.fileName}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(backup.createdAt).toLocaleString()}</p>
                  </div>
                  {backup.status === 'COMPLETED' && (
                    <CheckCircle size={16} className="text-green-500" />
                  )}
                  {backup.status === 'FAILED' && (
                    <AlertCircle size={16} className="text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{formatSize(backup.fileSize)}</span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    Database Dump
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-2 mt-3">
                  <button 
                    onClick={() => handleDelete(backup.id)}
                    disabled={deleteMutation.isPending}
                    className="px-2 py-1 text-red-500 hover:bg-red-50 rounded"
                    title="Delete backup"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">
                    Download
                  </button>
                  <button 
                    onClick={() => handleRestore(backup.id)}
                    disabled={restoreMutation.isPending}
                    className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                  >
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
