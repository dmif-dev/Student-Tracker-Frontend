// packages/web/app/mentor/documents/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Users,
  Plus,
  X
} from 'lucide-react';
import { DocumentService } from '@/services/documentService';
import { useMentorDocuments, useCurrentMentor } from '@/hooks/api/useMentor';
import { apiClient } from '@/utils/apiClient';
import { Document, DocumentType } from '@student-tracker/shared/models/Document';
import DocumentViewer from '@/components/common/DocumentViewer';
import { DocumentViewerService } from '@/services/documentViewerService';
import { FileHandlerService } from '@/services/fileHandlerService';
import { Button } from "@/components/ui/button";
import LoaderOne from "@/components/ui/loader-one";

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

export default function MentorDocumentsPage() {
  const { data: mentor } = useCurrentMentor();
  const { data: fetchedDocuments, isLoading: documentsLoading, refetch } = useMentorDocuments();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | DocumentType>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<ViewerDocument | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  
  // Edit State
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [isUpdating, setIsUpdating] = useState(false);

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
    if (mentor?.id) {
      await DocumentViewerService.trackView(doc.id, mentor.id, 'mentor');
    }
  };

  const handleDownload = async (doc: Document, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    try {
      // Track the download
      if (mentor?.id) {
        await DocumentViewerService.trackDownload(doc.id, mentor.id, 'mentor');
      }
      
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
      alert('Failed to download file. Please try again.');
    }
  };

  useEffect(() => {
    if (fetchedDocuments) {
      setDocuments(fetchedDocuments);
      setFilteredDocs(fetchedDocuments);
    }
  }, [fetchedDocuments]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedType]);



  const filterDocuments = () => {
    let filtered = [...documents];

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }

    setFilteredDocs(filtered);
  };

  const handleDelete = async (docId: string) => {
    try {
      await apiClient.delete(`documents/${docId}`);
      setDocuments(documents.filter(d => d.id !== docId));
      setShowDeleteModal(null);
      refetch();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const openEditModal = (doc: Document) => {
    setEditingDocument(doc);
    setEditForm({ title: doc.title, description: doc.description || '' });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDocument) return;
    
    setIsUpdating(true);
    try {
      await apiClient.put(`documents/${editingDocument.id}`, editForm);
      setDocuments(documents.map(d => d.id === editingDocument.id ? { ...d, ...editForm } as Document : d));
      setEditingDocument(null);
      refetch();
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Failed to update document');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTypeBadge = (type: DocumentType) => {
    const colors = {
      learning_material: 'bg-blue-100 text-blue-700',
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

  if (documentsLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your learning materials and assignments
          </p>
        </div>
          <Link href="/mentor/documents/upload">
            <Button className="font-montserrat font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 text-white">
              <Upload size={18} className="mr-2 h-4 w-4" /> Upload New Document
            </Button>
          </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Documents</p>
          <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Learning Materials</p>
          <p className="text-2xl font-bold text-blue-600">
            {documents.filter(d => d.type === 'learning_material').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Assignments</p>
          <p className="text-2xl font-bold text-yellow-600">
            {documents.filter(d => d.type === 'assignment_material').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Pre-Reading</p>
          <p className="text-2xl font-bold text-purple-600">
            {documents.filter(d => d.type === 'pre_reading_material').length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="learning_material">Learning Materials</option>
            <option value="assignment_material">Assignments</option>
            <option value="pre_reading_material">Pre-Reading</option>
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
                <FileText size={18} className="text-gray-500" />
                {getTypeBadge(doc.type)}
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => openEditModal(doc)}
                  className="p-1 hover:bg-gray-100 rounded" 
                  title="Edit"
                >
                  <Edit size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(doc.id)}
                  className="p-1 hover:bg-gray-100 rounded text-red-500"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{doc.title}</h3>
            {doc.description && (
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{doc.description}</p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{doc.fileName}</span>
              <span>{formatFileSize(doc.fileSize)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Users size={12} className="text-gray-400" />
                <span>{doc.permissions.viewStudents.length} students</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={12} className="text-gray-400" />
                <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {doc.metadata?.dueDate && (
              <div className="mt-2 flex items-center space-x-1 text-xs text-orange-600">
                <Calendar size={12} />
                <span>Due: {new Date(doc.metadata.dueDate).toLocaleDateString()}</span>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {doc.metadata?.required ? 'Required' : 'Optional'}
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
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? 'No documents match your search criteria'
              : 'Upload your first document to get started'}
          </p>
          <Link
            href="/mentor/documents/upload"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Upload size={18} className="mr-2" />
            Upload Document
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Delete Document</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {editingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Document</h3>
              <button onClick={() => setEditingDocument(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingDocument(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </div>
  );
}