"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Users, BookOpen, GraduationCap } from "lucide-react";
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
import type { Class } from "@/types";

interface ClassWithCounts extends Class {
  _count: { students: number; teachers: number; subjects: number };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    curriculum: "IGCSE",
    gradeLevel: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/classes?withCounts=true");
      const data = await res.json();
      if (data.success) setClasses(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Class created successfully!");
        setShowModal(false);
        setForm({ name: "", curriculum: "IGCSE", gradeLevel: "", description: "" });
        fetchClasses();
      } else {
        toast.error(data.error || "Failed to create class");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage IGCSE and CBC classes
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> New Class
        </Button>
      </div>

      {loading ? (
        <LoadingSection />
      ) : classes.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No classes yet"
          description="Create your first class to get started."
          action={<Button onClick={() => setShowModal(true)}>Create Class</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="lms-card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <Badge className={getCurriculumColor(cls.curriculum)}>
                  {cls.curriculum}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900">{cls.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{cls.gradeLevel}</p>
              {cls.description && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{cls.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5" />
                  {cls._count?.students || 0} students
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <BookOpen className="w-3.5 h-3.5" />
                  {cls._count?.subjects || 0} subjects
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Class Name"
              placeholder="e.g. Year 10 IGCSE"
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
                label="Grade Level"
                placeholder="e.g. Year 10"
                value={form.gradeLevel}
                onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })}
                required
              />
            </div>
            <Input
              label="Description (optional)"
              placeholder="Brief description of this class"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Class"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
