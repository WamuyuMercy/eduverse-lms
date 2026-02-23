// =============================================================
// Virtual Homeschool LMS - Shared TypeScript Types
// =============================================================

export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type Curriculum = "IGCSE" | "CBC";
export type Term = "TERM_1" | "TERM_2" | "TERM_3";
export type SubmissionStatus = "PENDING" | "SUBMITTED" | "GRADED" | "RETURNED" | "LATE";
export type AnnouncementTarget = "ALL" | "ADMIN" | "TEACHER" | "STUDENT";

// =============================================================
// USER
// =============================================================
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  curriculum?: Curriculum | null;
  avatar?: string | null;
  phone?: string | null;
  isActive: boolean;
  classId?: string | null;
  class?: Class | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserWithClass extends User {
  class: Class | null;
}

// =============================================================
// CLASS
// =============================================================
export interface Class {
  id: string;
  name: string;
  curriculum: Curriculum;
  gradeLevel: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    students?: number;
    teachers?: number;
    subjects?: number;
  };
}

export interface ClassWithRelations extends Class {
  students: User[];
  teachers: ClassTeacher[];
  subjects: ClassSubject[];
}

export interface ClassTeacher {
  id: string;
  classId: string;
  teacherId: string;
  teacher: User;
  class: Class;
  createdAt: Date | string;
}

export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  subject: Subject;
  class: Class;
  createdAt: Date | string;
}

// =============================================================
// SUBJECT
// =============================================================
export interface Subject {
  id: string;
  name: string;
  curriculum: Curriculum;
  description?: string | null;
  code?: string | null;
  color?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    notes?: number;
    assignments?: number;
  };
}

// =============================================================
// NOTE
// =============================================================
export interface Note {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  fileUrl?: string | null;
  filePublicId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  term: Term;
  isPublished: boolean;
  teacherId: string;
  classId: string;
  subjectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  teacher?: User;
  class?: Class;
  subject?: Subject;
}

// =============================================================
// ASSIGNMENT
// =============================================================
export interface Assignment {
  id: string;
  title: string;
  description: string;
  fileUrl?: string | null;
  filePublicId?: string | null;
  fileName?: string | null;
  dueDate: Date | string;
  maxScore: number;
  isPublished: boolean;
  teacherId: string;
  classId: string;
  subjectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  teacher?: User;
  class?: Class;
  subject?: Subject;
  submissions?: Submission[];
  _count?: {
    submissions?: number;
  };
}

// =============================================================
// SUBMISSION
// =============================================================
export interface Submission {
  id: string;
  fileUrl?: string | null;
  filePublicId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  status: SubmissionStatus;
  submittedAt: Date | string;
  updatedAt: Date | string;
  studentId: string;
  assignmentId: string;
  student?: User;
  assignment?: Assignment;
  grade?: Grade | null;
}

// =============================================================
// GRADE
// =============================================================
export interface Grade {
  id: string;
  score: number;
  maxScore: number;
  feedback?: string | null;
  gradedFileUrl?: string | null;
  gradedFilePublicId?: string | null;
  submissionId: string;
  teacherId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  teacher?: User;
  submission?: Submission;
}

// =============================================================
// MEETING
// =============================================================
export interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  meetingUrl: string;
  scheduledAt: Date | string;
  duration?: number | null;
  isActive: boolean;
  platform?: string | null;
  teacherId: string;
  classId: string;
  subjectId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  teacher?: User;
  class?: Class;
  subject?: Subject | null;
}

// =============================================================
// ANNOUNCEMENT
// =============================================================
export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: AnnouncementTarget;
  isPinned: boolean;
  isActive: boolean;
  authorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: User;
}

// =============================================================
// API RESPONSE TYPES
// =============================================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================
// FORM TYPES
// =============================================================
export interface LoginFormData {
  email: string;
  password: string;
}

export interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  role: Role;
  curriculum?: Curriculum;
  classId?: string;
}

export interface CreateClassFormData {
  name: string;
  curriculum: Curriculum;
  gradeLevel: string;
  description?: string;
}

export interface CreateSubjectFormData {
  name: string;
  curriculum: Curriculum;
  description?: string;
  code?: string;
  color?: string;
}

export interface CreateNoteFormData {
  title: string;
  description?: string;
  content?: string;
  term: Term;
  classId: string;
  subjectId: string;
  file?: File;
}

export interface CreateAssignmentFormData {
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  classId: string;
  subjectId: string;
  file?: File;
}

export interface CreateMeetingFormData {
  title: string;
  description?: string;
  meetingUrl: string;
  scheduledAt: string;
  duration?: number;
  platform?: string;
  classId: string;
  subjectId?: string;
}

export interface GradeSubmissionFormData {
  score: number;
  feedback?: string;
  gradedFile?: File;
}

export interface CreateAnnouncementFormData {
  title: string;
  content: string;
  target: AnnouncementTarget;
  isPinned?: boolean;
}

// =============================================================
// DASHBOARD STATS
// =============================================================
export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  igcseStudents: number;
  cbcStudents: number;
  activeClasses: number;
  totalAssignments: number;
  pendingSubmissions: number;
}

export interface TeacherStats {
  totalNotes: number;
  totalAssignments: number;
  totalMeetings: number;
  pendingGrading: number;
  totalStudents: number;
}

export interface StudentStats {
  totalNotes: number;
  pendingAssignments: number;
  submittedAssignments: number;
  averageGrade: number;
  upcomingMeetings: number;
}

// =============================================================
// AI TYPES
// =============================================================
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GeneratedQuiz {
  topic: string;
  questions: QuizQuestion[];
}

export interface NoteSummary {
  summary: string;
  keyPoints: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface AIFeedbackSuggestion {
  suggestedFeedback: string;
  scoreRange: {
    min: number;
    max: number;
    suggested: number;
  };
}
