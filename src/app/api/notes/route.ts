// =============================================================
// GET /api/notes - List notes
// POST /api/notes - Create note (Teacher+)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId");
  const term = searchParams.get("term");
  const teacherId = searchParams.get("teacherId");

  const where: Record<string, unknown> = { isPublished: true };

  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;
  if (term) where.term = term;
  if (teacherId) where.teacherId = teacherId;

  // Students can only see notes for their class
  if (session.user.role === "STUDENT") {
    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { classId: true },
    });
    if (student?.classId) {
      where.classId = student.classId;
    }
  }

  // Teachers can see their own notes
  if (session.user.role === "TEACHER" && !classId) {
    where.teacherId = session.user.id;
  }

  const notes = await prisma.note.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true } },
      class: { select: { id: true, name: true, gradeLevel: true } },
      subject: { select: { id: true, name: true, color: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: notes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: "Teacher access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = createNoteSchema.parse(body);

    const note = await prisma.note.create({
      data: {
        ...validated,
        teacherId: session.user.id,
      },
      include: {
        teacher: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, color: true } },
      },
    });

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json({ success: false, error: "Failed to create note" }, { status: 500 });
  }
}
