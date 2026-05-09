import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const members = await User.find({ organizationId: session.user.organizationId }).select("-password");

    return NextResponse.json({ members });
  } catch (error: any) {
    console.error("GET Team API Error:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}
