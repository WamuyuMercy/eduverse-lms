import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubjectSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const curriculum = searchParams.get("curriculum");
  const classId = searchParams.get("classId");

  let subjects;

  if (classId) {
    // Get subjects for a specific class
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId },
      include: { subject: true },
    });
    subjects = classSubjects.map((cs) => cs.subject);
  } else {
    const where: Record<string, unknown> = {};
    if (curriculum) where.curriculum = curriculum;
    subjects = await prisma.subject.findMany({
      where,
      include: {
        _count: {
          select: { notes: true, assignments: true },
        },
      },
      orderBy: [{ curriculum: "asc" }, { name: "asc" }],
    });
  }

  return NextResponse.json({ success: true, data: subjects });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = createSubjectSchema.parse(body);

    const subject = await prisma.subject.create({ data: validated });
    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error) {
    console.error("Create subject error:", error);
    return NextResponse.json({ success: false, error: "Failed to create subject" }, { status: 500 });
  }
}
