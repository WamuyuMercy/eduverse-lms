"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ClipboardList, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSection } from "@/components/ui/spinner";
import { FileUpload } from "@/components/shared/FileUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { formatDate, isOverdue, isDueSoon, getDaysUntilDue } from "@/lib/utils";
import type { Assignment, Class, Subject } from "@/types";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
    classId: "",
    subjectId: "",
  });
  const { toast } = useToast();

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assignments");
      const data = await res.json();
      if (data.success) setAssignments(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
    Promise.all([fetch("/api/classes"), fetch("/api/subjects")]).then(
      async ([classRes, subjectRes]) => {
        const [cd, sd] = await Promise.all([classRes.json(), subjectRes.json()]);
        if (cd.success) setClasses(cd.data);
        if (sd.success) setSubjects(sd.data);
      }
    );
  }, [fetchAssignments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let fileUrl: string | undefined;
      let filePublicId: string | undefined;
      let fileName: string | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "assignments");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) { toast.error("File upload failed"); return; }
        fileUrl = uploadData.data.url;
        filePublicId = uploadData.data.publicId;
        fileName = uploadData.data.originalFilename;
      }

      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, maxScore: Number(form.maxScore), fileUrl, filePublicId, fileName }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Assignment created!");
        setShowModal(false);
        setForm({ title: "", description: "", dueDate: "", maxScore: 100, classId: "", subjectId: "" });
        setFile(null);
        fetchAssignments();
      } else {
        toast.error(data.error || "Failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubjects = form.classId
    ? subjects.filter((s) => {
        const cls = classes.find((c) => c.id === form.classId);
        return cls ? s.curriculum === cls.curriculum : true;
      })
    : subjects;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage class assignments</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> New Assignment
        </Button>
      </div>

      {loading ? (
        <LoadingSection />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Create your first assignment for students."
          action={<Button onClick={() => setShowModal(true)}>New Assignment</Button>}
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => {
            const overdue = isOverdue(assignment.dueDate);
            const dueSoon = isDueSoon(assignment.dueDate);
            const daysLeft = getDaysUntilDue(assignment.dueDate);

            return (
              <div key={assignment.id} className="lms-card flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${assignment.subject?.color}20` }}
                >
                  <ClipboardList
                    className="w-5 h-5"
                    style={{ color: assignment.subject?.color || "#7C3AED" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                    {overdue && <Badge variant="destructive">Overdue</Badge>}
                    {!overdue && dueSoon && <Badge variant="warning">Due Soon</Badge>}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {assignment.subject && (
                      <span className="text-xs text-gray-500">{assignment.subject.name}</span>
                    )}
                    {assignment.class && (
                      <span className="text-xs text-gray-500">{assignment.class.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(assignment.dueDate)}
                    {!overdue && (
                      <span className={dueSoon ? "text-orange-600 font-medium" : "text-gray-400"}>
                        ({daysLeft}d left)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Users className="w-3.5 h-3.5" />
                    {(assignment as Assignment & { _count?: { submissions: number } })._count?.submissions || 0} submissions
                  </div>
                  <span className="text-xs text-gray-400">Max: {assignment.maxScore} pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <Input
              label="Assignment Title"
              placeholder="e.g. Algebra Problem Set 1"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Textarea
              label="Instructions"
              placeholder="Detailed assignment instructions for students..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="h-32"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="form-label">Class</label>
                <select className="form-input" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value, subjectId: "" })} required>
                  <option value="">— Select class —</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="form-label">Subject</label>
                <select className="form-input" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
                  <option value="">— Select subject —</option>
                  {filteredSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Due Date"
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
              <Input
                label="Max Score"
                type="number"
                min="1"
                max="1000"
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="form-label">Attach File (optional)</label>
              <FileUpload onFileSelect={setFile} selectedFile={file} />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate as unknown as React.MouseEventHandler} disabled={submitting || !form.title || !form.classId || !form.subjectId || !form.dueDate}>
              {submitting ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
