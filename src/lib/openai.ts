// =============================================================
// OpenAI LLM Integration
// =============================================================

import OpenAI from "openai";
import { QuizQuestion, GeneratedQuiz, NoteSummary, AIFeedbackSuggestion } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// =============================================================
// QUIZ GENERATION
// =============================================================
export async function generateQuizFromContent(
  content: string,
  topic: string = "the provided notes",
  numQuestions: number = 5
): Promise<GeneratedQuiz> {
  const prompt = `You are an expert teacher creating quiz questions for students.

Based on the following educational content about "${topic}", generate exactly ${numQuestions} multiple-choice quiz questions.

CONTENT:
${content.substring(0, 4000)}

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Include the correct answer
- Provide a brief explanation for the correct answer
- Questions should test understanding, not just memorization
- Vary difficulty: mix easy, medium, and challenging questions

Respond in this exact JSON format:
{
  "topic": "${topic}",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result as GeneratedQuiz;
}

// =============================================================
// NOTE SUMMARIZATION
// =============================================================
export async function summarizeNote(content: string): Promise<NoteSummary> {
  const prompt = `You are an expert educational summarizer. Analyze the following study notes and provide a concise summary suitable for students.

NOTES:
${content.substring(0, 5000)}

Provide your response in this exact JSON format:
{
  "summary": "A clear, 2-3 paragraph summary of the main content",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ],
  "difficulty": "Easy | Medium | Hard"
}

Guidelines:
- Summary should be student-friendly and clear
- List 4-6 key points (the most important concepts)
- Assess difficulty based on complexity of concepts`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 1000,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");
  return result as NoteSummary;
}

// =============================================================
// ASSIGNMENT FEEDBACK ASSISTANCE
// =============================================================
export async function generateFeedbackSuggestion(
  assignmentDescription: string,
  maxScore: number,
  studentWorkSummary?: string
): Promise<AIFeedbackSuggestion> {
  const prompt = `You are an experienced teacher helping provide constructive feedback on student work.

ASSIGNMENT:
${assignmentDescription.substring(0, 1000)}

MAX SCORE: ${maxScore} points

${studentWorkSummary ? `STUDENT WORK SUMMARY:\n${studentWorkSummary.substring(0, 500)}` : ""}

Generate professional, encouraging, and constructive teacher feedback for this assignment. The feedback should:
1. Be encouraging but honest
2. Point out what was done well
3. Identify areas for improvement
4. Be specific and actionable
5. Be appropriate for a school student

Also suggest a score range (as a percentage of max score).

Respond in this exact JSON format:
{
  "suggestedFeedback": "Your detailed feedback comment here...",
  "scoreRange": {
    "min": 60,
    "max": 85,
    "suggested": 75
  }
}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 800,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  // Convert percentages to actual scores
  if (result.scoreRange) {
    result.scoreRange.min = Math.round((result.scoreRange.min / 100) * maxScore);
    result.scoreRange.max = Math.round((result.scoreRange.max / 100) * maxScore);
    result.scoreRange.suggested = Math.round((result.scoreRange.suggested / 100) * maxScore);
  }

  return result as AIFeedbackSuggestion;
}

// =============================================================
// STUDY TIPS GENERATOR
// =============================================================
export async function generateStudyTips(
  subject: string,
  curriculum: string,
  gradeLevel: string
): Promise<string[]> {
  const prompt = `Generate 5 practical, specific study tips for a ${gradeLevel} student studying ${subject} under the ${curriculum} curriculum.

The tips should be:
- Actionable and specific
- Age-appropriate
- Focused on the specific subject
- Encouraging

Respond with a JSON array:
{"tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"]}`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 500,
  });

  const result = JSON.parse(response.choices[0].message.content || '{"tips": []}');
  return result.tips as string[];
}

export { openai };
