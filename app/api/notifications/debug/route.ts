import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Notification } from "@/models/notification";
import { User } from "@/models/user";
import { auth } from "@/auth";

// Temporary debug endpoint — remove after testing
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // Get session info
    const sessionInfo = {
      id: session.user.id,
      email: session.user.email,
      organizationId: (session.user as any).organizationId,
      orgRole: (session.user as any).orgRole,
    };

    // Get ALL notifications for this user (any state)
    const allNotifs = await Notification.find({
      $or: [
        { userId: session.user.id },
        { userId: session.user.email },
      ]
    }).lean();

    // Get ALL teammates
    const teammates = await User.find({
      organizationId: (session.user as any).organizationId,
    }).select("_id email name orgRole").lean();

    return NextResponse.json({
      session: sessionInfo,
      totalNotificationsForUser: allNotifs.length,
      notifications: allNotifs,
      teammates,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
