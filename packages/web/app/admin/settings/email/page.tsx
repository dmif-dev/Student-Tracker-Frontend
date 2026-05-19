'use client';

import { useState, useEffect } from 'react';
import { Mail, Edit, Eye, Copy, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export default function EmailSettingsPage() {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['adminEmailTemplates'],
    queryFn: () => ApiService.getEmailTemplates(),
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({});

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  useEffect(() => {
    if (selectedTemplate) {
      setFormData(selectedTemplate);
    }
  }, [selectedTemplate]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<EmailTemplate> }) => ApiService.updateEmailTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmailTemplates'] });
      toast.success('Email template updated successfully!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Failed to update email template.');
    }
  });

  const handleSave = () => {
    if (selectedTemplateId) {
      updateMutation.mutate({ id: selectedTemplateId, data: formData });
    }
  };

  if (isLoading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">Loading templates...</div>;
  }

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
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedTemplateId === template.id
                    ? 'bg-orange-50 border border-orange-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <h3 className="font-medium text-gray-900">{template.name}</h3>
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
                  <button className="flex items-center px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    <Copy size={16} className="mr-1" />
                    Duplicate
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Subject:</span>
                      <span className="ml-2 font-medium">{formData.subject}</span>
                    </div>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: formData.body || '' }}
                    />
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
                      value={formData.name || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={formData.subject || ''}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Body
                    </label>
                    <textarea
                      rows={10}
                      value={formData.body || ''}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Available Variables</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.variables?.map((var_) => (
                        <span key={var_} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {var_}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setFormData(selectedTemplate || {})}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
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
