export type TagCategory = 'skill' | 'interest' | 'project' | 'achievement' | 'custom';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category: TagCategory;
  color?: string;
  description?: string;
  usageCount: number;
  createdAt: string;
  createdBy?: string;
}

export interface TagAssignment {
  id: string;
  tagId: string;
  entityId: string;
  entityType: 'student' | 'mentor' | 'project' | 'outcome';
  assignedAt: string;
  assignedBy?: string;
}

export interface TagGroup {
  id: string;
  name: string;
  tags: string[]; // tag ids
  description?: string;
}