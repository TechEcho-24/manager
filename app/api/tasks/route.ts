import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Task } from "@/models/task";
import { TaskTab } from "@/models/taskTab";
import { auth } from "@/auth";

async function verifyTabAccess(tabId: string, userId: string, orgId: string, orgRole: string, requiresWrite: boolean = false) {
  const tab = await TaskTab.findOne({ _id: tabId, organizationId: orgId });
  if (!tab) return { error: "Tab not found", status: 404 };

  if (orgRole === "owner" || orgRole === "staff") return { tab, hasWrite: true };

  const access = tab.accessControl.find(a => a.userId === userId);
  if (!access) return { error: "Access denied", status: 403 };

  if (requiresWrite && access.permission !== "write") {
    return { error: "Write permission required", status: 403 };
  }

  return { tab, hasWrite: access.permission === "write" };
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    const tabId = url.searchParams.get("tabId");

    if (!session?.user?.organizationId || !tabId) {
      return NextResponse.json({ error: "Unauthorized or missing tabId" }, { status: 400 });
    }

    await connectDB();
    const accessCheck = await verifyTabAccess(tabId, session.user.id, session.user.organizationId, (session.user as any).orgRole);
    if (accessCheck.error) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });

    const tasks = await Task.find({ tabId }).sort({ createdAt: -1 });
    return NextResponse.json({ tasks, hasWriteAccess: accessCheck.hasWrite });
  } catch (error: any) {
    console.error("GET Tasks API Error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const data = await req.json();
    const { tabId, text, priority } = data;

    if (!tabId || !text) return NextResponse.json({ error: "Missing tabId or text" }, { status: 400 });

    const accessCheck = await verifyTabAccess(tabId, session.user.id, session.user.organizationId, (session.user as any).orgRole, true);
    if (accessCheck.error) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });

    const task = await Task.create({
      tabId,
      text,
      priority: priority || "medium",
      completed: false
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error("POST Tasks API Error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const data = await req.json();
    const { taskId, tabId, completed } = data;

    if (!taskId || !tabId) return NextResponse.json({ error: "Missing taskId or tabId" }, { status: 400 });

    const accessCheck = await verifyTabAccess(tabId, session.user.id, session.user.organizationId, (session.user as any).orgRole, true);
    if (accessCheck.error) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });

    const task = await Task.findOneAndUpdate(
      { _id: taskId, tabId },
      { $set: { completed } },
      { new: true }
    );

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error("PATCH Tasks API Error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const taskId = url.searchParams.get("taskId");
    const tabId = url.searchParams.get("tabId");

    if (!taskId || !tabId) return NextResponse.json({ error: "Missing taskId or tabId" }, { status: 400 });

    await connectDB();
    const accessCheck = await verifyTabAccess(tabId, session.user.id, session.user.organizationId, (session.user as any).orgRole, true);
    if (accessCheck.error) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });

    await Task.findOneAndDelete({ _id: taskId, tabId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Tasks API Error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
