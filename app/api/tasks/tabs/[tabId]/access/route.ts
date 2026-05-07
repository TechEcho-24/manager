import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { TaskTab } from "@/models/taskTab";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: { tabId: string } }) {
  try {
    const session = await auth();
    const orgRole = (session?.user as any)?.orgRole;
    
    // Only owners and staff can manage access
    if (!session?.user?.organizationId || (orgRole !== "owner" && orgRole !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { userId, permission } = await req.json();

    if (!userId || !permission) {
      return NextResponse.json({ error: "Missing userId or permission" }, { status: 400 });
    }

    const tab = await TaskTab.findOne({ _id: params.tabId, organizationId: session.user.organizationId });
    if (!tab) {
      return NextResponse.json({ error: "Tab not found" }, { status: 404 });
    }

    // Update or add access
    const existingIndex = tab.accessControl.findIndex(a => a.userId === userId);
    
    if (permission === "none") {
      if (existingIndex >= 0) {
        tab.accessControl.splice(existingIndex, 1);
      }
    } else {
      if (existingIndex >= 0) {
        tab.accessControl[existingIndex].permission = permission;
      } else {
        tab.accessControl.push({ userId, permission });
      }
    }

    await tab.save();

    return NextResponse.json({ success: true, tab });
  } catch (error: any) {
    console.error("POST Tab Access API Error:", error);
    return NextResponse.json({ error: "Failed to update access" }, { status: 500 });
  }
}
