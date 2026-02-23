// =============================================================
// GET /api/admin/stats - Admin dashboard statistics
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
  }

  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSubjects,
    igcseStudents,
    cbcStudents,
    activeClasses,
    totalAssignments,
    pendingSubmissions,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.user.count({ where: { role: "TEACHER", isActive: true } }),
    prisma.class.count({ where: { isActive: true } }),
    prisma.subject.count(),
    prisma.user.count({ where: { role: "STUDENT", curriculum: "IGCSE", isActive: true } }),
    prisma.user.count({ where: { role: "STUDENT", curriculum: "CBC", isActive: true } }),
    prisma.class.count({ where: { isActive: true } }),
    prisma.assignment.count({ where: { isPublished: true } }),
    prisma.submission.count({ where: { status: "SUBMITTED" } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      igcseStudents,
      cbcStudents,
      activeClasses,
      totalAssignments,
      pendingSubmissions,
    },
  });
}
