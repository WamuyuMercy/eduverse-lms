"use client";

import Link from "next/link";
import {
  FileText,
  ClipboardList,
  Video,
  Award,
  Users,
  ExternalLink,
  Clock,
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { AnnouncementBanner } from "@/components/shared/AnnouncementBanner";
import { Badge } from "@/components/ui/badge";
import type { TeacherStats, Meeting, Submission, Class } from "@/types";
import { formatDateTime, formatRelative, getInitials } from "@/lib/utils";

interface TeacherDashboardProps {
  teacherName: string;
  stats: TeacherStats;
  classes: Class[];
  upcomingMeetings: (Meeting & {
    class: { id: string; name: string };
    subject: { id: string; name: string; color: string } | null;
  })[];
  recentSubmissions: (Submission & {
    student: { id: string; name: string; avatar: string | null };
    assignment: {
      id: string;
      title: string;
      maxScore: number;
      subject: { name: string; color: string };
    };
  })[];
}

export function TeacherDashboard({
  teacherName,
  stats,
  classes,
  upcomingMeetings,
  recentSubmissions,
}: TeacherDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, {teacherName.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your teaching overview.</p>
      </div>

      <AnnouncementBanner role="TEACHER" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Notes"
          value={stats.totalNotes}
          icon={FileText}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatsCard
          title="Assignments"
          value={stats.totalAssignments}
          icon={ClipboardList}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatsCard
          title="Meetings"
          value={stats.totalMeetings}
          icon={Video}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatsCard
          title="To Grade"
          value={stats.pendingGrading}
          icon={Award}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
        <StatsCard
          title="Students"
          value={stats.totalStudents}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Upload Notes", href: "/teacher/notes", icon: FileText, color: "purple" },
          { label: "New Assignment", href: "/teacher/assignments", icon: ClipboardList, color: "blue" },
          { label: "Schedule Meeting", href: "/teacher/meetings", icon: Video, color: "green" },
          { label: "Grade Work", href: "/teacher/submissions", icon: Award, color: "orange" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`lms-card-hover flex flex-col items-center gap-2 p-4 text-center group`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${action.color}-50 group-hover:bg-${action.color}-100 transition-colors`}>
              <action.icon className={`w-5 h-5 text-${action.color}-600`} />
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <div className="lms-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Upcoming Classes</h3>
            <Link href="/teacher/meetings" className="text-sm text-purple-600 hover:underline">
              View all
            </Link>
          </div>
          {upcomingMeetings.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No upcoming meetings</p>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{meeting.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatDateTime(meeting.scheduledAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{meeting.class.name}</p>
                  </div>
                  <a
                    href={meeting.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"
                    title="Join meeting"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Submissions */}
        <div className="lms-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Pending Grading
              {stats.pendingGrading > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                  {stats.pendingGrading}
                </span>
              )}
            </h3>
            <Link href="/teacher/submissions" className="text-sm text-purple-600 hover:underline">
              Grade all
            </Link>
          </div>
          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No submissions to grade</p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-xs font-semibold text-orange-700 shrink-0">
                    {getInitials(sub.student.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {sub.student.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{sub.assignment.title}</p>
                    <p className="text-xs text-gray-400">{formatRelative(sub.submittedAt)}</p>
                  </div>
                  <div
                    className="px-2 py-1 text-xs rounded-lg font-medium"
                    style={{
                      backgroundColor: `${sub.assignment.subject.color}20`,
                      color: sub.assignment.subject.color,
                    }}
                  >
                    {sub.assignment.subject.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Classes */}
      {classes.length > 0 && (
        <div className="lms-card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">My Classes</h3>
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl"
              >
                <span className="text-sm font-medium text-purple-700">{cls.name}</span>
                <Badge variant="purple">{cls.gradeLevel}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
