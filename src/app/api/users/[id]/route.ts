// =============================================================
// GET /api/users/[id] - Get user by ID
// PATCH /api/users/[id] - Update user
// DELETE /api/users/[id] - Delete user (Admin only)
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Users can only see their own data unless they're admin
  if (session.user.role !== "ADMIN" && session.user.id !== params.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      curriculum: true,
      avatar: true,
      phone: true,
      isActive: true,
      classId: true,
      createdAt: true,
      class: {
        select: {
          id: true,
          name: true,
          gradeLevel: true,
          curriculum: true,
          subjects: {
            include: { subject: true },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Admin can update anyone; users can update themselves (limited fields)
  if (session.user.role !== "ADMIN" && session.user.id !== params.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = updateUserSchema.parse(body);

    // Non-admins cannot change isActive or classId
    if (session.user.role !== "ADMIN") {
      delete validated.isActive;
      delete validated.classId;
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: validated,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        curriculum: true,
        isActive: true,
        classId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  // Prevent self-deletion
  if (session.user.id === params.id) {
    return NextResponse.json(
      { success: false, error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  // Soft delete (deactivate)
  await prisma.user.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({
    success: true,
    message: "User deactivated successfully",
  });
}
