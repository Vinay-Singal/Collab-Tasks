// src/lib/db.ts
import mongoose, { Mongoose } from "mongoose";

let cached: Mongoose | null = null;

export async function connectDB(): Promise<Mongoose> {
  if (cached) return cached;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not defined");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    cached = conn;
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
