import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { LoadingSection } from "@/components/ui/spinner";

async function getAdminStats() {
  const [
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSubjects,
    igcseStudents,
    cbcStudents,
    pendingSubmissions,
    recentUsers,
    recentAnnouncements,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.user.count({ where: { role: "TEACHER", isActive: true } }),
    prisma.class.count({ where: { isActive: true } }),
    prisma.subject.count(),
    prisma.user.count({ where: { role: "STUDENT", curriculum: "IGCSE", isActive: true } }),
    prisma.user.count({ where: { role: "STUDENT", curriculum: "CBC", isActive: true } }),
    prisma.submission.count({ where: { status: "SUBMITTED" } }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, role: true, curriculum: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.announcement.findMany({
      where: { isActive: true },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return {
    stats: {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      igcseStudents,
      cbcStudents,
      activeClasses: totalClasses,
      totalAssignments: await prisma.assignment.count({ where: { isPublished: true } }),
      pendingSubmissions,
    },
    recentUsers,
    recentAnnouncements,
  };
}

export const metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const data = await getAdminStats();

  return (
    <Suspense fallback={<LoadingSection />}>
      <AdminDashboard
        adminName={session?.user.name || "Admin"}
        stats={data.stats}
        recentUsers={data.recentUsers}
        recentAnnouncements={data.recentAnnouncements}
      />
    </Suspense>
  );
}
