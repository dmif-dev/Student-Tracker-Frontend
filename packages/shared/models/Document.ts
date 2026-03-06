// packages/shared/models/Document.ts

export type DocumentType = 'learning_material' | 'assignment_material' | 'pre_reading_material';
export type DocumentVisibility = 'mentor_only' | 'student_only' | 'both';
export type DocumentStatus = 'draft' | 'published' | 'archived';

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string; // mime type
  fileUrl: string;
  uploadedBy: string; // mentor ID
  uploadedById: string;
  program: 'G-CMP' | 'E-TIP'; // Only for these programs
  track?: string; // Optional track-specific
  visibility: DocumentVisibility;
  status: DocumentStatus;
  permissions: {
    viewStudents: string[]; // student IDs who can view
    downloadStudents: string[]; // student IDs who can download
    viewMentors: string[]; // mentor IDs who can view (usually just uploader)
    downloadMentors: string[]; // mentor IDs who can download
  };
  metadata?: {
    version?: number;
    dueDate?: string; // for assignments
    points?: number; // for assignments
    tags?: string[];
    readingTime?: number; // estimated reading time in minutes
    required?: boolean; // whether it's required reading
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  program: 'G-CMP' | 'E-TIP';
  track?: string;
  documents: string[]; // document IDs
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  userRole: 'student' | 'mentor';
  canView: boolean;
  canDownload: boolean;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}