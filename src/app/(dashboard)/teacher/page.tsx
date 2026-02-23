import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeacherDashboard } from "@/components/teacher/TeacherDashboard";

async function getTeacherData(teacherId: string) {
  const [notesCount, assignmentsCount, meetingsCount, pendingGrading, classes] =
    await Promise.all([
      prisma.note.count({ where: { teacherId } }),
      prisma.assignment.count({ where: { teacherId, isPublished: true } }),
      prisma.meeting.count({ where: { teacherId, isActive: true } }),
      prisma.submission.count({
        where: {
          assignment: { teacherId },
          status: "SUBMITTED",
        },
      }),
      prisma.classTeacher.findMany({
        where: { teacherId },
        include: {
          class: {
            include: {
              _count: { select: { students: true } },
            },
          },
        },
      }),
    ]);

  const upcomingMeetings = await prisma.meeting.findMany({
    where: {
      teacherId,
      scheduledAt: { gte: new Date() },
      isActive: true,
    },
    include: {
      class: { select: { id: true, name: true } },
      subject: { select: { id: true, name: true, color: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  const recentSubmissions = await prisma.submission.findMany({
    where: { assignment: { teacherId }, status: "SUBMITTED" },
    include: {
      student: { select: { id: true, name: true, avatar: true } },
      assignment: {
        select: {
          id: true,
          title: true,
          maxScore: true,
          subject: { select: { name: true, color: true } },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  return {
    stats: {
      totalNotes: notesCount,
      totalAssignments: assignmentsCount,
      totalMeetings: meetingsCount,
      pendingGrading,
      totalStudents: classes.reduce((acc, ct) => acc + (ct.class._count?.students || 0), 0),
    },
    classes: classes.map((ct) => ct.class),
    upcomingMeetings,
    recentSubmissions,
  };
}

export const metadata = { title: "Teacher Dashboard" };

export default async function TeacherPage() {
  const session = await getServerSession(authOptions);
  const data = await getTeacherData(session!.user.id);

  return (
    <TeacherDashboard
      teacherName={session!.user.name}
      stats={data.stats}
      classes={data.classes}
      upcomingMeetings={data.upcomingMeetings}
      recentSubmissions={data.recentSubmissions}
    />
  );
}
