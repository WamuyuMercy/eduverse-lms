// =============================================================
// Cloudinary File Upload Utility
// =============================================================

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
  originalFilename: string;
}

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  folder: string = "lms"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `eduverse/${folder}`,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
          originalFilename: filename,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Get a signed URL for a private resource
 */
export function getSignedUrl(publicId: string, expiresIn = 3600): string {
  return cloudinary.url(publicId, {
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  });
}

/**
 * Parse multipart form data from a Next.js request
 */
export async function parseFormFile(
  request: Request
): Promise<{ buffer: Buffer; filename: string; mimetype: string } | null> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return null;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return {
      buffer,
      filename: file.name,
      mimetype: file.type,
    };
  } catch {
    return null;
  }
}

// Allowed file types for different contexts
export const ASSIGNMENT_ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const NOTE_ALLOWED_TYPES = [
  ...ASSIGNMENT_ALLOWED_TYPES,
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(
  file: File,
  allowedTypes: string[],
  maxSize = MAX_FILE_SIZE
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Accepted: PDF, DOC, DOCX, PPT, PPTX`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

export { cloudinary };
