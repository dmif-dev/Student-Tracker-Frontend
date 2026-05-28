// packages/web/app/admin/documents/page.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  Code,
  Award,
  FolderOpen,
  Plus,
  X,
  Check,
  Clock,
  Calendar,
  Lock,
  Unlock
} from 'lucide-react';
import { DocumentService } from '@/services/documentService';
import { ApiService } from '@/services/api';
import { Document, DocumentType } from '@student-tracker/shared/models/Document';
import DocumentViewer from '@/components/common/DocumentViewer';
import LoaderOne from '@/components/ui/loader-one';
import { DocumentViewerService } from '@/services/documentViewerService';
import { FileHandlerService } from '@/services/fileHandlerService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// Define types for the component
interface Mentor {
  id: string;
  name: string;
  programs: string[];
}

interface Student {
  id: string;
  name: string;
  program: string;
  track: string;
}

interface UploadDocumentData {
  title: string;
  description: string;
  type: DocumentType;
  program: string;
  track: string;
  mentorId: string;
  file: File;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedById: string;
  visibility: 'student_only' | 'mentor_only' | 'both';
  metadata?: any;
  permissions: {
    viewStudents: string[];
    downloadStudents: string[];
    viewMentors: string[];
    downloadMentors: string[];
  };
  status: 'published';
}

