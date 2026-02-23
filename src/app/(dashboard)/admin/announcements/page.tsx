"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Bell, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSection } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { formatRelative, truncate } from "@/lib/utils";
import type { Announcement } from "@/types";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    target: "ALL",
    isPinned: false,
  });
  const { toast } = useToast();

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements?limit=50");
      const data = await res.json();
      if (data.success) setAnnouncements(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Announcement published!");
        setShowModal(false);
        setForm({ title: "", content: "", target: "ALL", isPinned: false });
        fetchAnnouncements();
      } else {
        toast.error(data.error || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const targetColors: Record<string, string> = {
    ALL: "bg-purple-100 text-purple-700",
    STUDENT: "bg-green-100 text-green-700",
    TEACHER: "bg-blue-100 text-blue-700",
    ADMIN: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 text-sm mt-1">Post messages to students, teachers, or everyone</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> New Announcement
        </Button>
      </div>

      {loading ? (
        <LoadingSection />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No announcements yet"
          description="Create your first announcement to notify users."
          action={<Button onClick={() => setShowModal(true)}>Post Announcement</Button>}
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className={`lms-card ${ann.isPinned ? "border-l-4 border-l-purple-500" : ""}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ann.isPinned ? "bg-purple-100" : "bg-gray-100"}`}>
                  {ann.isPinned ? <Pin className="w-4 h-4 text-purple-600" /> : <Bell className="w-4 h-4 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                    {ann.isPinned && <Badge variant="purple">Pinned</Badge>}
                    <Badge className={targetColors[ann.target]}>{ann.target}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{truncate(ann.content, 150)}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {(ann as Announcement & { author?: { name: string } }).author?.name} • {formatRelative(ann.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Title"
              placeholder="Announcement title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Textarea
              label="Message"
              placeholder="Write your announcement here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="h-32"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="form-label">Audience</label>
                <select className="form-input" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
                  <option value="ALL">Everyone</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="TEACHER">Teachers Only</option>
                  <option value="ADMIN">Admins Only</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="form-label">Pin?</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600"
                  />
                  <span className="text-sm text-gray-700">Pin announcement</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Publishing..." : "Publish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
