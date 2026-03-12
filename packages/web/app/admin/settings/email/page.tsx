'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Mail, Edit, Eye, Copy, CheckCircle } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  lastUpdated: string;
}

export default function EmailSettingsPage() {
  const [templates] = useState<EmailTemplate[]>([
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to DMIF Student Tracker',
      description: 'Sent to new students upon registration',
      lastUpdated: '2024-03-15'
    },
    {
      id: 'weekly-report',
      name: 'Weekly Report',
      subject: 'Your Weekly Progress Report',
      description: 'Weekly progress summary for students',
      lastUpdated: '2024-03-14'
    },
    {
      id: 'mentor-assignment',
      name: 'Mentor Assignment',
      subject: 'You have been assigned a mentor',
      description: 'Notification when mentor is assigned',
      lastUpdated: '2024-03-10'
    },
    {
      id: 'outcome-achieved',
      name: 'Outcome Achieved',
      subject: 'Congratulations on your achievement!',
      description: 'Sent when student achieves an outcome',
      lastUpdated: '2024-03-05'
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-6">Email Templates</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="col-span-1 border-r border-gray-200 pr-4">
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedTemplate === template.id
                    ? 'bg-orange-50 border border-orange-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="col-span-2">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Edit Template</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {previewMode ? <Edit size={16} className="mr-1" /> : <Eye size={16} className="mr-1" />}
                    {previewMode ? 'Edit' : 'Preview'}
                  </button>
                  <Button className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
                    <Copy size={16} className="mr-1" />
                    Duplicate
                  </Button>
                </div>
              </div>

              {previewMode ? (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Subject:</span>
                      <span className="ml-2 font-medium">Welcome to DMIF Student Tracker</span>
                    </div>
                    <div className="prose max-w-none">
                      <p>Dear [Student Name],</p>
                      <p>Welcome to DMIF Student Tracker! We're excited to have you on board.</p>
                      <p>Your journey with us starts now. Here's what you can do:</p>
                      <ul>
                        <li>Track your daily progress</li>
                        <li>View weekly reports</li>
                        <li>Connect with your mentor</li>
                      </ul>
                      <p>Best regards,<br />DMIF Team</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value="Welcome Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value="Welcome to DMIF Student Tracker"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Body
                    </label>
                    <textarea
                      rows={10}
                      value="Dear [Student Name],\n\nWelcome to DMIF Student Tracker! We're excited to have you on board.\n\nYour journey with us starts now. Here's what you can do:\n- Track your daily progress\n- View weekly reports\n- Connect with your mentor\n\nBest regards,\nDMIF Team"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Available Variables</h4>
                    <div className="flex flex-wrap gap-2">
                      {['[Student Name]', '[Mentor Name]', '[Program]', '[Track]', '[Progress]'].map((var_) => (
                        <span key={var_} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {var_}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <Button className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Select a template to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