// Define a local interface for the viewer document
interface ViewerDocument {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading: loadingDocs } = useQuery({
    queryKey: ['adminDocuments'],
    queryFn: () => ApiService.getAdminDocuments(),
    refetchInterval: 5000,
  });

  const { data: mentors = [], isLoading: loadingMentors } = useQuery({
    queryKey: ['mentors'],
    queryFn: () => ApiService.getMentors(),
  });

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => ApiService.getStudents(),
  });

  const loading = loadingDocs || loadingMentors || loadingStudents;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<'all' | 'G-CMP' | 'E-TIP' | 'G-GMP' | 'PCP'>('all');
  const [selectedType, setSelectedType] = useState<'all' | DocumentType>('all');
  const [selectedMentor, setSelectedMentor] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState<string | null>(null);
  const [editDocumentData, setEditDocumentData] = useState<any | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<ViewerDocument | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const { user } = useAuth();
  // Get admin ID from auth
  const ADMIN_ID = user?.id || 'admin';

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteAdminDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminDocuments'] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ApiService.updateAdminDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDocuments'] });
      setEditDocumentData(null);
    }
  });

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    await deleteMutation.mutateAsync(documentToDelete.id);
    setDocumentToDelete(null);
  };

  const filteredDocs = useMemo(() => {
    let filtered = [...documents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Program filter
    if (selectedProgram !== 'all') {
      filtered = filtered.filter(doc => doc.program === selectedProgram);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }

    // Mentor filter
    if (selectedMentor !== 'all') {
      filtered = filtered.filter(doc => doc.uploadedById === selectedMentor);
    }

    return filtered;
  }, [documents, searchTerm, selectedProgram, selectedType, selectedMentor]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getProgramIcon = (program: string) => {
    switch (program) {
      case 'G-GMP':
        return <Users size={16} className="text-purple-500" />;
      case 'G-CMP':
        return <Code size={16} className="text-green-500" />;
      case 'E-TIP':
        return <Award size={16} className="text-orange-500" />;
      case 'PCP':
        return <GraduationCap size={16} className="text-blue-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  // Add these handler functions
  // Update the handleView function to include description
  const handleView = async (doc: Document) => {
    setSelectedDocument({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
    });
    setShowViewer(true);
    
    // Track the view
    await ApiService.trackAdminDocumentView(doc.id);
  };

  const handleDownload = async (doc: Document, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    try {
      // Track the download
      await ApiService.trackAdminDocumentDownload(doc.id);
      
      // Download the file
      await FileHandlerService.downloadFile({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  const getTypeBadge = (type: DocumentType) => {
    const colors = {
      learning_material: 'bg-orange-100 text-orange-700',
      assignment_material: 'bg-yellow-100 text-yellow-700',
      pre_reading_material: 'bg-purple-100 text-purple-700',
    };
    const labels = {
      learning_material: 'Learning Material',
      assignment_material: 'Assignment',
      pre_reading_material: 'Pre-Reading',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type]}`}>
        {labels[type]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderOne />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage documents for all program students (G-GMP, G-CMP, E-TIP, PCP)
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Upload size={18} className="mr-2" />
          Upload Document
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-orange-700">
              <strong>Document Management:</strong> Upload learning materials and assignments for all program students. 
              Set permissions to control which students can view and download each document.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Programs</option>
            <option value="G-GMP">G-GMP</option>
            <option value="G-CMP">G-CMP</option>
            <option value="E-TIP">E-TIP</option>
            <option value="PCP">PCP</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="learning_material">Learning Materials</option>
            <option value="assignment_material">Assignments</option>
            <option value="pre_reading_material">Pre-Reading Materials</option>
          </select>

          <select
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Mentors</option>
            {mentors.map(mentor => (
              <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getProgramIcon(doc.program)}
                {getTypeBadge(doc.type)}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setShowPermissionModal(doc.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Manage Permissions"
                >
                  {doc.permissions.viewStudents.length > 0 ? (
                    <Unlock size={16} className="text-green-600" />
                  ) : (
                    <Lock size={16} className="text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => setEditDocumentData(doc)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Edit Document"
                >
                  <Edit size={16} className="text-gray-600" />
                </button>
                <button onClick={() => handleDeleteClick(doc)} className="p-1 hover:bg-gray-100 rounded text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{doc.title}</h3>
            {doc.description && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{doc.description}</p>
            )}

            <div className="flex items-center space-x-2 text-xs text-gray-400 mb-3">
              <span>{doc.fileName}</span>
              <span>•</span>
              <span>{formatFileSize(doc.fileSize)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Users size={12} className="text-gray-400" />
                <span className="text-gray-600">
                  {doc.permissions.viewStudents.length} students
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={12} className="text-gray-400" />
                <span className="text-gray-600">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {doc.metadata?.dueDate && (
              <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600">
                <Calendar size={12} />
                <span>Due: {new Date(doc.metadata.dueDate).toLocaleDateString()}</span>
              </div>
            )}

            {doc.metadata?.readingTime && (
              <div className="mt-2 flex items-center space-x-1 text-xs text-purple-600">
                <Clock size={12} />
                <span>{doc.metadata.readingTime} min read</span>
              </div>
            )}

            {doc.metadata?.required && (
              <div className="mt-2 flex items-center space-x-1 text-xs text-red-600">
                <Check size={12} />
                <span>Required</span>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Uploaded by {doc.uploadedBy}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleView(doc)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Preview"
                >
                  <Eye size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={(e) => handleDownload(doc, e)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Download"
                >
                  <Download size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500 mb-4">Get started by uploading your first document.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Upload size={18} className="mr-2" />
            Upload Document
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          mentors={mentors}
          students={students}
          onClose={() => setShowUploadModal(false)}
          onUpload={async (docData: UploadDocumentData) => {
            try {
              await ApiService.uploadAdminDocument(docData);
              queryClient.invalidateQueries({ queryKey: ['adminDocuments'] });
              setShowUploadModal(false);
              toast.success('Document uploaded successfully.');
            } catch (error: any) {
              toast.error(error?.message || 'Unable to upload document. Please try again.');
            }
          }}
        />
      )}

      {/* Edit Modal */}
      {editDocumentData && (
        <EditDocumentModal
          document={editDocumentData}
          mentors={mentors}
          onClose={() => setEditDocumentData(null)}
          onSave={async (id: string, data: any) => {
            await updateMutation.mutateAsync({ id, data });
          }}
          isSaving={updateMutation.isPending}
        />
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <PermissionModal
          documentId={showPermissionModal}
          documents={documents}
          students={students}
          onClose={() => setShowPermissionModal(null)}
          onUpdate={async (docId: string, permissions: any) => {
            await ApiService.updateAdminDocumentPermissions(docId, permissions);
            queryClient.invalidateQueries({ queryKey: ['adminDocuments'] });
            setShowPermissionModal(null);
          }}
        />
      )}

      {/* Document Viewer Modal */}
      {showViewer && (
        <DocumentViewer
          isOpen={showViewer}
          onClose={() => {
            setShowViewer(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      )}

      {/* Delete Confirmation Modal */}
      {documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete document?</h3>
                <p className="mt-1 text-sm text-gray-600">
                  This will permanently remove the document from the admin library.
                </p>
              </div>
              <button
                onClick={() => setDocumentToDelete(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close delete confirmation"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{documentToDelete.title}</p>
              <p className="mt-1 text-sm text-red-700">
                Are you sure you want to delete this file? This action cannot be undone.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDocumentToDelete(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete document'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==================== EditDocumentModal Component ====================

function EditDocumentModal({ document, mentors, onClose, onSave, isSaving }: any) {
  const programs: Record<string, string[]> = {
    'G-CMP': [
      'AI Product Development',
      'Full Stack Development',
      'Cloud Development & Deployment',
      'Agentic AI Development',
    ],
    'E-TIP': [
      'AI Product Development',
      'Full Stack',
      'Cloud Development',
      'Agentic AI',
      'Custom Track',
    ],
  };

  // Map backend enum values back to frontend-friendly strings
  const toProgram = (p: string) => (p === 'G_CMP' ? 'G-CMP' : p === 'E_TIP' ? 'E-TIP' : p);
  const toType = (t: string) => t.toLowerCase() as DocumentType;
  const toVisibility = (v: string) => v.toLowerCase() as 'student_only' | 'mentor_only' | 'both';

  const [formData, setFormData] = useState({
    title: document.title || '',
    description: document.description || '',
    type: toType(document.type),
    program: toProgram(document.program) as 'G-CMP' | 'E-TIP',
    track: document.track || '',
    mentorId: document.uploadedById || '',
    visibility: toVisibility(document.visibility),
    dueDate: document.metadata?.dueDate || '',
    points: document.metadata?.points ? String(document.metadata.points) : '',
    readingTime: document.metadata?.readingTime ? String(document.metadata.readingTime) : '',
    required: document.metadata?.required || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const metadata: any = {
      ...document.metadata,
      required: formData.required,
    };
    if (formData.type === 'assignment_material') {
      if (formData.dueDate) metadata.dueDate = formData.dueDate;
      if (formData.points) metadata.points = parseInt(formData.points);
    } else if (formData.type === 'pre_reading_material') {
      if (formData.readingTime) metadata.readingTime = parseInt(formData.readingTime);
    }

    const programEnum = formData.program === 'G-CMP' ? 'G_CMP' : 'E_TIP';
    const typeEnum = formData.type === 'learning_material' ? 'LEARNING_MATERIAL'
      : formData.type === 'assignment_material' ? 'ASSIGNMENT_MATERIAL'
      : 'PRE_READING_MATERIAL';
    const visibilityEnum = formData.visibility === 'student_only' ? 'STUDENT_ONLY'
      : formData.visibility === 'mentor_only' ? 'MENTOR_ONLY' : 'BOTH';

    await onSave(document.id, {
      title: formData.title,
      description: formData.description,
      type: typeEnum,
      program: programEnum,
      track: formData.track,
      uploadedById: formData.mentorId,
      visibility: visibilityEnum,
      metadata,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Program and Track */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value as 'G-CMP' | 'E-TIP', track: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="G-CMP">G-CMP</option>
                <option value="E-TIP">E-TIP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Track</label>
              <select
                value={formData.track}
                onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Tracks</option>
                {programs[formData.program].map((track) => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Document Type and Visibility */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DocumentType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="learning_material">Learning Material</option>
                <option value="assignment_material">Assignment</option>
                <option value="pre_reading_material">Pre-Reading Material</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibility *</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'student_only' | 'mentor_only' | 'both' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="student_only">Students Only</option>
                <option value="mentor_only">Mentors Only</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          {/* Assignment-specific fields */}
          {formData.type === 'assignment_material' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 100"
                />
              </div>
            </div>
          )}

          {/* Pre-reading specific fields */}
          {formData.type === 'pre_reading_material' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Reading Time (minutes)</label>
              <input
                type="number"
                value={formData.readingTime}
                onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., 30"
              />
            </div>
          )}

          {/* Required checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="edit-required"
              checked={formData.required}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              className="rounded border-gray-300 mr-2"
            />
            <label htmlFor="edit-required" className="text-sm">Required material</label>
          </div>

          {/* Mentor selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Mentor *</label>
            <select
              value={formData.mentorId}
              onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Mentor</option>
              {mentors.map((mentor: any) => (
                <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
              ))}
            </select>
          </div>

          {/* Current file info (read-only) */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p className="font-medium mb-1">Current File</p>
            <p>{document.fileName} ({document.fileSize ? (document.fileSize / 1024).toFixed(1) + ' KB' : 'unknown size'})</p>
            <p className="text-xs text-gray-400 mt-1">File cannot be changed in edit mode. Delete and re-upload to replace the file.</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <span className="scale-75 mr-2"><LoaderOne /></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== UploadDocumentModal Component ====================

function UploadDocumentModal({ mentors, students, onClose, onUpload }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'learning_material' as DocumentType,
    program: 'G-GMP' as any,
    track: '',
    mentorId: '',
    file: null as File | null,
    visibility: 'student_only' as 'student_only' | 'mentor_only' | 'both',
    selectedStudents: [] as string[],
    // New fields
    dueDate: '',
    points: '',
    readingTime: '',
    required: false,
  });

  const programs: Record<string, string[]> = {
    'G-GMP': [
      'Patent Track',
      'Entrepreneurship Track',
      'Research Paper Track',
    ],
    'G-CMP': [
      'AI Product Development',
      'Full Stack Development',
      'Cloud Development & Deployment',
      'Agentic AI Development',
    ],
    'E-TIP': [
      'AI Product Development',
      'Full Stack',
      'Cloud Development',
      'Agentic AI',
      'Custom Track',
    ],
    'PCP': [
      'AI Security',
      'Agentic AI Systems',
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.mentorId) return;

    const selectedMentor = mentors.find((m: any) => m.id === formData.mentorId);
    
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
    
    await onUpload({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      program: formData.program,
      track: formData.track,
      mentorId: formData.mentorId,
      file: formData.file,
      fileName: formData.file.name,
      fileSize: formData.file.size,
      fileType: formData.file.type,
      uploadedBy: selectedMentor?.name,
      uploadedById: formData.mentorId,
      visibility: formData.visibility,
      metadata,
      permissions: {
        viewStudents: formData.visibility === 'mentor_only' ? [] : formData.selectedStudents,
        downloadStudents: formData.visibility === 'mentor_only' ? [] : formData.selectedStudents,
        viewMentors: [formData.mentorId],
        downloadMentors: [formData.mentorId],
      },
      status: 'published' as const,
    });
  };

  const filteredStudents = students.filter((s: any) => 
    s.program === formData.program && 
    (formData.track ? s.track === formData.track : true)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upload Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Program and Track */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program *
              </label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  program: e.target.value as any,
                  track: '' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="G-GMP">G-GMP</option>
                <option value="G-CMP">G-CMP</option>
                <option value="E-TIP">E-TIP</option>
                <option value="PCP">PCP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Track
              </label>
              <select
                value={formData.track}
                onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Tracks</option>
                {programs[formData.program].map((track: string) => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Document Type and Visibility */}
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
                Visibility *
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  visibility: e.target.value as 'student_only' | 'mentor_only' | 'both' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="student_only">Students Only</option>
                <option value="mentor_only">Mentors Only</option>
                <option value="both">Both Students and Mentors</option>
              </select>
            </div>
          </div>

          {/* Assignment-specific fields */}
          {formData.type === 'assignment_material' && (
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
                />
              </div>
            </div>
          )}

          {/* Pre-reading specific fields */}
          {formData.type === 'pre_reading_material' && (
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
              />
            </div>
          )}

          {/* Required checkbox */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                className="rounded border-gray-300 mr-2"
              />
              <span className="text-sm">Required material</span>
            </label>
          </div>

          {/* Mentor selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Uploading Mentor *
            </label>
            <select
              value={formData.mentorId}
              onChange={(e) => setFormData({ ...formData, mentorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select Mentor</option>
              {mentors.map((mentor: any) => (
                <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
              ))}
            </select>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file) {
                  const allowedExtensions = ['.pdf', '.doc', '.docx'];
                  const fileName = file.name.toLowerCase();
                  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
                  
                  const allowedMimeTypes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  ];
                  const hasValidMime = allowedMimeTypes.includes(file.type);
                  
                  if (!hasValidExtension && !hasValidMime) {
                    toast.error('Only PDF, DOC, and DOCX files are allowed.');
                    e.target.value = ''; // Reset input
                    setFormData({ ...formData, file: null });
                    return;
                  }
                }
                setFormData({ ...formData, file });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Student selection - only if visibility is not mentor_only */}
          {formData.visibility !== 'mentor_only' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grant Access to Students
              </label>
              <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2">
                {filteredStudents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No students found for selected program/track
                  </p>
                ) : (
                  filteredStudents.map((student: any) => (
                    <label key={student.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={formData.selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          const newSelected = e.target.checked
                            ? [...formData.selectedStudents, student.id]
                            : formData.selectedStudents.filter(id => id !== student.id);
                          setFormData({ ...formData, selectedStudents: newSelected });
                        }}
                        className="rounded border-gray-300 mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.track}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Form actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== PermissionModal Component ====================

function PermissionModal({ documentId, documents, students, onClose, onUpdate }: any) {
  const document = documents.find((d: any) => d.id === documentId);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    document?.permissions.viewStudents || []
  );
  const [canDownload, setCanDownload] = useState<Record<string, boolean>>({});

  if (!document) return null;

  const filteredStudents = students.filter((s: any) => s.program === document.program);

  // Initialize download permissions
  useEffect(() => {
    const initialDownload: Record<string, boolean> = {};
    document.permissions.downloadStudents.forEach((id: string) => {
      initialDownload[id] = true;
    });
    setCanDownload(initialDownload);
  }, [document]);

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
      // Default download permission to true when adding
      setCanDownload({ ...canDownload, [studentId]: true });
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
      const newDownload = { ...canDownload };
      delete newDownload[studentId];
      setCanDownload(newDownload);
    }
  };

  const handleDownloadToggle = (studentId: string, checked: boolean) => {
    setCanDownload({ ...canDownload, [studentId]: checked });
  };

  const handleSave = () => {
    // Build permissions object
    const viewStudents = selectedStudents;
    const downloadStudents = selectedStudents.filter(id => canDownload[id]);
    
    onUpdate(documentId, {
      viewStudents,
      downloadStudents,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Manage Permissions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700">{document.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            Select students who can view and download this document
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">View</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student: any) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.track}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => handleStudentToggle(student.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={canDownload[student.id] || false}
                      onChange={(e) => handleDownloadToggle(student.id, e.target.checked)}
                      disabled={!selectedStudents.includes(student.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No students found for this program</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            {selectedStudents.length} students selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Save Permissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

