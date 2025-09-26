// lib/ai.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getTaskSuggestions(title: string, description: string): Promise<string[]> {
  const safeTitle = (title || "").trim().slice(0, 300);
  const safeDesc = (description || "").trim().slice(0, 1200);

  if (!process.env.OPENAI_API_KEY) {
    return [
      `Consider breaking "${safeTitle}" into smaller subtasks.`,
      `Add a deadline for "${safeTitle}" to improve tracking.`,
      `Clarify prerequisites or dependencies for "${safeTitle}".`,
      `💡 To get real AI suggestions, use your own OpenAI API key.`,
    ];
  }

  const prompt = [
    `You are a helpful task assistant.`,
    `Given a task title and description, return 3 concise, actionable suggestions (one per line) to improve/clarify/expand the task. Keep each suggestion short (max 100 characters).`,
    ``,
    `Title: ${safeTitle}`,
    `Description: ${safeDesc}`,
    ``,
    `Return only the suggestions as bullet lines or numbered lines.`
  ].join("\n");

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 200,
      n: 1,
    });

    const raw = response.choices?.[0]?.message?.content || "";

    const lines = raw
      .split(/\r?\n/)
      .map(l => l.replace(/^[\-\*\d\.\)\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 5);

    if (lines.length === 0) {
      return [
        `Add a deadline to "${safeTitle}".`,
        `Break it into smaller subtasks.`,
        `Specify acceptance criteria.`,
        `💡 To get real AI suggestions, use your own OpenAI API key.`,
      ];
    }

    return lines;
  } catch (err) {
    console.error("AI error:", err);
    return [
      `Consider breaking "${safeTitle}" into smaller subtasks.`,
      `Add a deadline for "${safeTitle}".`,
      `Review dependencies before starting "${safeTitle}".`,
      `💡 To get real AI suggestions, use your own OpenAI API key.`,
    ];
  }
}
