import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAssignmentSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId");
  const teacherId = searchParams.get("teacherId");

  const where: Record<string, unknown> = { isPublished: true };
  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;

  // Students see assignments for their class
  if (session.user.role === "STUDENT") {
    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { classId: true },
    });
    if (student?.classId) where.classId = student.classId;

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        teacher: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, color: true, code: true } },
        submissions: {
          where: { studentId: session.user.id },
          include: { grade: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ success: true, data: assignments });
  }

  // Teachers see their own assignments
  if (session.user.role === "TEACHER") {
    where.teacherId = teacherId || session.user.id;
  }

  const assignments = await prisma.assignment.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, color: true, code: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ success: true, data: assignments });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: "Teacher access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = createAssignmentSchema.parse(body);

    const assignment = await prisma.assignment.create({
      data: {
        ...validated,
        dueDate: new Date(validated.dueDate),
        teacherId: session.user.id,
      },
      include: {
        teacher: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, color: true } },
      },
    });

    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
