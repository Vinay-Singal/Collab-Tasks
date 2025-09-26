import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../../../lib/db";
import User from "../../../../../lib/models/User";

interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { username, email, password } = (await req.json()) as RegisterRequestBody;

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    // Exclude password safely
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json(
      { message: "User registered", user: userObj },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error registering user" },
      { status: 500 }
    );
  }
}
