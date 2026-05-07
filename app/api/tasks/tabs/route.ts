import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { TaskTab } from "@/models/taskTab";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const orgId = session.user.organizationId;
    const userId = session.user.id;
    const orgRole = (session.user as any).orgRole || "owner";

    let tabs;
    // Owners and staff can see all tabs. Members only see tabs they have access to.
    if (orgRole === "owner" || orgRole === "staff") {
      tabs = await TaskTab.find({ organizationId: orgId }).sort({ createdAt: -1 });
    } else {
      tabs = await TaskTab.find({ 
        organizationId: orgId,
        "accessControl.userId": userId
      }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ tabs });
  } catch (error: any) {
    console.error("GET Task Tabs API Error:", error);
    return NextResponse.json({ error: "Failed to fetch task tabs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const orgRole = (session?.user as any)?.orgRole || "owner"; // Fallback just in case
    
    // Only owners and staff can create tabs
    if (!session?.user?.organizationId || (orgRole !== "owner" && orgRole !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { name, type } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const tab = await TaskTab.create({
      organizationId: session.user.organizationId,
      name,
      type: type || "project",
      accessControl: []
    });

    return NextResponse.json({ success: true, tab });
  } catch (error: any) {
    console.error("POST Task Tabs API Error:", error);
    return NextResponse.json({ error: "Failed to create task tab" }, { status: 500 });
  }
}
