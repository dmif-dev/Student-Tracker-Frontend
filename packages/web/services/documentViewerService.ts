// packages/web/services/documentViewerService.ts

import { Document } from '@student-tracker/shared/models/Document';
import { apiClient } from '../utils/apiClient';

class DocumentViewerServiceClass {
  // Track document views (Now handled backend-side via view endpoint, keeping for compatibility if explicitly needed)
  async trackView(documentId: string, userId: string, userRole: 'admin' | 'mentor' | 'student') {
    try {
      // Intentionally calling the view endpoint to register a view
      await apiClient.getBlob(`documents/${documentId}/view`);
    } catch {
      console.warn('Failed to track document view');
    }
  }

  // Track document downloads
  async trackDownload(documentId: string, userId: string, userRole: 'admin' | 'mentor' | 'student') {
    try {
      // Backend should track it upon download
      // No specific track endpoint, download handled by FileHandlerService
    } catch {
      // Silent catch
    }
  }

  // Generate a mock download URL (in real app, this would come from your API)
  getDocumentUrl(document: Document): string {
    // In production, the file URL is fetched securely via FileHandlerService / blob download.
    // Fallback to URL if it exists
    return document.fileUrl || '#';
  }

  // Check if document was viewed by user
  wasViewed(documentId: string, userId: string): boolean {
    return false; // Backend should provide this in a real stats endpoint
  }

  // Check if document was downloaded by user
  wasDownloaded(documentId: string, userId: string): boolean {
    return false; // Backend should provide this in a real stats endpoint
  }
}

export const DocumentViewerService = new DocumentViewerServiceClass();