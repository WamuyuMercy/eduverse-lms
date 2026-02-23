"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSection } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { getCurriculumColor } from "@/lib/utils";
import type { Subject } from "@/types";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    curriculum: "IGCSE",
    code: "",
    description: "",
    color: "#7C3AED",
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? `?curriculum=${filter}` : "";
      const res = await fetch(`/api/subjects${params}`);
      const data = await res.json();
      if (data.success) setSubjects(data.data);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Subject created!");
        setShowModal(false);
        setForm({ name: "", curriculum: "IGCSE", code: "", description: "", color: "#7C3AED" });
        fetchSubjects();
      } else {
        toast.error(data.error || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const igcseSubjects = subjects.filter((s) => s.curriculum === "IGCSE");
  const cbcSubjects = subjects.filter((s) => s.curriculum === "CBC");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage IGCSE and CBC subjects</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["", "IGCSE", "CBC"].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === c
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSection />
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No subjects yet"
          description="Add your first subject to get started."
          action={<Button onClick={() => setShowModal(true)}>Add Subject</Button>}
        />
      ) : (
        <div className="space-y-6">
          {[
            { label: "IGCSE Subjects", items: igcseSubjects },
            { label: "CBC Subjects", items: cbcSubjects },
          ]
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <div key={group.label}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {group.label} ({group.items.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((subject) => (
                    <div
                      key={subject.id}
                      className="lms-card flex items-center gap-4"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${subject.color}20` }}
                      >
                        <BookOpen
                          className="w-5 h-5"
                          style={{ color: subject.color || "#7C3AED" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{subject.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {subject.code && (
                            <span className="text-xs text-gray-400 font-mono">
                              {subject.code}
                            </span>
                          )}
                          <Badge className={getCurriculumColor(subject.curriculum)}>
                            {subject.curriculum}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Create Subject Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Subject Name"
              placeholder="e.g. Mathematics"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="form-label">Curriculum</label>
                <select
                  className="form-input"
                  value={form.curriculum}
                  onChange={(e) => setForm({ ...form, curriculum: e.target.value })}
                >
                  <option value="IGCSE">IGCSE</option>
                  <option value="CBC">CBC</option>
                </select>
              </div>
              <Input
                label="Subject Code"
                placeholder="e.g. MATH-01"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <Input
              label="Description (optional)"
              placeholder="Brief subject description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="space-y-1.5">
              <label className="form-label">Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{form.color}</span>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Subject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
