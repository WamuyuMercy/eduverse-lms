// =============================================================
// POST /api/ai/quiz - Generate quiz questions from notes
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateQuizFromContent } from "@/lib/openai";
import { aiRateLimit } from "@/lib/rate-limit";
import { aiQuizSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
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
    const validated = aiQuizSchema.parse(body);

    const quiz = await generateQuizFromContent(
      validated.content,
      validated.topic || "the provided notes",
      validated.numQuestions || 5
    );

    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    console.error("AI quiz error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
