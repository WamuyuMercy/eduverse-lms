"use client";

import { useState, useEffect, useCallback } from "react";
import { Video, ExternalLink, Calendar, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSection } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/utils";
import type { Meeting } from "@/types";

type MeetingWithRelations = Meeting & {
  teacher: { id: string; name: string };
  subject: { id: string; name: string; color: string } | null;
  class: { id: string; name: string };
};

export default function StudentMeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      if (data.success) setMeetings(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const upcoming = meetings.filter((m) => new Date(m.scheduledAt) >= new Date());
  const past = meetings.filter((m) => new Date(m.scheduledAt) < new Date());

  const MeetingCard = ({ meeting, isPast }: { meeting: MeetingWithRelations; isPast: boolean }) => (
    <div className={`lms-card flex flex-col md:flex-row md:items-center gap-4 ${isPast ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isPast ? "bg-gray-100" : "bg-purple-50"}`}>
          <Video className={`w-6 h-6 ${isPast ? "text-gray-400" : "text-purple-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
            {meeting.platform && (
              <Badge variant="secondary" className="text-xs">
                {meeting.platform}
              </Badge>
            )}
            {!isPast && (
              <Badge variant="success" className="text-xs">
                Upcoming
              </Badge>
            )}
          </div>
          {meeting.description && (
            <p className="text-sm text-gray-500 mt-1">{meeting.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              {formatDateTime(meeting.scheduledAt)}
            </div>
            {meeting.duration && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                {meeting.duration} minutes
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="w-3.5 h-3.5" />
              {meeting.teacher.name}
            </div>
            {meeting.subject && (
              <span
                className="text-xs px-2 py-1 rounded-lg font-medium"
                style={{
                  backgroundColor: `${meeting.subject.color}20`,
                  color: meeting.subject.color,
                }}
              >
                {meeting.subject.name}
              </span>
            )}
          </div>
        </div>
      </div>
      {!isPast ? (
        <a
          href={meeting.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Join Class
        </a>
      ) : (
        <span className="shrink-0 text-xs text-gray-400 px-3 py-1.5 bg-gray-100 rounded-lg">
          Completed
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Virtual Classes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Join your scheduled live sessions below
        </p>
      </div>

      {loading ? (
        <LoadingSection />
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No classes scheduled"
          description="Your teacher hasn't scheduled any virtual classes yet. Check back soon!"
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Upcoming Classes ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((m) => (
                  <MeetingCard key={m.id} meeting={m} isPast={false} />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Past Sessions ({past.length})
              </h2>
              <div className="space-y-3">
                {past.slice(0, 10).map((m) => (
                  <MeetingCard key={m.id} meeting={m} isPast={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
