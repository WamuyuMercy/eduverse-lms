import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClassSchema } from "@/lib/validations";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const cls = await prisma.class.findUnique({
    where: { id: params.id },
    include: {
      students: {
        where: { isActive: true },
        select: { id: true, name: true, email: true, curriculum: true, avatar: true },
      },
      teachers: {
        include: {
          teacher: { select: { id: true, name: true, email: true, curriculum: true } },
        },
      },
      subjects: {
        include: {
          subject: true,
        },
      },
      _count: {
        select: { students: true, teachers: true, assignments: true, notes: true },
      },
    },
  });

  if (!cls) return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: cls });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = createClassSchema.partial().parse(body);

    const cls = await prisma.class.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({ success: true, data: cls });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update class" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  await prisma.class.update({ where: { id: params.id }, data: { isActive: false } });
  return NextResponse.json({ success: true, message: "Class deactivated" });
}
