import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/lib/models/Project";
import jwt from "jsonwebtoken";

async function getUserIdFromToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch (err: unknown) {
    if (err instanceof Error) console.error("JWT Error:", err.message);
    return null;
  }
}

// GET /api/projects
export async function GET(req: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const projects = await Project.find({ user: userId });
    return NextResponse.json(projects);
  } catch (err: unknown) {
    if (err instanceof Error) console.error(err.message);
    return NextResponse.json({ message: "Error fetching projects" }, { status: 500 });
  }
}

// POST /api/projects
export async function POST(req: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, description } = await req.json();
    const newProject = await Project.create({ name, description, user: userId });
    return NextResponse.json(newProject);
  } catch (err: unknown) {
    if (err instanceof Error) console.error(err.message);
    return NextResponse.json({ message: "Error creating project" }, { status: 500 });
  }
}

