"use client";

import { Menu, Bell, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUIStore } from "@/store/useUIStore";
import { getInitials, getAvatarColor, getCurriculumLabel } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { data: session } = useSession();
  const { toggleSidebar } = useUIStore();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 h-16 px-6 bg-white/80 backdrop-blur-md border-b border-gray-100">
      {/* Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page Title (desktop) */}
      {title && (
        <div className="hidden md:block">
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Curriculum Badge */}
        {user?.curriculum && (
          <Badge
            variant={user.curriculum === "IGCSE" ? "purple" : "green"}
            className="hidden sm:inline-flex text-xs"
          >
            {getCurriculumLabel(user.curriculum)}
          </Badge>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Avatar */}
        <Avatar className="h-9 w-9 cursor-pointer">
          {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
          <AvatarFallback
            className={cn("text-xs font-semibold", getAvatarColor(user?.name || "U"))}
          >
            {getInitials(user?.name || "U")}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
