'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiService } from '@/services/api';
import { ArrowLeft, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import LoaderOne from '@/components/ui/loader-one';

export default function ImportStudentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    // Parse CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      
      const parsedData = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || '';
        });
        return row;
      });

      setPreview(parsedData);
      setImportStatus('preview');
    };
    reader.readAsText(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const template = `name,email,registrationNumber,program,track,mentor,status,joinDate,phone
John Doe,john.doe@example.com,DMIF2024001,G-GMP,Patent Track,Dr. Smith,active,2024-01-15,+1234567890
Jane Smith,jane.smith@example.com,DMIF2024002,G-CMP,AI Product Development,Prof. Johnson,active,2024-02-01,+1234567891`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
  };

  const handleImport = async () => {
  if (!file) return;

  setUploading(true);
  setErrors([]);

  try {
    // Parse CSV file
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    const students = lines.slice(1).map(line => {
      const values = line.split(',');
      const student: any = {};
      headers.forEach((header, index) => {
        student[header.trim()] = values[index]?.trim();
      });
      return student;
    });

    const result = await ApiService.importStudents(students);
    
    if (result.errors.length > 0) {
      setErrors(result.errors);
      setImportStatus('error');
    } else {
      setImportStatus('success');
    }
  } catch (error) {
    console.error('Error importing students:', error);
    setErrors(['Failed to import students. Please check your file format.']);
    setImportStatus('error');
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/students"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Import Students</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Import Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Upload CSV File</h2>
            
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                CSV files only (max. 5MB)
              </p>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Selected file: <span className="font-medium">{file.name}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          {/* Preview Section */}
          {importStatus === 'preview' && preview.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Preview (First 5 rows)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map(header => (
                        <th key={header} className="px-4 py-2 text-left font-medium text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {preview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, i) => (
                          <td key={i} className="px-4 py-2 text-gray-600">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error Display */}
          {importStatus === 'error' && errors.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="text-red-500 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-red-700">Import Failed</h3>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {importStatus === 'success' && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={20} />
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Import Successful!</h3>
                  <p className="text-sm text-green-600 mt-1">
                    25 students have been imported successfully.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template Download */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Template</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download our template to ensure your CSV file has the correct format.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={18} className="mr-2" />
              Download Template
            </button>
          </div>

          {/* Import Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Instructions</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• File must be in CSV format</li>
              <li>• First row must contain column headers</li>
              <li>• Required columns: name, email, registrationNumber</li>
              <li>• Program must be one of: G-GMP, G-CMP, E-TIP, PCP</li>
              <li>• Status must be: active, inactive, or pending</li>
              <li>• Date format: YYYY-MM-DD</li>
            </ul>
          </div>

          {/* Action Buttons */}
          {importStatus === 'preview' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <button
                onClick={handleImport}
                disabled={uploading}
                className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {uploading ? (
                  <>
                    <span className="scale-75 mr-2"><LoaderOne /></span>
                    Importing...
                  </>
                ) : (
                  'Import Students'
                )}
              </button>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview([]);
                  setImportStatus('idle');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
