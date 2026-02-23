"use client";

import { useState, useEffect } from "react";
import { Bell, X, ChevronRight } from "lucide-react";
import type { Announcement } from "@/types";
import { formatRelative } from "@/lib/utils";

interface AnnouncementBannerProps {
  role: string;
}

export function AnnouncementBanner({ role }: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch(`/api/announcements?role=${role}&limit=5`);
        const data = await res.json();
        if (data.success) {
          setAnnouncements(data.data || []);
        }
      } catch {
        // Silently fail
      }
    };
    fetchAnnouncements();
  }, [role]);

  const visible = announcements.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const announcement = visible[current % visible.length];
  if (!announcement) return null;

  return (
    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
      <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-purple-900">{announcement.title}</p>
          {announcement.isPinned && (
            <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-medium">
              PINNED
            </span>
          )}
        </div>
        <p className="text-sm text-purple-700 line-clamp-2">{announcement.content}</p>
        <p className="text-xs text-purple-400 mt-1">
          {formatRelative(announcement.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {visible.length > 1 && (
          <button
            onClick={() => setCurrent((c) => (c + 1) % visible.length)}
            className="p-1 text-purple-400 hover:text-purple-600 rounded-lg hover:bg-purple-100"
            title="Next announcement"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setDismissed([...dismissed, announcement.id])}
          className="p-1 text-purple-400 hover:text-purple-600 rounded-lg hover:bg-purple-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
