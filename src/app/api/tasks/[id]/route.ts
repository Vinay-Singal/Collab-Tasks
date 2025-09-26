import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Task from "../../../../lib/models/Task";
import jwt from "jsonwebtoken";

// Helper to get userId from JWT
async function getUserIdFromToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

// PUT /api/tasks/[id]
export async function PUT(req: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // get id from URL
    if (!id) return NextResponse.json({ message: "Task ID missing" }, { status: 400 });

    const { title, description } = await req.json();
    if (!title || !description) return NextResponse.json({ message: "Title and description required" }, { status: 400 });

    const task = await Task.findOneAndUpdate(
      { _id: id, user: userId },
      { title, description },
      { new: true }
    );

    if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

    return NextResponse.json(task);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromToken(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return NextResponse.json({ message: "Task ID missing" }, { status: 400 });

    const task = await Task.findOneAndDelete({ _id: id, user: userId });
    if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

    return NextResponse.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error deleting task" }, { status: 500 });
  }
}
