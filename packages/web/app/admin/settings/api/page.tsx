'use client';

import { useState } from 'react';
import { Key, Copy, Eye, EyeOff, Plus, Trash2, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

export default function ApiSettingsPage() {
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ['adminApiKeys'],
    queryFn: () => ApiService.getApiKeys(),
  });

  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);

  const generateMutation = useMutation({
    mutationFn: (name: string) => ApiService.generateApiKey(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminApiKeys'] });
      setShowNewKeyForm(false);
      setNewKeyName('');
      toast.success('API Key generated!');
      toast.error(`Your new API Key is: ${data.key}\nPlease store it safely, it may not be visible again.`);
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to generate API Key.');
    }
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => ApiService.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminApiKeys'] });
      toast.success('API Key revoked successfully.');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to revoke API Key.');
    }
  });

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev =>
      prev.includes(keyId)
        ? prev.filter(id => id !== keyId)
        : [...prev, keyId]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('API key copied to clipboard!');
  };

  const handleGenerate = () => {
    if (!newKeyName.trim()) {
      toast.error('Key name is required.');
      return;
    }
    generateMutation.mutate(newKeyName);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to revoke this API Key?')) {
      revokeMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">Loading API Keys...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">API Keys</h2>
        <button
          onClick={() => setShowNewKeyForm(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Plus size={18} className="mr-2" />
          Generate New Key
        </button>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {visibleKeys.includes(apiKey.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copyToClipboard(apiKey.key)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(apiKey.id)}
                  disabled={revokeMutation.isPending}
                  className="p-1 hover:bg-gray-100 rounded text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
              {visibleKeys.includes(apiKey.id) ? apiKey.key : '••••••••••••••••••••••••'}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar size={12} className="mr-1" />
                Created: {new Date(apiKey.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generate New Key Modal */}
      {showNewKeyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Generate New API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Production Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewKeyForm(false);
                  setNewKeyName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {generateMutation.isPending ? 'Generating...' : 'Generate Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
