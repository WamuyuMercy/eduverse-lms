"use client";

import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { AnnouncementBanner } from "@/components/shared/AnnouncementBanner";
import type { AdminStats, User, Announcement } from "@/types";
import { formatDate, getRoleBadgeColor, getCurriculumColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AdminDashboardProps {
  adminName: string;
  stats: AdminStats;
  recentUsers: Pick<User, "id" | "name" | "email" | "role" | "curriculum" | "createdAt">[];
  recentAnnouncements: (Announcement & { author: { name: string } })[];
}

export function AdminDashboard({
  adminName,
  stats,
  recentUsers,
}: AdminDashboardProps) {
  const curriculumData = [
    { name: "IGCSE", value: stats.igcseStudents, color: "#7C3AED" },
    { name: "CBC", value: stats.cbcStudents, color: "#22C55E" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {adminName.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening at EduVerse today.
        </p>
      </div>

      <AnnouncementBanner role="ADMIN" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          description={`${stats.igcseStudents} IGCSE • ${stats.cbcStudents} CBC`}
        />
        <StatsCard
          title="Total Teachers"
          value={stats.totalTeachers}
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatsCard
          title="Active Classes"
          value={stats.activeClasses}
          icon={BookOpen}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          description={`${stats.totalSubjects} subjects`}
        />
        <StatsCard
          title="Pending Grading"
          value={stats.pendingSubmissions}
          icon={ClipboardList}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          description="submissions awaiting review"
        />
      </div>

      {/* Charts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curriculum Split Chart */}
        <div className="lms-card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Curriculum Distribution
          </h3>
          {stats.totalStudents > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={curriculumData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {curriculumData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No students enrolled yet
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="lms-card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Platform Overview
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Total Assignments",
                value: stats.totalAssignments,
                color: "bg-purple-500",
                icon: ClipboardList,
              },
              {
                label: "Pending Submissions",
                value: stats.pendingSubmissions,
                color: "bg-orange-500",
                icon: AlertCircle,
              },
              {
                label: "Total Classes",
                value: stats.totalClasses,
                color: "bg-blue-500",
                icon: BookOpen,
              },
              {
                label: "Subjects",
                value: stats.totalSubjects,
                color: "bg-green-500",
                icon: TrendingUp,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="lms-card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Recently Joined
          </h3>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-gray-400">No users yet</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-semibold text-purple-700">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge className={`text-[10px] ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </Badge>
                    {user.curriculum && (
                      <Badge className={`text-[10px] ${getCurriculumColor(user.curriculum)}`}>
                        {user.curriculum}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
