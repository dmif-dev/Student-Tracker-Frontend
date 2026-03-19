// packages/web/services/documentService.ts

import { Document, DocumentFolder, DocumentPermission, DocumentStatus, DocumentType } from '@student-tracker/shared/models/Document';
import { ApiService } from './api';    


// Add a storage for file contents
interface StoredFile {
  id: string;
  content: string | ArrayBuffer; // Store as base64 or data URL
  type: string;
  name: string;
}

class DocumentServiceClass {
  private documents: Document[] = [];
  private folders: DocumentFolder[] = [];
  private permissions: DocumentPermission[] = [];
  private storedFiles: StoredFile[] = []; // New: store actual file contents

  // Initialize with mock data
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock documents with updated types
    this.documents = [
      {
        id: 'doc1',
        title: 'G-CMP Module 1: Introduction to AI Product Development',
        description: 'Learning materials for Week 1-2 covering AI fundamentals',
        type: 'learning_material' as DocumentType,
        fileName: 'gcmp_module1_intro_ai.pdf',
        fileSize: 2.4 * 1024 * 1024, // 2.4 MB
        fileType: 'application/pdf',
        fileUrl: '/mock-docs/gcmp_module1.pdf',
        uploadedBy: 'Dr. Smith',
        uploadedById: '1',
        program: 'G-CMP',
        track: 'AI Product Development',
        visibility: 'student_only',
        status: 'published' as DocumentStatus,
        permissions: {
          viewStudents: ['2', '7'], // Jane Smith, David Lee
          downloadStudents: ['2', '7'],
          viewMentors: ['1'],
          downloadMentors: ['1'],
        },
        metadata: {
          version: 1,
          tags: ['AI', 'fundamentals', 'module1'],
          readingTime: 45, // 45 minutes reading time
          required: true,
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'doc2',
        title: 'G-CMP Assignment 1: Build a Simple AI Model',
        description: 'First assignment - due in 2 weeks',
        type: 'assignment_material' as DocumentType,
        fileName: 'gcmp_assignment1_ai_model.pdf',
        fileSize: 1.2 * 1024 * 1024,
        fileType: 'application/pdf',
        fileUrl: '/mock-docs/gcmp_assignment1.pdf',
        uploadedBy: 'Prof. Johnson',
        uploadedById: '2',
        program: 'G-CMP',
        track: 'AI Product Development',
        visibility: 'student_only',
        status: 'published' as DocumentStatus,
        permissions: {
          viewStudents: ['2'],
          downloadStudents: ['2'],
          viewMentors: ['2'],
          downloadMentors: ['2'],
        },
        metadata: {
          version: 1,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          points: 100,
          tags: ['assignment', 'ai-model'],
          required: true,
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'doc3',
        title: 'G-CMP Week 3: Pre-reading on Neural Networks',
        description: 'Pre-reading material before Week 3 session',
        type: 'pre_reading_material' as DocumentType,
        fileName: 'gcmp_prereading_neural_nets.pdf',
        fileSize: 1.8 * 1024 * 1024,
        fileType: 'application/pdf',
        fileUrl: '/mock-docs/gcmp_prereading.pdf',
        uploadedBy: 'Dr. Smith',
        uploadedById: '1',
        program: 'G-CMP',
        track: 'AI Product Development',
        visibility: 'student_only',
        status: 'published' as DocumentStatus,
        permissions: {
          viewStudents: ['2', '7'],
          downloadStudents: ['2', '7'],
          viewMentors: ['1'],
          downloadMentors: ['1'],
        },
        metadata: {
          version: 1,
          tags: ['neural-networks', 'pre-reading'],
          readingTime: 30,
          required: true,
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'doc4',
        title: 'E-TIP Module: Cloud Architecture Patterns',
        description: 'Advanced cloud architecture patterns for executives',
        type: 'learning_material' as DocumentType,
        fileName: 'etip_cloud_patterns.pdf',
        fileSize: 3.1 * 1024 * 1024,
        fileType: 'application/pdf',
        fileUrl: '/mock-docs/etip_cloud.pdf',
        uploadedBy: 'Dr. Williams',
        uploadedById: '3',
        program: 'E-TIP',
        track: 'Cloud Development',
        visibility: 'student_only',
        status: 'published' as DocumentStatus,
        permissions: {
          viewStudents: ['3', '8'],
          downloadStudents: ['3', '8'],
          viewMentors: ['3'],
          downloadMentors: ['3'],
        },
        metadata: {
          version: 2,
          tags: ['cloud', 'architecture', 'executive'],
          readingTime: 60,
          required: false,
        },
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'doc5',
        title: 'E-TIP Assignment: Design a Cloud Migration Strategy',
        description: 'Final assignment for Cloud Development track',
        type: 'assignment_material' as DocumentType,
        fileName: 'etip_assignment_cloud_strategy.pdf',
        fileSize: 2.2 * 1024 * 1024,
        fileType: 'application/pdf',
        fileUrl: '/mock-docs/etip_assignment.pdf',
        uploadedBy: 'Dr. Williams',
        uploadedById: '3',
        program: 'E-TIP',
        track: 'Cloud Development',
        visibility: 'student_only',
        status: 'published' as DocumentStatus,
        permissions: {
          viewStudents: ['3', '8'],
          downloadStudents: ['3', '8'],
          viewMentors: ['3'],
          downloadMentors: ['3'],
        },
        metadata: {
          version: 1,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          points: 200,
          tags: ['assignment', 'cloud', 'migration'],
          required: true,
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

     // Create mock stored files for demo documents
    this.documents.forEach(doc => {
      // Create a sample text content for each document
      const sampleContent = this.createSampleContent(doc);
      this.storedFiles.push({
        id: doc.id,
        content: sampleContent,
        type: doc.fileType,
        name: doc.fileName,
      });
    });

    // Mock folders
    this.folders = [
      {
        id: 'folder1',
        name: 'G-CMP Learning Materials',
        description: 'All learning materials for G-CMP students',
        program: 'G-CMP',
        documents: ['doc1', 'doc2', 'doc3'],
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'folder2',
        name: 'E-TIP Resources',
        description: 'Executive program resources',
        program: 'E-TIP',
        documents: ['doc4', 'doc5'],
        createdBy: '3',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'folder3',
        name: 'G-CMP Pre-Reading Materials',
        description: 'Materials to read before sessions',
        program: 'G-CMP',
        documents: ['doc3'],
        createdBy: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

    // Helper to create sample content for mock documents
  private createSampleContent(doc: Document): string {
    return `This is a sample content for ${doc.title}.

            Document Type: ${doc.type}
            Description: ${doc.description || 'No description'}

            This is placeholder content for demonstration purposes.
            In a real application, this would be the actual uploaded file content.

            --- 
            Generated by DMIF Student Tracker
            `;
  }
  

  // Get all documents with filters
  async getDocuments(filters?: {
    program?: 'G-CMP' | 'E-TIP';
    track?: string;
    type?: DocumentType;
    mentorId?: string;
    studentId?: string;
    status?: DocumentStatus;
  }): Promise<Document[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...this.documents];
    
    if (filters?.program) {
      filtered = filtered.filter(d => d.program === filters.program);
    }
    if (filters?.track) {
      filtered = filtered.filter(d => d.track === filters.track);
    }
    if (filters?.type) {
      // Now TypeScript knows that both d.type and filters.type are of type DocumentType
      filtered = filtered.filter(d => d.type === filters.type);
    }
    if (filters?.mentorId) {
      filtered = filtered.filter(d => d.uploadedById === filters.mentorId);
    }
    if (filters?.studentId) {
      filtered = filtered.filter(d => 
        d.permissions.viewStudents.includes(filters.studentId!) ||
        d.permissions.downloadStudents.includes(filters.studentId!)
      );
    }
    if (filters?.status) {
      filtered = filtered.filter(d => d.status === filters.status);
    }
    
    return filtered;
  }

  // Get document by ID
  async getDocumentById(id: string): Promise<Document | undefined> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.documents.find(d => d.id === id);
  }

  // Upload new document with actual file content
  async uploadDocument(documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'fileUrl'> & { file: File }): Promise<Document> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Read the actual file content
    const fileContent = await this.readFileAsDataURL(documentData.file);
    
    // Generate a unique ID
    const docId = `doc${Date.now()}`;
    
    // Store the file content
    this.storedFiles.push({
      id: docId,
      content: fileContent,
      type: documentData.file.type,
      name: documentData.file.name,
    });
    
    // Create a data URL for preview (in real app, this would be a server URL)
    const fileUrl = fileContent; // Use the data URL directly
    
    const newDocument: Document = {
      id: docId,
      ...documentData,
      fileUrl, // Now this contains the actual file data
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.documents.push(newDocument);
    return newDocument;
  }

  // Helper to read file as data URL
  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Get document with actual file content
  async getDocumentWithContent(id: string): Promise<{ document: Document; content: string } | undefined> {
    const document = this.documents.find(d => d.id === id);
    const storedFile = this.storedFiles.find(f => f.id === id);
    
    if (!document || !storedFile) return undefined;
    
    return {
      document,
      content: storedFile.content as string,
    };
  }

  // Get file content for a document
  async getFileContent(id: string): Promise<string | undefined> {
    const storedFile = this.storedFiles.find(f => f.id === id);
    return storedFile?.content as string;
  }

  // Update document
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = this.documents.findIndex(d => d.id === id);
    if (index !== -1) {
      this.documents[index] = {
        ...this.documents[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return this.documents[index];
    }
    return undefined;
  }

  // Delete document
  async deleteDocument(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = this.documents.findIndex(d => d.id === id);
    if (index !== -1) {
      this.documents.splice(index, 1);
      return true;
    }
    return false;
  }

  // Set document permissions
  async setPermissions(
    documentId: string,
    permissions: {
      viewStudents?: string[];
      downloadStudents?: string[];
      viewMentors?: string[];
      downloadMentors?: string[];
    }
  ): Promise<Document | undefined> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const doc = await this.getDocumentById(documentId);
    if (!doc) return undefined;
    
    doc.permissions = {
      ...doc.permissions,
      ...permissions,
    };
    doc.updatedAt = new Date().toISOString();
    
    return doc;
  }

  // Grant permission to specific student
  async grantStudentPermission(
    documentId: string,
    studentId: string,
    canView: boolean = true,
    canDownload: boolean = true
  ): Promise<Document | undefined> {
    const doc = await this.getDocumentById(documentId);
    if (!doc) return undefined;
    
    if (canView && !doc.permissions.viewStudents.includes(studentId)) {
      doc.permissions.viewStudents.push(studentId);
    }
    if (canDownload && !doc.permissions.downloadStudents.includes(studentId)) {
      doc.permissions.downloadStudents.push(studentId);
    }
    
    doc.updatedAt = new Date().toISOString();
    return doc;
  }

  // Revoke permission from student
  async revokeStudentPermission(
    documentId: string,
    studentId: string
  ): Promise<Document | undefined> {
    const doc = await this.getDocumentById(documentId);
    if (!doc) return undefined;
    
    doc.permissions.viewStudents = doc.permissions.viewStudents.filter(id => id !== studentId);
    doc.permissions.downloadStudents = doc.permissions.downloadStudents.filter(id => id !== studentId);
    
    doc.updatedAt = new Date().toISOString();
    return doc;
  }

  // Get documents accessible to a student
  async getStudentDocuments(studentId: string): Promise<Document[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return this.documents.filter(doc =>
      doc.permissions.viewStudents.includes(studentId) ||
      doc.permissions.downloadStudents.includes(studentId)
    );
  }

  // Get documents uploaded by a mentor
  async getMentorDocuments(mentorId: string): Promise<Document[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return this.documents.filter(doc => doc.uploadedById === mentorId);
  }

  // Get folders
  async getFolders(program?: 'G-CMP' | 'E-TIP'): Promise<DocumentFolder[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (program) {
      return this.folders.filter(f => f.program === program);
    }
    return this.folders;
  }

  // Create folder
  async createFolder(folderData: Omit<DocumentFolder, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentFolder> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const newFolder: DocumentFolder = {
      id: `folder${Date.now()}`,
      ...folderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.folders.push(newFolder);
    return newFolder;
  }

  // Add document to folder
  async addDocumentToFolder(folderId: string, documentId: string): Promise<DocumentFolder | undefined> {
    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) return undefined;
    
    if (!folder.documents.includes(documentId)) {
      folder.documents.push(documentId);
      folder.updatedAt = new Date().toISOString();
    }
    
    return folder;
  }

  // Remove document from folder
  async removeDocumentFromFolder(folderId: string, documentId: string): Promise<DocumentFolder | undefined> {
    const folder = this.folders.find(f => f.id === folderId);
    if (!folder) return undefined;
    
    folder.documents = folder.documents.filter(id => id !== documentId);
    folder.updatedAt = new Date().toISOString();
    
    return folder;
  }
}

export const DocumentService = new DocumentServiceClass();