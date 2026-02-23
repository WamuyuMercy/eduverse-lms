"use client";

import Link from "next/link";
import {
  FileText,
  ClipboardList,
  Video,
  Award,
  BookOpen,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { AnnouncementBanner } from "@/components/shared/AnnouncementBanner";
import { Badge } from "@/components/ui/badge";
import type { StudentStats, Meeting, Grade } from "@/types";
import {
  formatDate,
  formatDateTime,
  calculatePercentage,
  getGradeBgColor,
  getCurriculumLabel,
  isOverdue,
  isDueSoon,
} from "@/lib/utils";

interface StudentDashboardProps {
  studentName: string;
  curriculum?: string;
  className?: string;
  stats: StudentStats;
  assignments: Array<{
    id: string;
    title: string;
    dueDate: Date | string;
    maxScore: number;
    subject: { id: string; name: string; color: string } | null;
    submissions: Array<{
      id: string;
      status: string;
      grade: { score: number; maxScore: number } | null;
    }>;
  }>;
  upcomingMeetings: (Meeting & {
    teacher: { id: string; name: string };
    subject: { id: string; name: string; color: string } | null;
  })[];
  recentGrades: (Grade & {
    submission: {
      assignment: {
        title: string;
        maxScore: number;
        subject: { name: string; color: string };
      };
    };
  })[];
}

export function StudentDashboard({
  studentName,
  curriculum,
  className: classNameProp,
  stats,
  assignments,
  upcomingMeetings,
  recentGrades,
}: StudentDashboardProps) {
  const pendingAssignments = assignments.filter((a) => a.submissions.length === 0 && !isOverdue(a.dueDate));
  const overdueAssignments = assignments.filter((a) => a.submissions.length === 0 && isOverdue(a.dueDate));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Hi, {studentName.split(" ")[0]} 🎓
          </h1>
          {curriculum && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                curriculum === "IGCSE"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {getCurriculumLabel(curriculum)}
            </span>
          )}
        </div>
        {classNameProp && (
          <p className="text-gray-500 text-sm">{classNameProp}</p>
        )}
      </div>

      <AnnouncementBanner role="STUDENT" />

      {/* Overdue Alert */}
      {overdueAssignments.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {overdueAssignments.length} overdue assignment{overdueAssignments.length > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-red-600 mt-0.5">
              Please submit as soon as possible and contact your teacher.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Notes" value={stats.totalNotes} icon={FileText} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Pending" value={stats.pendingAssignments} icon={ClipboardList} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatsCard title="Submitted" value={stats.submittedAssignments} icon={CheckCircle2} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Avg Grade" value={`${stats.averageGrade}%`} icon={Award} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Classes" value={stats.upcomingMeetings} icon={Video} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "My Notes", href: "/student/notes", icon: FileText, color: "#7C3AED" },
          { label: "Assignments", href: "/student/assignments", icon: ClipboardList, color: "#3B82F6" },
          { label: "My Grades", href: "/student/grades", icon: Award, color: "#22C55E" },
          { label: "Classes", href: "/student/meetings", icon: Video, color: "#8B5CF6" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="lms-card-hover flex flex-col items-center gap-2 p-4 text-center"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="lms-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Pending Assignments</h3>
            <Link href="/student/assignments" className="text-sm text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          {pendingAssignments.length === 0 ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">All caught up! No pending assignments.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAssignments.slice(0, 5).map((a) => {
                const dueSoon = isDueSoon(a.dueDate);
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${a.subject?.color}20` }}
                    >
                      <ClipboardList className="w-4 h-4" style={{ color: a.subject?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className={`text-xs ${dueSoon ? "text-orange-600 font-medium" : "text-gray-500"}`}>
                          Due {formatDate(a.dueDate)}
                        </span>
                      </div>
                    </div>
                    {dueSoon && (
                      <span className="shrink-0 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                        Due soon
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="lms-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Upcoming Classes</h3>
            <Link href="/student/meetings" className="text-sm text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          {upcomingMeetings.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No upcoming classes</p>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(m.scheduledAt)}</p>
                    <p className="text-xs text-gray-400">by {m.teacher.name}</p>
                  </div>
                  <a
                    href={m.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700"
                  >
                    Join
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Grades */}
      {recentGrades.length > 0 && (
        <div className="lms-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Recent Grades</h3>
            <Link href="/student/grades" className="text-sm text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentGrades.map((grade) => {
              const pct = calculatePercentage(grade.score, grade.maxScore);
              return (
                <div key={grade.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`text-lg font-bold px-3 py-2 rounded-xl ${getGradeBgColor(pct)}`}>
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {grade.submission.assignment.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {grade.score}/{grade.maxScore} marks
                    </p>
                    <p className="text-xs" style={{ color: grade.submission.assignment.subject.color }}>
                      {grade.submission.assignment.subject.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
