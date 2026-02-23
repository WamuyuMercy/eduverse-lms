"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Sparkles, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSection } from "@/components/ui/spinner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { formatDate, getTermLabel, truncate } from "@/lib/utils";
import type { Note, NoteSummary, GeneratedQuiz } from "@/types";

export default function StudentNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [termFilter, setTermFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [aiLoading, setAiLoading] = useState<"summary" | "quiz" | null>(null);
  const [summary, setSummary] = useState<NoteSummary | null>(null);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const { toast } = useToast();

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (termFilter) params.set("term", termFilter);
      if (subjectFilter) params.set("subjectId", subjectFilter);
      const res = await fetch(`/api/notes?${params}`);
      const data = await res.json();
      if (data.success) setNotes(data.data);
    } finally {
      setLoading(false);
    }
  }, [termFilter, subjectFilter]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const subjects = Array.from(new Map(notes.filter((n) => n.subject).map((n) => [n.subjectId, n.subject])).values());

  const handleSummarize = async (note: Note) => {
    const content = note.content || note.description || note.title;
    if (!content) { toast.error("No content to summarize"); return; }
    setAiLoading("summary");
    setSummary(null);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.data);
      } else {
        toast.error(data.error || "Summarization failed");
      }
    } catch {
      toast.error("AI unavailable");
    } finally {
      setAiLoading(null);
    }
  };

  const handleGenerateQuiz = async (note: Note) => {
    const content = note.content || note.description || note.title;
    if (!content) { toast.error("No content for quiz"); return; }
    setAiLoading("quiz");
    setQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, topic: note.title, numQuestions: 5 }),
      });
      const data = await res.json();
      if (data.success) {
        setQuiz(data.data);
      } else {
        toast.error(data.error || "Quiz generation failed");
      }
    } catch {
      toast.error("AI unavailable");
    } finally {
      setAiLoading(null);
    }
  };

  const calcScore = () => {
    if (!quiz) return 0;
    return quiz.questions.filter((q, i) => quizAnswers[i] === q.correctAnswer).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
        <p className="text-gray-500 text-sm mt-1">Study materials uploaded by your teachers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)} className="form-input w-auto">
          <option value="">All Terms</option>
          <option value="TERM_1">Term 1</option>
          <option value="TERM_2">Term 2</option>
          <option value="TERM_3">Term 3</option>
        </select>
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="form-input w-auto">
          <option value="">All Subjects</option>
          {subjects.map((s) => s && <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSection />
      ) : notes.length === 0 ? (
        <EmptyState icon={FileText} title="No notes yet" description="Your teachers haven't uploaded any notes yet. Check back soon!" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="lms-card-hover group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${note.subject?.color}20` }}>
                    <FileText className="w-4 h-4" style={{ color: note.subject?.color || "#7C3AED" }} />
                  </div>
                  <Badge variant="secondary">{getTermLabel(note.term)}</Badge>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{note.title}</h3>
              {note.description && <p className="text-sm text-gray-500 flex-1">{truncate(note.description, 80)}</p>}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {note.subject && (
                  <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: `${note.subject.color}20`, color: note.subject.color }}>
                    {note.subject.name}
                  </span>
                )}
                <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600">{note.class?.name}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{formatDate(note.createdAt)}</p>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                {note.fileUrl && (
                  <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-purple-600 hover:underline">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                )}
                <div className="flex gap-1.5 ml-auto">
                  <Button size="sm" variant="outline" onClick={() => { setSelectedNote(note); handleSummarize(note); }} disabled={aiLoading !== null}>
                    <Sparkles className="w-3.5 h-3.5" />
                    Summary
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => { setSelectedNote(note); handleGenerateQuiz(note); }} disabled={aiLoading !== null}>
                    Quiz
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Results Modal */}
      <Dialog open={selectedNote !== null && (aiLoading !== null || summary !== null || quiz !== null)} onOpenChange={() => { setSelectedNote(null); setSummary(null); setQuiz(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedNote?.title}</DialogTitle>
          </DialogHeader>

          {aiLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  {aiLoading === "summary" ? "Generating summary..." : "Creating quiz..."}
                </p>
              </div>
            </div>
          )}

          {summary && !aiLoading && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center gap-2">
                <Badge variant={summary.difficulty === "Easy" ? "success" : summary.difficulty === "Medium" ? "warning" : "destructive"}>
                  {summary.difficulty}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{summary.summary}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Points</h4>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 font-semibold">{i + 1}</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {quiz && !aiLoading && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-500">{quiz.questions.length} questions • {quizSubmitted ? `Score: ${calcScore()}/${quiz.questions.length}` : "Select the correct answer"}</p>
              {quiz.questions.map((q, i) => (
                <div key={i} className={`p-4 rounded-xl border ${quizSubmitted ? (quizAnswers[i] === q.correctAnswer ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50") : "border-gray-100 bg-gray-50"}`}>
                  <p className="text-sm font-semibold text-gray-900 mb-3">{i + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [i]: opt })}
                        disabled={quizSubmitted}
                        className={`w-full text-left text-sm px-3 py-2.5 rounded-lg border transition-colors ${
                          quizSubmitted
                            ? opt === q.correctAnswer ? "bg-green-100 border-green-400 text-green-800 font-medium"
                              : opt === quizAnswers[i] ? "bg-red-100 border-red-400 text-red-800"
                              : "bg-white border-gray-200 text-gray-500"
                            : quizAnswers[i] === opt ? "bg-purple-100 border-purple-400 text-purple-800"
                            : "bg-white border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {quizSubmitted && q.explanation && (
                    <p className="text-xs text-gray-600 mt-2 p-2 bg-white rounded-lg">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              ))}
              {!quizSubmitted ? (
                <Button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < quiz.questions.length} className="w-full">
                  Submit Quiz
                </Button>
              ) : (
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-lg font-bold text-purple-700">{calcScore()}/{quiz.questions.length}</p>
                  <p className="text-sm text-gray-500">{Math.round((calcScore() / quiz.questions.length) * 100)}% correct</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
