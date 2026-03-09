'use client';

import { useState } from 'react';
import { Key, Copy, Eye, EyeOff, Plus, Trash2, Calendar } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string;
}

export default function ApiSettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_1234567890abcdef',
      createdAt: '2024-01-15',
      lastUsed: '2024-03-21',
      expiresAt: '2025-01-15'
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'sk_test_abcdef1234567890',
      createdAt: '2024-02-01',
      lastUsed: '2024-03-20',
      expiresAt: '2025-02-01'
    }
  ]);

  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev =>
      prev.includes(keyId)
        ? prev.filter(id => id !== keyId)
        : [...prev, keyId]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API key copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">API Keys</h2>
        <button
          onClick={() => setShowNewKeyForm(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
                <button className="p-1 hover:bg-gray-100 rounded text-red-500">
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
                Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}
              </div>
              {apiKey.lastUsed && (
                <div>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</div>
              )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="0">No expiration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-2" />
                    <span className="text-sm">Read only</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-2" />
                    <span className="text-sm">Read & Write</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 mr-2" />
                    <span className="text-sm">Admin access</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewKeyForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}