"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Video,
  GraduationCap,
  Settings,
  LogOut,
  FileText,
  Award,
  Bell,
  ChevronRight,
  X,
} from "lucide-react";
import { cn, getInitials, getAvatarColor, getRoleLabel } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUIStore } from "@/store/useUIStore";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/classes", label: "Classes", icon: GraduationCap },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
];

const teacherNav: NavItem[] = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/notes", label: "Notes", icon: FileText },
  { href: "/teacher/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/teacher/submissions", label: "Submissions", icon: Award },
  { href: "/teacher/meetings", label: "Meetings", icon: Video },
];

const studentNav: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/notes", label: "My Notes", icon: FileText },
  { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/student/grades", label: "My Grades", icon: Award },
  { href: "/student/meetings", label: "Classes", icon: Video },
];

const navMap: Record<string, NavItem[]> = {
  ADMIN: adminNav,
  TEACHER: teacherNav,
  STUDENT: studentNav,
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const role = session?.user?.role || "STUDENT";
  const navItems = navMap[role] || studentNav;
  const user = session?.user;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-30 flex flex-col bg-white border-r border-gray-100 transition-all duration-300",
          "w-[260px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-[72px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-purple-gradient rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm leading-tight">EduVerse</p>
              <p className="text-xs text-gray-400">Learning Management</p>
            </div>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sidebarOpen && (
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">
              {getRoleLabel(role)} Menu
            </p>
          )}

          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === `/${role.toLowerCase()}`
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                    className={cn(
                      "sidebar-link",
                      isActive && "active",
                      !sidebarOpen && "justify-center px-2"
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <item.icon className="icon" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile + Logout */}
        <div className="border-t border-gray-100 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 group">
              <Avatar className="h-9 w-9">
                {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback
                  className={cn("text-xs", getAvatarColor(user?.name || "U"))}
                >
                  {getInitials(user?.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{getRoleLabel(role)}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
