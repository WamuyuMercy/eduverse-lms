"use client";

import { useState, useEffect, useCallback } from "react";
import { Award, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSection } from "@/components/ui/spinner";
import { useToast } from "@/hooks/useToast";
import { formatDate, calculatePercentage, getGradeBgColor, getGradeLetter } from "@/lib/utils";
import type { Grade } from "@/types";

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/grades");
      const data = await res.json();
      if (data.success) setGrades(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const avgScore = grades.length > 0
    ? Math.round(grades.reduce((acc, g) => acc + calculatePercentage(g.score, g.maxScore), 0) / grades.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
        <p className="text-gray-500 text-sm mt-1">Your academic performance overview</p>
      </div>

      {grades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="lms-card text-center">
            <p className="text-sm text-gray-500 mb-1">Average Grade</p>
            <p className={`text-4xl font-bold ${avgScore >= 70 ? "text-green-600" : avgScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
              {avgScore}%
            </p>
            <p className="text-lg font-semibold text-gray-700 mt-1">{getGradeLetter(avgScore)}</p>
          </div>
          <div className="lms-card text-center">
            <p className="text-sm text-gray-500 mb-1">Assignments Graded</p>
            <p className="text-4xl font-bold text-purple-600">{grades.length}</p>
          </div>
          <div className="lms-card text-center">
            <p className="text-sm text-gray-500 mb-1">Highest Grade</p>
            <p className="text-4xl font-bold text-blue-600">
              {grades.length > 0 ? Math.max(...grades.map((g) => calculatePercentage(g.score, g.maxScore))) : 0}%
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSection />
      ) : grades.length === 0 ? (
        <EmptyState icon={Award} title="No grades yet" description="Your grades will appear here once your teacher marks your assignments." />
      ) : (
        <div className="space-y-3">
          {grades.map((grade) => {
            const pct = calculatePercentage(grade.score, grade.maxScore);
            const submission = grade.submission as Grade["submission"] & {
              assignment: {
                title: string;
                maxScore: number;
                subject: { name: string; color: string };
                class?: { name: string };
              };
            };

            return (
              <div key={grade.id} className="lms-card">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${getGradeBgColor(pct)}`}>
                    <span className="text-xl font-bold leading-none">{pct}%</span>
                    <span className="text-xs font-semibold mt-0.5">{getGradeLetter(pct)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{submission?.assignment?.title}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span
                        className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={{
                          backgroundColor: `${submission?.assignment?.subject?.color}20`,
                          color: submission?.assignment?.subject?.color,
                        }}
                      >
                        {submission?.assignment?.subject?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {grade.score}/{grade.maxScore} marks
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(grade.createdAt)}</span>
                    </div>
                    {grade.feedback && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-xl">
                        <p className="text-xs font-semibold text-purple-800 mb-1">Teacher Feedback</p>
                        <p className="text-sm text-purple-700">{grade.feedback}</p>
                      </div>
                    )}
                    {grade.gradedFileUrl && (
                      <a
                        href={grade.gradedFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-purple-600 hover:underline"
                      >
                        Download marked script
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
