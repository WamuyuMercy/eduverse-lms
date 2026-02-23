// =============================================================
// GET /api/submissions - List submissions
// POST /api/submissions - Create submission (Student)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const assignmentId = searchParams.get("assignmentId");
  const studentId = searchParams.get("studentId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (assignmentId) where.assignmentId = assignmentId;
  if (status) where.status = status;

  // Students can only see their own submissions
  if (session.user.role === "STUDENT") {
    where.studentId = session.user.id;
  } else if (studentId) {
    where.studentId = studentId;
  }

  // Teachers can only see submissions for their assignments
  if (session.user.role === "TEACHER" && !assignmentId) {
    const teacherAssignments = await prisma.assignment.findMany({
      where: { teacherId: session.user.id },
      select: { id: true },
    });
    where.assignmentId = { in: teacherAssignments.map((a) => a.id) };
  }

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      student: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      assignment: {
        select: {
          id: true,
          title: true,
          dueDate: true,
          maxScore: true,
          subject: { select: { id: true, name: true, color: true } },
          class: { select: { id: true, name: true } },
        },
      },
      grade: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: submissions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ success: false, error: "Student access required" }, { status: 403 });
  }

  const limit = uploadRateLimit(session.user.id);
  if (!limit.success) {
    return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { assignmentId, fileUrl, filePublicId, fileName, fileSize } = body;

    if (!assignmentId) {
      return NextResponse.json({ success: false, error: "Assignment ID required" }, { status: 400 });
    }

    // Check assignment exists and is not past deadline
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    // Check for existing submission
    const existing = await prisma.submission.findUnique({
      where: { studentId_assignmentId: { studentId: session.user.id, assignmentId } },
    });

    if (existing) {
      // Update existing submission
      const updated = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          fileUrl,
          filePublicId,
          fileName,
          fileSize,
          status: isLate ? "LATE" : "SUBMITTED",
          submittedAt: new Date(),
        },
        include: { grade: true },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const submission = await prisma.submission.create({
      data: {
        studentId: session.user.id,
        assignmentId,
        fileUrl,
        filePublicId,
        fileName,
        fileSize,
        status: isLate ? "LATE" : "SUBMITTED",
      },
    });

    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}
