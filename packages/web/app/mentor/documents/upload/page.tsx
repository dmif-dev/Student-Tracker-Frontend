// packages/web/app/mentor/documents/upload/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import { useCurrentMentor } from '@/hooks/api/useMentor';
import { useQueryClient } from '@tanstack/react-query';
import { DocumentType } from '@student-tracker/shared/models/Document';
import LoaderOne from '@/components/ui/loader-one';

interface Student {
  id: string;
  name: string;
  program: string;
  track: string;
}

export default function MentorUploadDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const preSelectedStudent = searchParams.get('student');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'learning_material' as DocumentType,
    track: '',
    file: null as File | null,
    dueDate: '',
    points: '',
    readingTime: '',
    required: false,
    selectedStudents: [] as string[],
    visibility: 'student_only' as 'student_only' | 'mentor_only' | 'both',
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { data: mentor } = useCurrentMentor();

  useEffect(() => {
    if (mentor?.assignedStudents) {
      const enhancedStudents = mentor.assignedStudents.map((s: any) => ({
        id: s.id,
        name: s.name,
        program: s.program,
        track: s.track,
      }));
      setStudents(enhancedStudents);
      setFilteredStudents(enhancedStudents);
    }
  }, [mentor]);

  useEffect(() => {
    if (preSelectedStudent) {
      setFormData(prev => ({
        ...prev,
        selectedStudents: [preSelectedStudent]
      }));
    }
  }, [preSelectedStudent]);

  useEffect(() => {
    // Filter students based on selected track and search term
    let filtered = students;
    
    if (formData.track) {
      filtered = filtered.filter(s => s.track === formData.track);
    }
    
    if (studentSearchTerm) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        s.track.toLowerCase().includes(studentSearchTerm.toLowerCase())
      );
    }
    
    setFilteredStudents(filtered);
  }, [formData.track, students, studentSearchTerm]);

  // Update selectAll state when all filtered students are selected
  useEffect(() => {
    if (filteredStudents.length > 0) {
      const allFilteredSelected = filteredStudents.every(s => 
        formData.selectedStudents.includes(s.id)
      );
      setSelectAll(allFilteredSelected);
    } else {
      setSelectAll(false);
    }
  }, [formData.selectedStudents, filteredStudents]);



  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, DOC, DOCX, and TXT files are allowed');
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all filtered students
      setFormData(prev => ({
        ...prev,
        selectedStudents: prev.selectedStudents.filter(id => 
          !filteredStudents.some(s => s.id === id)
        )
      }));
    } else {
      // Select all filtered students
      const filteredIds = filteredStudents.map(s => s.id);
      setFormData(prev => ({
        ...prev,
        selectedStudents: [...new Set([...prev.selectedStudents, ...filteredIds])]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file to upload');
      return;
    }

    if (formData.selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    setUploading(true);
    setError(null);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Build metadata based on document type
      const metadata: any = {
        version: 1,
        tags: [],
        required: formData.required,
      };

      if (formData.type === 'assignment_material') {
        if (formData.dueDate) metadata.dueDate = formData.dueDate;
        if (formData.points) metadata.points = parseInt(formData.points);
      } else if (formData.type === 'pre_reading_material') {
        if (formData.readingTime) metadata.readingTime = parseInt(formData.readingTime);
      }

      // Get program from first selected student, convert G-CMP -> G_CMP for backend
      const firstStudent = students.find(s => s.id === formData.selectedStudents[0]);
      const rawProgram = firstStudent?.program || 'G-CMP';
      const program = rawProgram.replace(/-/g, '_').toUpperCase(); // G_CMP / E_TIP

      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      // Always send uppercase type to match Prisma enum
      uploadData.append('type', formData.type.toUpperCase());
      uploadData.append('program', program);
      if (formData.track) uploadData.append('track', formData.track);
      uploadData.append('file', formData.file);
      uploadData.append('visibility', formData.visibility.toUpperCase());
      uploadData.append('metadata', JSON.stringify(metadata));
      // Send studentIds as a single JSON string so backend can parse reliably
      uploadData.append('studentIds', JSON.stringify(formData.selectedStudents));

      // Upload document
      await apiClient.post('documents/upload', uploadData);

      // Invalidate the documents cache so it updates instantly when navigating back
      queryClient.invalidateQueries({ queryKey: ['mentorDocuments'] });

      setUploadProgress(100);
      setSuccess(true);

      setTimeout(() => {
        router.push('/mentor/documents');
      }, 1500);

    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document. Please try again.');
    } finally {
      clearInterval(interval);
      setUploading(false);
    }
  };

  const getProgramColor = (program: string) => {
    const colors = {
      'G-GMP': 'bg-purple-100 text-purple-700',
      'G-CMP': 'bg-green-100 text-green-700',
      'E-TIP': 'bg-blue-100 text-blue-700',
    };
    return colors[program as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  // Get unique tracks from students
  const tracks = [...new Set(students.map(s => s.track))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/mentor/documents"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
      </div>

      {success ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
          <p className="text-gray-500 mb-4">Your document has been uploaded successfully.</p>
          <p className="text-sm text-gray-400">Redirecting to documents page...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Module 1: Introduction to AI"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Brief description of the document..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DocumentType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="learning_material">Learning Material</option>
                    <option value="assignment_material">Assignment</option>
                    <option value="pre_reading_material">Pre-Reading Material</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Track (Optional)
                  </label>
                  <select
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Tracks</option>
                    {tracks.map(track => (
                      <option key={track} value={track}>{track}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">File Upload</h2>
            
            <label
              htmlFor="file-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              
              {formData.file ? (
                <div className="space-y-3">
                  <FileText size={40} className="mx-auto text-orange-500" />
                  <p className="font-medium text-gray-900">{formData.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFormData({ ...formData, file: null });
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={40} className={`mx-auto mb-4 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your file here, or{' '}
                    <span className="text-orange-600 font-medium">browse</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Document Type Specific Fields */}
          {formData.type === 'assignment_material' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Assignment Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 100"
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'pre_reading_material' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Reading Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Reading Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.readingTime}
                  onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 30"
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Required checkbox */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.required}
                  onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                  className="rounded border-gray-300 mr-2"
                />
                <span className="text-sm text-gray-700">Required material</span>
              </label>
            </div>
          </div>

          {/* Mentor selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Upload Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uploading Mentor
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
                {mentor?.name || 'Mentor'}
              </div>
            </div>
          </div>

          {/* Student Selection - with scrolling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Share with Students</h2>
              <div className="text-sm text-gray-600">
                {formData.selectedStudents.length} of {students.length} selected
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search students by name or track..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <select
                value={formData.track}
                onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[150px]"
              >
                <option value="">All Tracks</option>
                {tracks.map(track => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
            </div>

            {/* Select All / Deselect All */}
            {filteredStudents.length > 0 && (
              <div className="mb-3 flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  {selectAll ? 'Deselect All' : 'Select All'} ({filteredStudents.length} students)
                </button>
                <span className="text-xs text-gray-500">
                  {formData.selectedStudents.length} selected total
                </span>
              </div>
            )}

            {/* Students List - with scrolling */}
            <div 
              className="border border-gray-200 rounded-lg overflow-y-auto"
              style={{ maxHeight: '500px' }}
            >
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No students found</p>
                  {studentSearchTerm && (
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting your search or filter
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedStudents.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        className="rounded border-gray-300 mr-3 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${getProgramColor(student.program)}`}>
                            {student.program}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">{student.track}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Summary */}
            {formData.selectedStudents.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  <span className="font-medium">{formData.selectedStudents.length}</span> student(s) selected
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  This document will be shared with the selected students.
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle size={18} className="text-red-500" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/mentor/documents"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading || !formData.file || formData.selectedStudents.length === 0}
              className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <span className="scale-75 mr-2"><LoaderOne /></span>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} className="mr-2" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}