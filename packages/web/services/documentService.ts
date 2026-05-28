// packages/web/services/documentService.ts

import { Document, DocumentFolder, DocumentPermission, DocumentStatus, DocumentType } from '@student-tracker/shared/models/Document';
import { apiClient } from '@/utils/apiClient';

class DocumentServiceClass {
  // Get all documents with filters
  async getDocuments(filters?: any): Promise<Document[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    return await apiClient.get<Document[]>(`documents?${params.toString()}`);
  }

  // Get document by ID
  async getDocumentById(id: string): Promise<Document | undefined> {
    try {
      return await apiClient.get<Document>(`documents/${id}`);
    } catch {
      return undefined;
    }
  }

  // Upload new document
  async uploadDocument(documentData: any): Promise<Document> {
    const formData = new FormData();
    Object.keys(documentData).forEach(key => {
      if (documentData[key] !== undefined) {
        if (typeof documentData[key] === 'object' && key !== 'file') {
          formData.append(key, JSON.stringify(documentData[key]));
        } else {
          formData.append(key, documentData[key]);
        }
      }
    });
    return await apiClient.post<Document>('documents/upload', formData);
  }

  // Get document with actual file content for preview
  async getDocumentWithContent(id: string): Promise<{ document: Document; content: string } | undefined> {
    try {
      const document = await this.getDocumentById(id);
      if (!document) return undefined;
      const blob = await apiClient.getBlob(`documents/${id}/download`);
      return {
        document,
        content: URL.createObjectURL(blob),
      };
    } catch {
      return undefined;
    }
  }

  // Get file content (URL) for a document
  async getFileContent(id: string): Promise<string | undefined> {
    try {
      const blob = await apiClient.getBlob(`documents/${id}/download`);
      return URL.createObjectURL(blob);
    } catch {
      return undefined;
    }
  }

  // Update document
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    try {
      return await apiClient.put<Document>(`documents/${id}`, updates);
    } catch {
      return undefined;
    }
  }

  // Delete document
  async deleteDocument(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`documents/${id}`);
      return true;
    } catch {
      return false;
    }
  }

  // Set document permissions
  async setPermissions(documentId: string, permissions: any): Promise<Document | undefined> {
    return await apiClient.post<Document>(`documents/${documentId}/permissions/bulk`, permissions);
  }

  // Grant permission to specific student
  async grantStudentPermission(
    documentId: string,
    studentId: string,
    canView: boolean = true,
    canDownload: boolean = true
  ): Promise<Document | undefined> {
    return await apiClient.post<Document>(`documents/${documentId}/permissions`, { 
      targetId: studentId, 
      targetType: 'STUDENT', 
      canView, 
      canDownload 
    });
  }

  // Revoke permission from student
  async revokeStudentPermission(
    documentId: string,
    studentId: string
  ): Promise<Document | undefined> {
    try {
      await apiClient.delete(`documents/${documentId}/permissions/${studentId}`);
      return await this.getDocumentById(documentId);
    } catch {
      return undefined;
    }
  }

  // Get documents accessible to a student
  async getStudentDocuments(studentId: string): Promise<Document[]> {
    return await apiClient.get<Document[]>(`documents?studentId=${studentId}`);
  }

  // Get documents uploaded by a mentor
  async getMentorDocuments(mentorId: string): Promise<Document[]> {
    return await apiClient.get<Document[]>(`documents?mentorId=${mentorId}`);
  }

  // Get folders
  async getFolders(program?: 'G-CMP' | 'E-TIP'): Promise<DocumentFolder[]> {
    const url = program ? `documents/folders?program=${program}` : 'documents/folders';
    return await apiClient.get<DocumentFolder[]>(url);
  }

  // Create folder
  async createFolder(folderData: Omit<DocumentFolder, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentFolder> {
    return await apiClient.post<DocumentFolder>('documents/folders', folderData);
  }

  // Add document to folder
  async addDocumentToFolder(folderId: string, documentId: string): Promise<DocumentFolder | undefined> {
    return await apiClient.post<DocumentFolder>(`documents/folders/${folderId}/documents/${documentId}`, {});
  }

  // Remove document from folder
  async removeDocumentFromFolder(folderId: string, documentId: string): Promise<DocumentFolder | undefined> {
    try {
      await apiClient.delete(`documents/folders/${folderId}/documents/${documentId}`);
      // Would return folder in a real scenario, returning undefined to match old signature for now
      return undefined; 
    } catch {
      return undefined;
    }
  }
}

export const DocumentService = new DocumentServiceClass();