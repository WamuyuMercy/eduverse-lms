// =============================================================
// Zod Validation Schemas
// =============================================================

import { z } from "zod";

// =============================================================
// AUTH
// =============================================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// =============================================================
// USER
// =============================================================
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    ),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  curriculum: z.enum(["IGCSE", "CBC"]).optional(),
  classId: z.string().optional(),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  curriculum: z.enum(["IGCSE", "CBC"]).optional().nullable(),
  classId: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  avatar: z.string().url().optional().nullable(),
});

// =============================================================
// CLASS
// =============================================================
export const createClassSchema = z.object({
  name: z
    .string()
    .min(2, "Class name must be at least 2 characters")
    .max(100, "Class name is too long"),
  curriculum: z.enum(["IGCSE", "CBC"], {
    errorMap: () => ({ message: "Please select a curriculum" }),
  }),
  gradeLevel: z.string().min(1, "Grade level is required"),
  description: z.string().max(500).optional(),
});

export const updateClassSchema = createClassSchema.partial();

// =============================================================
// SUBJECT
// =============================================================
export const createSubjectSchema = z.object({
  name: z
    .string()
    .min(2, "Subject name must be at least 2 characters")
    .max(100, "Subject name is too long"),
  curriculum: z.enum(["IGCSE", "CBC"]),
  description: z.string().max(500).optional(),
  code: z.string().max(20).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color hex").optional(),
});

// =============================================================
// NOTE
// =============================================================
export const createNoteSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title is too long"),
  description: z.string().max(500).optional(),
  content: z.string().optional(),
  term: z.enum(["TERM_1", "TERM_2", "TERM_3"]),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  isPublished: z.boolean().default(true),
});

export const updateNoteSchema = createNoteSchema.partial();

// =============================================================
// ASSIGNMENT
// =============================================================
export const createAssignmentSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description is too long"),
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((date) => {
      const d = new Date(date);
      return d > new Date();
    }, "Due date must be in the future"),
  maxScore: z
    .number()
    .min(1, "Max score must be at least 1")
    .max(1000, "Max score cannot exceed 1000")
    .default(100),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  isPublished: z.boolean().default(true),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

// =============================================================
// MEETING
// =============================================================
export const createMeetingSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title is too long"),
  description: z.string().max(500).optional(),
  meetingUrl: z
    .string()
    .min(1, "Meeting URL is required")
    .url("Please enter a valid URL"),
  scheduledAt: z.string().min(1, "Date and time is required"),
  duration: z.number().min(5).max(480).optional(),
  platform: z.string().max(50).optional(),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().optional(),
});

export const updateMeetingSchema = createMeetingSchema.partial();

// =============================================================
// GRADE
// =============================================================
export const gradeSubmissionSchema = z.object({
  score: z
    .number()
    .min(0, "Score cannot be negative"),
  feedback: z.string().max(5000).optional(),
});

// =============================================================
// ANNOUNCEMENT
// =============================================================
export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title is too long"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(10000, "Content is too long"),
  target: z.enum(["ALL", "ADMIN", "TEACHER", "STUDENT"]).default("ALL"),
  isPinned: z.boolean().default(false),
});

// =============================================================
// AI
// =============================================================
export const aiQuizSchema = z.object({
  content: z.string().min(50, "Please provide more content for quiz generation"),
  topic: z.string().optional(),
  numQuestions: z.number().min(3).max(20).default(5),
});

export const aiSummarizeSchema = z.object({
  content: z.string().min(50, "Please provide content to summarize"),
  noteId: z.string().optional(),
});

export const aiFeedbackSchema = z.object({
  submissionId: z.string().min(1, "Submission ID is required"),
  assignmentDescription: z.string(),
  studentWork: z.string().optional(),
});

// Types inferred from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
