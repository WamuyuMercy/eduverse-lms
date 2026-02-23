"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Video, ExternalLink, Calendar, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSection } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { formatDateTime, formatRelative } from "@/lib/utils";
import type { Meeting, Class, Subject } from "@/types";

export default function TeacherMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    meetingUrl: "",
    scheduledAt: "",
    duration: 60,
    platform: "Google Meet",
    classId: "",
    subjectId: "",
  });
  const { toast } = useToast();

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
    Promise.all([fetch("/api/classes"), fetch("/api/subjects")]).then(async ([cr, sr]) => {
      const [cd, sd] = await Promise.all([cr.json(), sr.json()]);
      if (cd.success) setClasses(cd.data);
      if (sd.success) setSubjects(sd.data);
    });
  }, [fetchMeetings]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, duration: Number(form.duration), subjectId: form.subjectId || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Meeting scheduled!");
        setShowModal(false);
        setForm({ title: "", description: "", meetingUrl: "", scheduledAt: "", duration: 60, platform: "Google Meet", classId: "", subjectId: "" });
        fetchMeetings();
      } else {
        toast.error(data.error || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const upcoming = meetings.filter((m) => new Date(m.scheduledAt) >= new Date());
  const past = meetings.filter((m) => new Date(m.scheduledAt) < new Date());
  const filteredSubjects = form.classId
    ? subjects.filter((s) => {
        const cls = classes.find((c) => c.id === form.classId);
        return cls ? s.curriculum === cls.curriculum : true;
      })
    : subjects;

  const MeetingCard = ({ meeting }: { meeting: Meeting }) => {
    const isPast = new Date(meeting.scheduledAt) < new Date();
    return (
      <div className={`lms-card flex items-start gap-4 ${isPast ? "opacity-60" : ""}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPast ? "bg-gray-100" : "bg-purple-50"}`}>
          <Video className={`w-5 h-5 ${isPast ? "text-gray-400" : "text-purple-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
            <Badge variant={isPast ? "secondary" : "default"}>
              {meeting.platform || "Meeting"}
            </Badge>
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
                {meeting.duration} mins
              </div>
            )}
            <span className="text-xs text-gray-400">
              {(meeting as Meeting & { class?: { name: string } }).class?.name}
            </span>
          </div>
        </div>
        {!isPast && (
          <a
            href={meeting.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Start
          </a>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Virtual Meetings</h1>
          <p className="text-gray-500 text-sm mt-1">Schedule and manage virtual class sessions</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Schedule Meeting
        </Button>
      </div>

      {loading ? (
        <LoadingSection />
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No meetings scheduled"
          description="Schedule your first virtual class session."
          action={<Button onClick={() => setShowModal(true)}>Schedule Meeting</Button>}
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((m) => <MeetingCard key={m.id} meeting={m} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Past Sessions ({past.length})
              </h2>
              <div className="space-y-3">
                {past.slice(0, 5).map((m) => <MeetingCard key={m.id} meeting={m} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <Input label="Title" placeholder="e.g. IGCSE Maths - Quadratics" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Textarea label="Description (optional)" placeholder="What will be covered in this session?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-20" />
            <Input label="Meeting Link" type="url" placeholder="https://meet.google.com/..." value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date & Time" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
              <Input label="Duration (mins)" type="number" min="15" max="240" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="form-label">Class</label>
                <select className="form-input" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} required>
                  <option value="">— Select class —</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="form-label">Subject (optional)</label>
                <select className="form-input" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                  <option value="">— Optional —</option>
                  {filteredSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Platform</label>
              <select className="form-input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                <option>Google Meet</option>
                <option>Zoom</option>
                <option>Microsoft Teams</option>
                <option>Other</option>
              </select>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate as unknown as React.MouseEventHandler} disabled={submitting || !form.title || !form.meetingUrl || !form.scheduledAt || !form.classId}>
              {submitting ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
