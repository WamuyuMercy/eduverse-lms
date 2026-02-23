// =============================================================
// POST /api/ai/summarize - Summarize notes using AI
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { summarizeNote } from "@/lib/openai";
import { aiRateLimit } from "@/lib/rate-limit";
import { aiSummarizeSchema } from "@/lib/validations";

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
    const validated = aiSummarizeSchema.parse(body);

    const summary = await summarizeNote(validated.content);

    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    console.error("AI summarize error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to summarize content" },
      { status: 500 }
    );
  }
}
