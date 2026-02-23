import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAnnouncementSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const role = searchParams.get("role") || session.user.role;
  const limit = parseInt(searchParams.get("limit") || "10");

  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [{ target: "ALL" }, { target: role as "ALL" | "ADMIN" | "TEACHER" | "STUDENT" }],
    },
    include: {
      author: { select: { id: true, name: true, role: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return NextResponse.json({ success: true, data: announcements });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = createAnnouncementSchema.parse(body);

    const announcement = await prisma.announcement.create({
      data: {
        ...validated,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    console.error("Create announcement error:", error);
    return NextResponse.json({ success: false, error: "Failed to create announcement" }, { status: 500 });
  }
}
