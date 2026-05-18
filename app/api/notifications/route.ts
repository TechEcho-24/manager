import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Notification } from "@/models/notification";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// GET — fetch notifications visible right now (displayAfter <= now)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const now = new Date();

    const notifications = await Notification.find({
      userId: session.user.id || session.user.email,
      isRead: false,
      displayAfter: { $lte: now },
    })
      .sort({ displayAfter: 1 })
      .limit(20)
      .lean();

    return NextResponse.json({ notifications, count: notifications.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — mark all as read
export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    await Notification.updateMany(
      { userId: session.user.id || session.user.email, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
