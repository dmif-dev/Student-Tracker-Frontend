'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, Mail, X, ChevronDown } from 'lucide-react';
import { ExportService, exportTemplates, ExportOptions } from '@/services/exportService';
import LoaderOne from '@/components/ui/loader-one';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  context: 'students' | 'outcomes' | 'mentors' | 'reports';
  filename?: string;
}

export default function ExportModal({ isOpen, onClose, data, context, filename }: ExportModalProps) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('excel');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [schedule, setSchedule] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recipients, setRecipients] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const getColumnsForContext = () => {
    switch (context) {
      case 'students':
        return [
          { header: 'Name', key: 'name' },
          { header: 'Email', key: 'email' },
          { header: 'Registration', key: 'registrationNumber' },
          { header: 'Program', key: 'program' },
          { header: 'Track', key: 'track' },
          { header: 'Mentor', key: 'mentor' },
          { header: 'Status', key: 'status' },
          { header: 'Join Date', key: 'joinDate' },
          { header: 'Progress', key: 'progress' }
        ];
      case 'outcomes':
        return [
          { header: 'Type', key: 'type' },
          { header: 'Title', key: 'title' },
          { header: 'Student', key: 'student' },
          { header: 'Status', key: 'status' },
          { header: 'Date', key: 'date' },
          { header: 'Mentor', key: 'mentor' }
        ];
      default:
        return [];
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const columns = getColumnsForContext();
      const exportFilename = filename || `${context}-${new Date().toISOString().split('T')[0]}`;

      await ExportService.exportData({
        filename: exportFilename,
        format,
        data,
        columns,
        title: `${context} Export`,
        orientation
      });

      if (schedule && recipients) {
        await ExportService.scheduleExport(
          selectedTemplate || 'custom',
          scheduleFrequency,
          recipients.split(',').map(email => email.trim())
        );
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Export Data</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= i ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {i}
                </div>
                {i < 3 && <div className={`flex-1 h-1 mx-2 ${
                  step > i ? 'bg-orange-600' : 'bg-gray-200'
                }`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-medium">Select Format</h4>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'excel', label: 'Excel', icon: FileText },
                  { id: 'pdf', label: 'PDF', icon: FileText },
                  { id: 'csv', label: 'CSV', icon: FileText }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id as any)}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      format === fmt.id
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <fmt.icon size={24} className={`mx-auto mb-2 ${
                      format === fmt.id ? 'text-orange-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm ${
                      format === fmt.id ? 'text-orange-600 font-medium' : 'text-gray-600'
                    }`}>
                      {fmt.label}
                    </span>
                  </button>
                ))}
              </div>

              {format === 'pdf' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeHeaders}
                    onChange={(e) => setIncludeHeaders(e.target.checked)}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Include headers</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeTimestamps}
                    onChange={(e) => setIncludeTimestamps(e.target.checked)}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Include timestamps</span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-medium">Schedule Export (Optional)</h4>
              
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={schedule}
                  onChange={(e) => setSchedule(e.target.checked)}
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm">Schedule recurring export</span>
              </label>

              {schedule && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={scheduleFrequency}
                      onChange={(e) => setScheduleFrequency(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Recipients
                    </label>
                    <input
                      type="text"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple emails with commas
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-medium">Review & Confirm</h4>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Format:</dt>
                    <dd className="font-medium uppercase">{format}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Rows:</dt>
                    <dd className="font-medium">{data.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Columns:</dt>
                    <dd className="font-medium">{getColumnsForContext().length}</dd>
                  </div>
                  {schedule && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Schedule:</dt>
                        <dd className="font-medium capitalize">{scheduleFrequency}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Recipients:</dt>
                        <dd className="font-medium">{recipients.split(',').length}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>

              <p className="text-sm text-gray-500">
                File will be saved as: {filename || context}_{new Date().toISOString().split('T')[0]}.{format}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={step === 3 ? handleExport : () => setStep(step + 1)}
            disabled={isExporting}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <span className="scale-75 mr-2"><LoaderOne /></span>
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} className="mr-2" />
                {step === 3 ? 'Export' : 'Next'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
