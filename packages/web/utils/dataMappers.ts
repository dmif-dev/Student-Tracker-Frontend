import { Mentor, Student, Outcome, AssignedStudent } from '../services/mockData';
import { Document } from '@student-tracker/shared/models/Document';

// Map Prisma Mentor to Frontend Mentor
export const mapMentor = (backendMentor: any): Mentor => {
  return {
    id: backendMentor.id,
    name: backendMentor.name,
    email: backendMentor.user?.email || '',
    expertise: backendMentor.expertise || [],
    students: backendMentor.students || 0,
    programs: backendMentor.programs?.map((p: string) => p.replace('_', '-')) || [], // G_GMP -> G-GMP
    rating: backendMentor.rating || 0,
    status: backendMentor.status?.toLowerCase() as 'active' | 'inactive',
    joinDate: backendMentor.joinDate ? new Date(backendMentor.joinDate).toISOString().split('T')[0] : '',
    bio: backendMentor.bio,
    phone: backendMentor.phone,
    location: backendMentor.location,
    avatar: backendMentor.avatar,
    // Add these if they come from the backend, otherwise we'll fetch them separately or handle them in UI
    availability: backendMentor.availability || [],
    assignedStudents: backendMentor.assignedStudents?.map(mapAssignedStudent) || [],
  };
};

export const mapAssignedStudent = (backendStudent: any): AssignedStudent => {
  return {
    id: backendStudent.id,
    name: backendStudent.name,
    program: mapProgramType(backendStudent.program?.name || backendStudent.programId),
    track: backendStudent.track?.name || backendStudent.trackId || '',
    joinDate: backendStudent.joinDate ? new Date(backendStudent.joinDate).toISOString().split('T')[0] : '',
    progress: backendStudent.progress || 0,
    hasMentor: !!backendStudent.mentorId,
    // Add logic for lastSession and nextSession if provided by backend
  };
}

// Map Prisma Student to Frontend Student
export const mapStudent = (backendStudent: any): Student => {
  const programStr = backendStudent.programName || backendStudent.program?.name || (typeof backendStudent.program === 'string' ? backendStudent.program : null) || backendStudent.programId;
  const trackStr = backendStudent.trackName || backendStudent.track?.name || (typeof backendStudent.track === 'string' ? backendStudent.track : null) || backendStudent.trackId || '';
  const mentorStr = backendStudent.mentorName || backendStudent.mentor?.name || (typeof backendStudent.mentor === 'string' ? backendStudent.mentor : null) || backendStudent.mentorId;

  return {
    id: backendStudent.id,
    name: backendStudent.name,
    email: backendStudent.user?.email || backendStudent.email || '',
    registrationNumber: backendStudent.registrationNumber || '',
    program: mapProgramType(programStr),
    track: trackStr,
    mentor: mentorStr,
    status: backendStudent.status?.toLowerCase() as 'active' | 'inactive' | 'pending' | 'completed',
    joinDate: backendStudent.joinDate ? new Date(backendStudent.joinDate).toISOString().split('T')[0] : '',
    lastActive: backendStudent.lastActive ? new Date(backendStudent.lastActive).toISOString().split('T')[0] : '',
    progress: backendStudent.progress || 0,
    phone: backendStudent.phone,
    address: backendStudent.address,
    avatar: backendStudent.avatar,
    notes: backendStudent.additionalNotes || backendStudent.notes || backendStudent.bio || '',
    accountActive: backendStudent.accountActive,
    projects: backendStudent.projects,
    certifications: backendStudent.certifications,
    sessionStats: backendStudent.sessionStats,
  };
};

// Map Prisma Outcome to Frontend Outcome
export const mapOutcome = (backendOutcome: any): Outcome => {
  return {
    id: backendOutcome.id,
    type: backendOutcome.type?.toLowerCase() as 'patent' | 'paper' | 'project' | 'certification' | 'startup',
    title: backendOutcome.title,
    student: backendOutcome.student?.name || '',
    studentId: backendOutcome.studentId,
    status: backendOutcome.status?.toLowerCase() as 'pending' | 'filed' | 'published' | 'granted' | 'completed',
    date: backendOutcome.date ? new Date(backendOutcome.date).toISOString().split('T')[0] : '',
    mentor: backendOutcome.mentor?.name || '',
    program: mapProgramType(backendOutcome.program),
  };
};

// Map backend program type to frontend program string
export const mapProgramType = (programType: string): any => {
  if (!programType) return 'G-GMP';
  if (programType === 'G_GMP') return 'G-GMP';
  if (programType === 'G_CMP') return 'G-CMP';
  if (programType === 'E_TIP') return 'E-TIP';
  return programType as 'G-GMP' | 'G-CMP' | 'E-TIP' | 'PCP';
};

// Map Prisma Document to Frontend Document
export const mapDocument = (backendDoc: any): Document => {
  return {
    ...backendDoc,
    type: backendDoc.type?.toLowerCase() as any,
    permissions: {
      viewStudents: backendDoc.permissions?.filter((p: any) => p.canView && p.userRole !== 'MENTOR').map((p: any) => p.userId) || [],
      downloadStudents: backendDoc.permissions?.filter((p: any) => p.canDownload && p.userRole !== 'MENTOR').map((p: any) => p.userId) || [],
      viewMentors: backendDoc.permissions?.filter((p: any) => p.canView && p.userRole === 'MENTOR').map((p: any) => p.userId) || [],
      downloadMentors: backendDoc.permissions?.filter((p: any) => p.canDownload && p.userRole === 'MENTOR').map((p: any) => p.userId) || [],
    }
  };
};
