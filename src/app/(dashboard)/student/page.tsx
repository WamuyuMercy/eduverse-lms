import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StudentDashboard } from "@/components/student/StudentDashboard";

async function getStudentData(studentId: string, classId: string | null) {
  const [notesCount, assignments, upcomingMeetings, recentGrades] = await Promise.all([
    classId ? prisma.note.count({ where: { classId, isPublished: true } }) : 0,
    classId
      ? prisma.assignment.findMany({
          where: { classId, isPublished: true },
          include: {
            subject: { select: { id: true, name: true, color: true } },
            submissions: {
              where: { studentId },
              include: { grade: true },
            },
          },
          orderBy: { dueDate: "asc" },
          take: 10,
        })
      : [],
    classId
      ? prisma.meeting.findMany({
          where: {
            classId,
            scheduledAt: { gte: new Date() },
            isActive: true,
          },
          include: {
            teacher: { select: { id: true, name: true } },
            subject: { select: { id: true, name: true, color: true } },
          },
          orderBy: { scheduledAt: "asc" },
          take: 5,
        })
      : [],
    prisma.grade.findMany({
      where: { submission: { studentId } },
      include: {
        submission: {
          include: {
            assignment: {
              select: {
                title: true,
                maxScore: true,
                subject: { select: { name: true, color: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const pending = assignments.filter((a) => a.submissions.length === 0);
  const submitted = assignments.filter((a) => a.submissions.length > 0 && a.submissions[0].status !== "GRADED");
  const graded = assignments.filter((a) => a.submissions[0]?.grade);

  const avgGrade =
    recentGrades.length > 0
      ? Math.round(
          recentGrades.reduce((acc, g) => acc + (g.score / g.maxScore) * 100, 0) /
            recentGrades.length
        )
      : 0;

  return {
    stats: {
      totalNotes: notesCount,
      pendingAssignments: pending.length,
      submittedAssignments: submitted.length,
      averageGrade: avgGrade,
      upcomingMeetings: upcomingMeetings.length,
    },
    assignments,
    upcomingMeetings,
    recentGrades,
  };
}

export const metadata = { title: "Student Dashboard" };

export default async function StudentPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { classId: true, class: { select: { id: true, name: true, gradeLevel: true, curriculum: true } } },
  });

  const data = await getStudentData(session!.user.id, user?.classId || null);

  return (
    <StudentDashboard
      studentName={session!.user.name}
      curriculum={session!.user.curriculum || undefined}
      className={user?.class?.name}
      stats={data.stats}
      assignments={data.assignments}
      upcomingMeetings={data.upcomingMeetings}
      recentGrades={data.recentGrades}
    />
  );
}
