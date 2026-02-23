import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMeetingSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const classId = searchParams.get("classId");
  const upcoming = searchParams.get("upcoming") === "true";

  const where: Record<string, unknown> = { isActive: true };
  if (classId) where.classId = classId;

  if (upcoming) {
    where.scheduledAt = { gte: new Date() };
  }

  // Students see meetings for their class
  if (session.user.role === "STUDENT") {
    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { classId: true },
    });
    if (student?.classId) where.classId = student.classId;
  }

  // Teachers see their own meetings
  if (session.user.role === "TEACHER" && !classId) {
    where.teacherId = session.user.id;
  }

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true } },
      class: { select: { id: true, name: true, gradeLevel: true } },
      subject: { select: { id: true, name: true, color: true, code: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({ success: true, data: meetings });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: "Teacher access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = createMeetingSchema.parse(body);

    const meeting = await prisma.meeting.create({
      data: {
        ...validated,
        scheduledAt: new Date(validated.scheduledAt),
        teacherId: session.user.id,
      },
      include: {
        teacher: { select: { id: true, name: true } },
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, color: true } },
      },
    });

    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (error) {
    console.error("Create meeting error:", error);
    return NextResponse.json({ success: false, error: "Failed to create meeting" }, { status: 500 });
  }
}
