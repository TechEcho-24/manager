import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import { User } from "@/models/user";

export async function POST(req: Request) {
  let dbSession: mongoose.ClientSession | null = null;

  try {
    await connectDB();
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists — return special code so frontend can sign in instead
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "USER_EXISTS", message: "Account already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Start a transaction — if anything fails, the user is NOT created
    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await User.create(
      [
        {
          name,
          email: normalizedEmail,
          phone,
          password: hashedPassword,
          role: "client",
          onboardingCompleted: false,
        },
      ],
      { session: dbSession }
    );

    await dbSession.commitTransaction();

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    // Roll back — nothing is saved if anything failed
    if (dbSession) {
      await dbSession.abortTransaction();
    }
    console.error("Registration Error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during registration" },
      { status: 500 }
    );
  } finally {
    if (dbSession) {
      await dbSession.endSession();
    }
  }
}
