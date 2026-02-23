// =============================================================
// GET /api/classes - List classes
// POST /api/classes - Create class (Admin only)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClassSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const curriculum = searchParams.get("curriculum");
  const withCounts = searchParams.get("withCounts") === "true";

  const where: Record<string, unknown> = { isActive: true };
  if (curriculum) where.curriculum = curriculum;

  const classes = await prisma.class.findMany({
    where,
    include: {
      _count: withCounts
        ? {
            select: {
              students: true,
              teachers: true,
              subjects: true,
            },
          }
        : undefined,
      teachers: {
        include: {
          teacher: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      subjects: {
        include: {
          subject: {
            select: { id: true, name: true, code: true, color: true },
          },
        },
      },
    },
    orderBy: [{ curriculum: "asc" }, { gradeLevel: "asc" }],
  });

  return NextResponse.json({ success: true, data: classes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = createClassSchema.parse(body);

    const cls = await prisma.class.create({
      data: validated,
    });

    return NextResponse.json({ success: true, data: cls }, { status: 201 });
  } catch (error) {
    console.error("Create class error:", error);
    return NextResponse.json({ success: false, error: "Failed to create class" }, { status: 500 });
  }
}
