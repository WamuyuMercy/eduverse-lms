import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "@/lib/validations";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findUnique({
    where: { id: params.id },
    include: {
      teacher: { select: { id: true, name: true } },
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, color: true } },
    },
  });

  if (!note) return NextResponse.json({ success: false, error: "Note not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: note });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: "Teacher access required" }, { status: 403 });
  }

  const note = await prisma.note.findUnique({ where: { id: params.id } });
  if (!note) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  // Teachers can only edit their own notes
  if (session.user.role === "TEACHER" && note.teacherId !== session.user.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = createNoteSchema.partial().parse(body);
    const updated = await prisma.note.update({ where: { id: params.id }, data: validated });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const note = await prisma.note.findUnique({ where: { id: params.id } });
  if (!note) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  if (session.user.role === "TEACHER" && note.teacherId !== session.user.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  // Clean up file from Cloudinary
  if (note.filePublicId) {
    await deleteFromCloudinary(note.filePublicId).catch(console.error);
  }

  await prisma.note.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, message: "Note deleted" });
}
