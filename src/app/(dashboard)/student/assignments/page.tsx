"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Upload, Calendar, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSection } from "@/components/ui/spinner";
import { FileUpload } from "@/components/shared/FileUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import {
  formatDate,
  isOverdue,
  isDueSoon,
  getDaysUntilDue,
  getStatusColor,
  getStatusLabel,
  calculatePercentage,
  getGradeBgColor,
} from "@/lib/utils";
import type { Assignment, Submission } from "@/types";

type AssignmentWithSubmission = Assignment & {
  submissions: (Submission & { grade: { score: number; maxScore: number; feedback?: string | null } | null })[];
};

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithSubmission | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");
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
  }, [fetchAssignments]);

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    setSubmitting(selectedAssignment.id);

    try {
      let fileUrl: string | undefined;
      let filePublicId: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "submissions");
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) { toast.error("Upload failed"); return; }
        fileUrl = uploadData.data.url;
        filePublicId = uploadData.data.publicId;
        fileName = uploadData.data.originalFilename;
        fileSize = file.size;
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          fileUrl,
          filePublicId,
          fileName,
          fileSize,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Assignment submitted!");
        setSelectedAssignment(null);
        setFile(null);
        fetchAssignments();
      } else {
        toast.error(data.error || "Submission failed");
      }
    } finally {
      setSubmitting(null);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filter === "pending") return a.submissions.length === 0;
    if (filter === "submitted") return a.submissions.length > 0 && a.submissions[0].status !== "GRADED";
    if (filter === "graded") return a.submissions[0]?.grade !== null && a.submissions[0]?.grade !== undefined;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-500 text-sm mt-1">View and submit your assignments</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "submitted", label: "Submitted" },
          { value: "graded", label: "Graded" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.value ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSection />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assignments" description="No assignments match this filter." />
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => {
            const submission = assignment.submissions[0];
            const hasSubmitted = !!submission;
            const isGraded = submission?.grade !== null && submission?.grade !== undefined;
            const overdue = isOverdue(assignment.dueDate) && !hasSubmitted;
            const dueSoon = isDueSoon(assignment.dueDate) && !hasSubmitted;
            const pct = isGraded && submission.grade ? calculatePercentage(submission.grade.score, submission.grade.maxScore) : null;

            return (
              <div key={assignment.id} className={`lms-card border-l-4 ${overdue ? "border-l-red-400" : isGraded ? "border-l-green-400" : hasSubmitted ? "border-l-blue-400" : dueSoon ? "border-l-orange-400" : "border-l-purple-200"}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${assignment.subject?.color}20` }}>
                    <ClipboardList className="w-5 h-5" style={{ color: assignment.subject?.color || "#7C3AED" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      {overdue && <Badge variant="destructive">Overdue</Badge>}
                      {!overdue && dueSoon && <Badge variant="warning">Due Soon</Badge>}
                      {hasSubmitted && !isGraded && <Badge variant="blue">{getStatusLabel(submission.status)}</Badge>}
                      {isGraded && pct !== null && <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${getGradeBgColor(pct)}`}>{pct}%</span>}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{assignment.description}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {assignment.subject && (
                        <span className="text-xs font-medium" style={{ color: assignment.subject.color }}>
                          {assignment.subject.name}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {formatDate(assignment.dueDate)}
                        {!hasSubmitted && !overdue && ` (${getDaysUntilDue(assignment.dueDate)}d)`}
                      </div>
                      <span className="text-xs text-gray-400">Max: {assignment.maxScore} pts</span>
                    </div>
                    {isGraded && submission.grade?.feedback && (
                      <div className="mt-3 p-3 bg-green-50 rounded-xl">
                        <p className="text-xs font-semibold text-green-800 mb-1">Teacher Feedback</p>
                        <p className="text-sm text-green-700">{submission.grade.feedback}</p>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {!hasSubmitted && (
                      <Button size="sm" onClick={() => setSelectedAssignment(assignment)} disabled={overdue}>
                        <Upload className="w-3.5 h-3.5" />
                        Submit
                      </Button>
                    )}
                    {hasSubmitted && !isGraded && (
                      <Button size="sm" variant="outline" onClick={() => setSelectedAssignment(assignment)}>
                        Re-submit
                      </Button>
                    )}
                    {isGraded && (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-xs font-medium">Graded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      <Dialog open={!!selectedAssignment} onOpenChange={() => { setSelectedAssignment(null); setFile(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 rounded-xl">
              <p className="text-sm font-semibold text-purple-900">{selectedAssignment?.title}</p>
              <p className="text-xs text-purple-600 mt-1">Max Score: {selectedAssignment?.maxScore} points</p>
            </div>
            <FileUpload
              label="Upload your submission"
              onFileSelect={setFile}
              selectedFile={file}
              isUploading={!!submitting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedAssignment(null); setFile(null); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!file || !!submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
