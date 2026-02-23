// =============================================================
// POST /api/upload - Upload file to Cloudinary
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToCloudinary, validateFileUpload, NOTE_ALLOWED_TYPES, ASSIGNMENT_ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/cloudinary";
import { uploadRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const limit = uploadRateLimit(session.user.id);
  if (!limit.success) {
    return NextResponse.json({ success: false, error: "Upload rate limit exceeded" }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "uploads";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Determine allowed types based on folder
    const allowedTypes = folder === "notes" ? NOTE_ALLOWED_TYPES : ASSIGNMENT_ALLOWED_TYPES;

    const validation = validateFileUpload(file as File, allowedTypes, MAX_FILE_SIZE);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const bytes = await (file as File).arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToCloudinary(buffer, (file as File).name, folder);

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        bytes: result.bytes,
        format: result.format,
        originalFilename: result.originalFilename,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "File upload failed" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;
