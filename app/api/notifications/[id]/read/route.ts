import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Notification } from "@/models/notification";
import { auth } from "@/auth";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    await Notification.findByIdAndUpdate(id, { $set: { isRead: true } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
