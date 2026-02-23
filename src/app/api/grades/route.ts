// =============================================================
// GET /api/grades - List grades
// POST /api/grades - Grade a submission (Teacher)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gradeSubmissionSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const studentId = searchParams.get("studentId");
  const submissionId = searchParams.get("submissionId");

  const where: Record<string, unknown> = {};
  if (submissionId) where.submissionId = submissionId;

  // Students can only see their own grades
  if (session.user.role === "STUDENT") {
    where.submission = { studentId: session.user.id };
  } else if (studentId) {
    where.submission = { studentId };
  }

  const grades = await prisma.grade.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true } },
      submission: {
        include: {
          student: { select: { id: true, name: true, email: true, avatar: true } },
          assignment: {
            select: {
              id: true,
              title: true,
              maxScore: true,
              subject: { select: { id: true, name: true, color: true } },
              class: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: grades });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: "Teacher access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { submissionId, gradedFileUrl, gradedFilePublicId, ...gradeData } = body;
    const validated = gradeSubmissionSchema.parse(gradeData);

    if (!submissionId) {
      return NextResponse.json({ success: false, error: "Submission ID required" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    // Validate score doesn't exceed maxScore
    if (validated.score > submission.assignment.maxScore) {
      return NextResponse.json(
        { success: false, error: `Score cannot exceed ${submission.assignment.maxScore}` },
        { status: 400 }
      );
    }

    // Upsert grade
    const grade = await prisma.grade.upsert({
      where: { submissionId },
      create: {
        submissionId,
        teacherId: session.user.id,
        score: validated.score,
        maxScore: submission.assignment.maxScore,
        feedback: validated.feedback,
        gradedFileUrl,
        gradedFilePublicId,
      },
      update: {
        score: validated.score,
        feedback: validated.feedback,
        gradedFileUrl,
        gradedFilePublicId,
        updatedAt: new Date(),
      },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    });

    // Update submission status
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "GRADED" },
    });

    return NextResponse.json({ success: true, data: grade });
  } catch (error) {
    console.error("Grade error:", error);
    return NextResponse.json({ success: false, error: "Failed to grade submission" }, { status: 500 });
  }
}
