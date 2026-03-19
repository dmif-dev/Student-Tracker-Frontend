// packages/web/components/common/DocumentViewer.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, Download, FileText, File, FileImage, FileArchive, AlertCircle, ExternalLink } from 'lucide-react';
import { FileHandlerService } from '@/services/fileHandlerService';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    title: string;
    description?: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
  } | null;
}

export default function DocumentViewer({ isOpen, onClose, document: doc }: DocumentViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'word' | 'text' | 'unsupported'>('unsupported');

  useEffect(() => {
    if (isOpen && doc) {
      loadPreview();
    }
    
    // Cleanup URLs when component unmounts or doc changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, doc]);

  const loadPreview = async () => {
    if (!doc) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Determine preview type based on file type
      if (doc.fileType.includes('pdf')) {
        setPreviewType('pdf');
      } else if (doc.fileType.includes('image')) {
        setPreviewType('image');
      } else if (doc.fileType.includes('word') || doc.fileType.includes('document')) {
        setPreviewType('word');
      } else if (doc.fileType.includes('text')) {
        setPreviewType('text');
      } else {
        setPreviewType('unsupported');
      }

      // For Word documents, we might still try to get a preview URL
      // but we'll show a different UI
      const url = await FileHandlerService.getPreviewUrl(doc);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Error loading preview:', err);
      setError('Failed to load document preview');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !doc) return null;

  const getFileIcon = () => {
    if (doc.fileType.includes('pdf')) {
      return <FileText size={48} className="text-red-500" />;
    } else if (doc.fileType.includes('image')) {
      return <FileImage size={48} className="text-blue-500" />;
    } else if (doc.fileType.includes('zip') || doc.fileType.includes('rar')) {
      return <FileArchive size={48} className="text-yellow-500" />;
    } else if (doc.fileType.includes('word') || doc.fileType.includes('document')) {
      return <FileText size={48} className="text-blue-700" />;
    } else {
      return <File size={48} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = async () => {
    try {
      await FileHandlerService.downloadFile(doc);
      console.log('Downloaded:', doc.id);
    } catch (error) {
      console.error('Error downloading:', error);
      setError('Failed to download file');
    }
  };

  const getWordPreview = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FileText size={64} className="text-blue-700 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Word Document</h3>
        <p className="text-sm text-gray-500 text-center mb-6 max-w-md">
          This document cannot be previewed directly in the browser. 
          Please download it to view the content.
        </p>
        
        {/* Option 1: Using Google Docs Viewer (if file is publicly accessible) */}
        {previewUrl && previewUrl.startsWith('blob:') && (
          <div className="w-full mb-4">
            <p className="text-xs text-gray-400 mb-2 text-center">
              Attempting to preview as HTML...
            </p>
            <iframe
              src={previewUrl}
              className="w-full h-[400px] border border-gray-200 rounded-lg"
              title={doc.title}
            />
          </div>
        )}
        
        <div className="flex space-x-4">
          <button
            onClick={handleDownload}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Download size={18} className="mr-2" />
            Download to View
          </button>
          
          {/* Option 2: Open with external viewer (if available) */}
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ExternalLink size={18} className="mr-2" />
              Open in New Tab
            </a>
          )}
        </div>
        
        <p className="text-xs text-gray-400 mt-4">
          For best results, download the file and open with Microsoft Word or compatible software.
        </p>
      </div>
    );
  };

  const getFilePreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p className="text-red-600 mb-2">Failed to load document</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={loadPreview}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          {getFileIcon()}
          <p className="mt-4 text-gray-600">Preview not available</p>
          <button
            onClick={handleDownload}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Download to View
          </button>
        </div>
      );
    }

    // Handle different preview types
    switch (previewType) {
      case 'pdf':
        return (
          <iframe
            src={previewUrl}
            className="w-full h-[600px] border-0"
            title={doc.title}
          />
        );
      
      case 'image':
        return (
          <div className="flex items-center justify-center">
            <img
              src={previewUrl}
              alt={doc.title}
              className="max-w-full max-h-[600px] object-contain"
            />
          </div>
        );
      
      case 'word':
        return getWordPreview();
      
      case 'text':
        return (
          <iframe
            src={previewUrl}
            className="w-full h-[500px] border border-gray-200 rounded-lg"
            title={doc.title}
          />
        );
      
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            {getFileIcon()}
            <p className="mt-4 text-gray-600">Preview not available for this file type</p>
            <button
              onClick={handleDownload}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Download to View
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{doc.title}</h3>
            <p className="text-sm text-gray-500">
              {doc.fileName} • {formatFileSize(doc.fileSize)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={20} className="text-gray-700" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {getFilePreview()}
        </div>
      </div>
    </div>
  );
}