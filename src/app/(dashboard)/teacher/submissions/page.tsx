"use client";

import { useState, useEffect, useCallback } from "react";
import { Award, Download, Sparkles, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSection } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import {
  formatDate,
  formatRelative,
  getStatusColor,
  getStatusLabel,
  calculatePercentage,
  getGradeBgColor,
  getInitials,
} from "@/lib/utils";
import type { Submission } from "@/types";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<Submission | null>(null);
  const [gradingAI, setGradingAI] = useState(false);
  const [gradeForm, setGradeForm] = useState({ score: 0, feedback: "" });
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const { toast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/submissions${params}`);
      const data = await res.json();
      if (data.success) setSubmissions(data.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const openGrading = (submission: Submission) => {
    setGrading(submission);
    setGradeForm({
      score: submission.grade?.score || 0,
      feedback: submission.grade?.feedback || "",
    });
  };

  const getAISuggestion = async () => {
    if (!grading) return;
    setGradingAI(true);
    try {
      const res = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: grading.id }),
      });
      const data = await res.json();
      if (data.success) {
        const { suggestedFeedback, scoreRange } = data.data;
        setGradeForm((prev) => ({
          score: prev.score || scoreRange.suggested,
          feedback: suggestedFeedback,
        }));
        toast.success("AI feedback generated!");
      } else {
        toast.error(data.error || "AI unavailable");
      }
    } catch {
      toast.error("AI feedback failed");
    } finally {
      setGradingAI(false);
    }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grading) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: grading.id,
          score: Number(gradeForm.score),
          feedback: gradeForm.feedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Graded successfully!");
        setGrading(null);
        fetchSubmissions();
      } else {
        toast.error(data.error || "Failed to grade");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const maxScore = grading?.assignment?.maxScore || 100;
  const percentage = calculatePercentage(gradeForm.score, maxScore);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">Review and grade student work</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "SUBMITTED", label: "Pending" },
          { value: "GRADED", label: "Graded" },
          { value: "LATE", label: "Late" },
          { value: "", label: "All" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSection />
      ) : submissions.length === 0 ? (
        <EmptyState icon={Award} title="No submissions found" description="No student submissions match this filter." />
      ) : (
        <div className="lms-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Subject</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const pct = sub.grade ? calculatePercentage(sub.grade.score, sub.grade.maxScore) : null;
                  return (
                    <tr key={sub.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-semibold text-purple-700">
                            {getInitials(sub.student?.name || "S")}
                          </div>
                          <span className="font-medium text-gray-900">{sub.student?.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-700 line-clamp-1">{sub.assignment?.title}</span>
                      </td>
                      <td>
                        <span
                          className="text-xs px-2 py-1 rounded-lg font-medium"
                          style={{
                            backgroundColor: `${(sub.assignment as Submission["assignment"] & { subject?: { color: string } })?.subject?.color}20`,
                            color: (sub.assignment as Submission["assignment"] & { subject?: { color: string } })?.subject?.color,
                          }}
                        >
                          {(sub.assignment as Submission["assignment"] & { subject?: { name: string } })?.subject?.name}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-500">{formatRelative(sub.submittedAt)}</span>
                      </td>
                      <td>
                        <Badge className={getStatusColor(sub.status)}>{getStatusLabel(sub.status)}</Badge>
                      </td>
                      <td>
                        {pct !== null ? (
                          <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${getGradeBgColor(pct)}`}>
                            {sub.grade?.score}/{sub.grade?.maxScore} ({pct}%)
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {sub.fileUrl && (
                            <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Download submission">
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <Button size="sm" variant={sub.status === "GRADED" ? "outline" : "default"} onClick={() => openGrading(sub)}>
                            {sub.status === "GRADED" ? "Re-grade" : "Grade"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      <Dialog open={!!grading} onOpenChange={() => setGrading(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          {grading && (
            <form onSubmit={handleGrade} className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900">{grading.student?.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{grading.assignment?.title}</p>
                {grading.fileUrl && (
                  <a href={grading.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1.5 text-xs text-purple-600 hover:underline">
                    <FileText className="w-3.5 h-3.5" />
                    View submission
                  </a>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="form-label">
                  Score (out of {maxScore})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max={maxScore}
                    value={gradeForm.score}
                    onChange={(e) => setGradeForm({ ...gradeForm, score: parseFloat(e.target.value) })}
                    className="form-input w-32"
                    required
                  />
                  {gradeForm.score > 0 && (
                    <span className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${getGradeBgColor(percentage)}`}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="form-label">Feedback</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={getAISuggestion}
                    disabled={gradingAI}
                  >
                    {gradingAI ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    AI Suggest
                  </Button>
                </div>
                <Textarea
                  placeholder="Write feedback for the student..."
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  className="h-28"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setGrading(null)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Grading..." : "Submit Grade"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
