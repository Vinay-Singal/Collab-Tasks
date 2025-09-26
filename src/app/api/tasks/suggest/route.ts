// app/api/tasks/suggest/route.ts
import { NextResponse } from "next/server";
import { getTaskSuggestions } from "../../../../../lib/ai";
import jwt, { JwtPayload } from "jsonwebtoken";

// Optional: helper to verify JWT (if your app uses bearer tokens)
function getUserIdFromReq(req: Request): string | null {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { id?: string };
    return decoded?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    // Only authenticated users can use AI
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description } = (await req.json()) as { title?: string; description?: string };

    if (!title || !description) {
      return NextResponse.json({ message: "Title and description required" }, { status: 400 });
    }

    const suggestions = await getTaskSuggestions(title, description);
    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("AI route error:", err.message, err.stack);
    return NextResponse.json({ message: "Error generating suggestions" }, { status: 500 });
  }
}
