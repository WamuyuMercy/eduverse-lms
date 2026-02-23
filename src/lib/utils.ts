import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from "date-fns";

// =============================================================
// Tailwind Class Merging
// =============================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================
// Date Utilities
// =============================================================
export function formatDate(date: Date | string, pattern = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(dueDate: Date | string): boolean {
  const d = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  return isBefore(d, new Date());
}

export function isDueSoon(dueDate: Date | string, days = 3): boolean {
  const d = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const future = new Date();
  future.setDate(future.getDate() + days);
  return isAfter(d, new Date()) && isBefore(d, future);
}

export function getDaysUntilDue(dueDate: Date | string): number {
  const d = typeof dueDate === "string" ? parseISO(dueDate) : dueDate;
  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// =============================================================
// String Utilities
// =============================================================
export function truncate(text: string, length = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// =============================================================
// File Utilities
// =============================================================
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const ext = getFileExtension(file.name);
  return allowedTypes.includes(ext);
}

export const ALLOWED_DOCUMENT_TYPES = ["pdf", "doc", "docx", "ppt", "pptx", "xlsx", "xls"];
export const ALLOWED_IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "webp"];
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// =============================================================
// Grade Utilities
// =============================================================
export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

export function getGradeLetter(percentage: number): string {
  if (percentage >= 90) return "A*";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 40) return "E";
  return "U";
}

export function getGradeColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-blue-600";
  if (percentage >= 40) return "text-yellow-600";
  return "text-red-600";
}

export function getGradeBgColor(percentage: number): string {
  if (percentage >= 80) return "bg-green-100 text-green-700";
  if (percentage >= 60) return "bg-blue-100 text-blue-700";
  if (percentage >= 40) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

// =============================================================
// Role Utilities
// =============================================================
export function getRoleDashboard(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    default:
      return "/login";
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "TEACHER":
      return "Teacher";
    case "STUDENT":
      return "Student";
    default:
      return role;
  }
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-700";
    case "TEACHER":
      return "bg-blue-100 text-blue-700";
    case "STUDENT":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

// =============================================================
// Curriculum Utilities
// =============================================================
export function getCurriculumLabel(curriculum: string): string {
  switch (curriculum) {
    case "IGCSE":
      return "IGCSE";
    case "CBC":
      return "CBC (Kenya)";
    default:
      return curriculum;
  }
}

export function getCurriculumColor(curriculum: string): string {
  switch (curriculum) {
    case "IGCSE":
      return "bg-violet-100 text-violet-700";
    case "CBC":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

// =============================================================
// Term Utilities
// =============================================================
export function getTermLabel(term: string): string {
  switch (term) {
    case "TERM_1":
      return "Term 1";
    case "TERM_2":
      return "Term 2";
    case "TERM_3":
      return "Term 3";
    default:
      return term;
  }
}

// =============================================================
// Submission Status Utilities
// =============================================================
export function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Not Submitted";
    case "SUBMITTED":
      return "Submitted";
    case "GRADED":
      return "Graded";
    case "RETURNED":
      return "Returned";
    case "LATE":
      return "Late";
    default:
      return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-600";
    case "SUBMITTED":
      return "bg-blue-100 text-blue-700";
    case "GRADED":
      return "bg-green-100 text-green-700";
    case "RETURNED":
      return "bg-purple-100 text-purple-700";
    case "LATE":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

// =============================================================
// Error Handling
// =============================================================
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

// =============================================================
// Avatar Color Generator
// =============================================================
export function getAvatarColor(name: string): string {
  const colors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}
