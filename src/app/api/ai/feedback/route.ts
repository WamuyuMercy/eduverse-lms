// =============================================================
// POST /api/ai/feedback - Generate grading feedback suggestion
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateFeedbackSuggestion } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { aiRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: "Teacher access required" }, { status: 403 });
  }

  const limit = aiRateLimit(session.user.id);
  if (!limit.success) {
    return NextResponse.json(
      { success: false, error: "AI rate limit exceeded. Please wait before trying again." },
      { status: 429 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { success: false, error: "AI features are not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { submissionId } = body;

    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "Submission ID required" },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          select: {
            title: true,
            description: true,
            maxScore: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    const feedback = await generateFeedbackSuggestion(
      `${submission.assignment.title}\n\n${submission.assignment.description}`,
      submission.assignment.maxScore
    );

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    console.error("AI feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
