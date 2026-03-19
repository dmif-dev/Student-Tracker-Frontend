// packages/web/services/documentViewerService.ts

import { Document } from '@student-tracker/shared/models/Document';

class DocumentViewerServiceClass {
  // Track document views
  async trackView(documentId: string, userId: string, userRole: 'admin' | 'mentor' | 'student') {
    // In a real app, this would call an API to track the view
    console.log(`Document ${documentId} viewed by ${userRole} ${userId}`);
    
    // You could store this in localStorage for demo purposes
    const viewedDocs = JSON.parse(localStorage.getItem('viewed_documents') || '{}');
    viewedDocs[documentId] = {
      viewedAt: new Date().toISOString(),
      userId,
      userRole,
    };
    localStorage.setItem('viewed_documents', JSON.stringify(viewedDocs));
  }

  // Track document downloads
  async trackDownload(documentId: string, userId: string, userRole: 'admin' | 'mentor' | 'student') {
    // In a real app, this would call an API to track the download
    console.log(`Document ${documentId} downloaded by ${userRole} ${userId}`);
    
    // You could store this in localStorage for demo purposes
    const downloadedDocs = JSON.parse(localStorage.getItem('downloaded_documents') || '{}');
    downloadedDocs[documentId] = {
      downloadedAt: new Date().toISOString(),
      userId,
      userRole,
    };
    localStorage.setItem('downloaded_documents', JSON.stringify(downloadedDocs));
  }

  // Generate a mock download URL (in real app, this would come from your API)
  getDocumentUrl(document: Document): string {
    // For demo purposes, return a data URL or mock path
    // In production, this would be a signed URL from your storage service
    return document.fileUrl || '#';
  }

  // Check if document was viewed by user
  wasViewed(documentId: string, userId: string): boolean {
    const viewedDocs = JSON.parse(localStorage.getItem('viewed_documents') || '{}');
    return !!viewedDocs[documentId] && viewedDocs[documentId].userId === userId;
  }

  // Check if document was downloaded by user
  wasDownloaded(documentId: string, userId: string): boolean {
    const downloadedDocs = JSON.parse(localStorage.getItem('downloaded_documents') || '{}');
    return !!downloadedDocs[documentId] && downloadedDocs[documentId].userId === userId;
  }
}

export const DocumentViewerService = new DocumentViewerServiceClass();