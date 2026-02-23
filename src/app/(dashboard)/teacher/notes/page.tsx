"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, FileText, Trash2, Sparkles } from "lucide-react";
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
import { formatDate, getTermLabel, truncate } from "@/lib/utils";
import type { Note, Class, Subject } from "@/types";

export default function TeacherNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    term: "TERM_1",
    classId: "",
    subjectId: "",
  });
  const { toast } = useToast();

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.success) setNotes(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
    const fetchMeta = async () => {
      const [classRes, subjectRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/subjects"),
      ]);
      const [classData, subjectData] = await Promise.all([classRes.json(), subjectRes.json()]);
      if (classData.success) setClasses(classData.data);
      if (subjectData.success) setSubjects(subjectData.data);
    };
    fetchMeta();
  }, [fetchNotes]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let fileUrl: string | undefined;
      let filePublicId: string | undefined;
      let fileName: string | undefined;

      if (file) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "notes");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          toast.error("File upload failed");
          return;
        }
        fileUrl = uploadData.data.url;
        filePublicId = uploadData.data.publicId;
        fileName = uploadData.data.originalFilename;
        setUploading(false);
      }

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fileUrl, filePublicId, fileName }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Note uploaded successfully!");
        setShowModal(false);
        setForm({ title: "", description: "", content: "", term: "TERM_1", classId: "", subjectId: "" });
        setFile(null);
        fetchNotes();
      } else {
        toast.error(data.error || "Failed to create note");
      }
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Note deleted");
      fetchNotes();
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
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-500 text-sm mt-1">Upload and manage class notes</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Upload Note
        </Button>
      </div>

      {loading ? (
        <LoadingSection />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No notes yet"
          description="Upload your first set of notes for your students."
          action={<Button onClick={() => setShowModal(true)}>Upload Note</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="lms-card-hover group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${note.subject?.color}20` }}
                  >
                    <FileText
                      className="w-4 h-4"
                      style={{ color: note.subject?.color || "#7C3AED" }}
                    />
                  </div>
                  <Badge variant="secondary">{getTermLabel(note.term)}</Badge>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{note.title}</h3>
              {note.description && (
                <p className="text-sm text-gray-500 mb-3">{truncate(note.description, 80)}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {note.subject && (
                  <span
                    className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={{
                      backgroundColor: `${note.subject.color}20`,
                      color: note.subject.color || "#7C3AED",
                    }}
                  >
                    {note.subject.name}
                  </span>
                )}
                {note.class && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
                    {note.class.name}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-3">{formatDate(note.createdAt)}</p>

              {note.fileUrl && (
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1.5 text-xs text-purple-600 hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {note.fileName || "View File"}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload New Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <Input
              label="Title"
              placeholder="e.g. Chapter 4 - Forces and Motion"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <Textarea
              label="Description (optional)"
              placeholder="Brief description of what this note covers..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="h-20"
            />

            <Textarea
              label="Content (optional)"
              placeholder="Type note content here, or upload a file below..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="h-28"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="form-label">Class</label>
                <select
                  className="form-input"
                  value={form.classId}
                  onChange={(e) => setForm({ ...form, classId: e.target.value, subjectId: "" })}
                  required
                >
                  <option value="">— Select class —</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="form-label">Subject</label>
                <select
                  className="form-input"
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  required
                >
                  <option value="">— Select subject —</option>
                  {filteredSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Term</label>
              <select
                className="form-input"
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
              >
                <option value="TERM_1">Term 1</option>
                <option value="TERM_2">Term 2</option>
                <option value="TERM_3">Term 3</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="form-label">Attach File (PDF, DOC, PPT)</label>
              <FileUpload
                onFileSelect={setFile}
                selectedFile={file}
                isUploading={uploading}
              />
            </div>
          </form>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate as unknown as React.MouseEventHandler<HTMLButtonElement>}
              disabled={submitting || uploading || !form.title || !form.classId || !form.subjectId}
            >
              {submitting ? "Uploading..." : "Upload Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
