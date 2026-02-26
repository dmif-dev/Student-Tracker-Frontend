'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ReportConfig {
  name: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    start: string;
    end: string;
  };
  programs: string[];
  includeCharts: boolean;
  includeTables: boolean;
  schedule: {
    enabled: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    recipients?: string[];
  };
}

export default function GenerateReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    type: 'weekly',
    format: 'pdf',
    dateRange: {
      start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    programs: [],
    includeCharts: true,
    includeTables: true,
    schedule: {
      enabled: false,
    },
  });

  const programs = ['G-GMP', 'G-CMP', 'E-TIP', 'PCP'];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGenerated(true);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    // Mock download
    alert('Report download started');
    router.push('/admin/reports');
  };

  const handleSchedule = () => {
    alert('Report scheduled successfully');
    router.push('/admin/reports');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/reports"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Generate Report</h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= i ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > i ? <CheckCircle size={16} /> : i}
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                step > i ? 'bg-primary-600' : 'bg-gray-200'
              }`}></div>
            </div>
          ))}
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>

      {!generated ? (
        <>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Report Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Name *
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Weekly Progress Report - Week 12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Type
                    </label>
                    <select
                      value={config.type}
                      onChange={(e) => setConfig({ ...config, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="weekly">Weekly Report</option>
                      <option value="monthly">Monthly Report</option>
                      <option value="quarterly">Quarterly Report</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format
                    </label>
                    <select
                      value={config.format}
                      onChange={(e) => setConfig({ ...config, format: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={config.dateRange.start}
                      onChange={(e) => setConfig({
                        ...config,
                        dateRange: { ...config.dateRange, start: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={config.dateRange.end}
                      onChange={(e) => setConfig({
                        ...config,
                        dateRange: { ...config.dateRange, end: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setStep(2)}
                  disabled={!config.name}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Select Programs
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Programs */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Select Programs</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {programs.map((program) => (
                  <label
                    key={program}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      config.programs.includes(program)
                        ? 'bg-primary-50 border-primary-300'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={config.programs.includes(program)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({
                            ...config,
                            programs: [...config.programs, program]
                          });
                        } else {
                          setConfig({
                            ...config,
                            programs: config.programs.filter(p => p !== program)
                          });
                        }
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{program}</span>
                  </label>
                ))}
              </div>

              <h3 className="font-medium mb-3">Include in Report</h3>
              <div className="space-y-3 mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includeCharts}
                    onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Include Charts & Visualizations</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includeTables}
                    onChange={(e) => setConfig({ ...config, includeTables: e.target.checked })}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Include Data Tables</span>
                </label>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={config.programs.length === 0}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Schedule & Generate
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule & Generate */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Schedule & Generate</h2>
              
              <div className="mb-6">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={config.schedule.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      schedule: { ...config.schedule, enabled: e.target.checked }
                    })}
                    className="rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm font-medium">Schedule recurring report</span>
                </label>

                {config.schedule.enabled && (
                  <div className="ml-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <select
                        value={config.schedule.frequency}
                        onChange={(e) => setConfig({
                          ...config,
                          schedule: { ...config.schedule, frequency: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        placeholder="Enter email addresses (comma separated)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Separate multiple emails with commas
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-primary-800 mb-2">Report Summary</h4>
                <ul className="space-y-1 text-sm text-primary-700">
                  <li>• Name: {config.name}</li>
                  <li>• Type: {config.type} report</li>
                  <li>• Format: {config.format.toUpperCase()}</li>
                  <li>• Date Range: {config.dateRange.start} to {config.dateRange.end}</li>
                  <li>• Programs: {config.programs.join(', ')}</li>
                  <li>• Includes: {[
                    config.includeCharts && 'Charts',
                    config.includeTables && 'Tables'
                  ].filter(Boolean).join(', ')}</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText size={18} className="mr-2" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Success State */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Generated Successfully!</h2>
          <p className="text-gray-500 mb-6">
            Your report "{config.name}" has been generated and is ready for download.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDownload}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Download size={18} className="mr-2" />
              Download Report
            </button>
            {config.schedule.enabled && (
              <button
                onClick={handleSchedule}
                className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Clock size={18} className="mr-2" />
                View Schedule
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}