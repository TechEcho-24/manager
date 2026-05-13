import { NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import connectDB from "@/lib/db";
import { Task } from "@/models/task";
import { TaskTab } from "@/models/taskTab";
import { auth } from "@/auth";
import { Organization } from "@/models/organization";
import { User } from "@/models/user";
import { getTaskCapabilities, PlanType } from "@/lib/plan-config";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants";

type TaskAttachmentInput = {
  type: "voice" | "image";
  url: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  duration?: number;
  width?: number;
  height?: number;
  waveformPeaks?: number[];
};

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

async function getTaskCapabilitiesForOrg(organizationId: string) {
  const org = await Organization.findById(organizationId);
  const plan = (org?.plan || "starter") as PlanType;
  return { plan, taskCapabilities: getTaskCapabilities(plan) };
}

function normalizeAttachments(attachments: unknown): TaskAttachmentInput[] {
  if (!Array.isArray(attachments)) return [];

  return attachments
    .filter((attachment: any) => {
      return (
        (attachment?.type === "voice" || attachment?.type === "image") &&
        typeof attachment?.url === "string" &&
        attachment.url.trim().length > 0
      );
    })
    .map((attachment: any) => ({
      type: attachment.type,
      url: attachment.url.trim(),
      publicId: typeof attachment.publicId === "string" ? attachment.publicId : undefined,
      format: typeof attachment.format === "string" ? attachment.format : undefined,
      bytes: typeof attachment.bytes === "number" ? attachment.bytes : undefined,
      duration: typeof attachment.duration === "number" ? attachment.duration : undefined,
      width: typeof attachment.width === "number" ? attachment.width : undefined,
      height: typeof attachment.height === "number" ? attachment.height : undefined,
      waveformPeaks: Array.isArray(attachment.waveformPeaks)
        ? attachment.waveformPeaks
            .filter((peak: unknown) => typeof peak === "number" && Number.isFinite(peak))
            .slice(0, 96)
        : undefined,
    }));
}

function validateAttachmentsForPlan(attachments: TaskAttachmentInput[], taskCapabilities: ReturnType<typeof getTaskCapabilities>) {
  if (attachments.some((attachment) => attachment.type === "voice") && !taskCapabilities.voice) {
    return "Voice task attachments are available on the Growth plan and higher.";
  }

  if (attachments.some((attachment) => attachment.type === "image") && !taskCapabilities.image) {
    return "Image task attachments are available on the Pro plan and higher.";
  }

  return null;
}

function normalizeTaskStatus(status: unknown): TaskStatus | null {
  if (typeof status !== "string") return null;
  return TASK_STATUSES.includes(status as TaskStatus) ? status as TaskStatus : null;
}

async function resolveAssignee(assignedToUserId: unknown, organizationId: string, tab: any) {
  if (!assignedToUserId || typeof assignedToUserId !== "string") {
    return { assignedToUserId: undefined, assignedToName: undefined };
  }

  const assignee = await User.findOne({ _id: assignedToUserId, organizationId }).select("_id name orgRole");
  if (!assignee) return { error: "Assigned user not found", status: 400 };

  const canAccessTab =
    assignee.orgRole === "owner" ||
    assignee.orgRole === "staff" ||
    tab.accessControl.some((access: any) => access.userId === assignee._id.toString());

  if (!canAccessTab) {
    return { error: "Assigned user does not have access to this task tab", status: 400 };
  }

  return {
    assignedToUserId: assignee._id.toString(),
    assignedToName: assignee.name,
  };
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
    const { plan, taskCapabilities } = await getTaskCapabilitiesForOrg(session.user.organizationId);
    return NextResponse.json({ tasks, hasWriteAccess: accessCheck.hasWrite, plan, taskCapabilities });
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
    const { tabId, text, priority, assignedToUserId } = data;
    const attachments = normalizeAttachments(data.attachments);
    const taskText = typeof text === "string" ? text.trim() : "";
    const status = normalizeTaskStatus(data.status) || "To Do";

    if (!tabId || (!taskText && attachments.length === 0)) {
      return NextResponse.json({ error: "Add task text or at least one attachment" }, { status: 400 });
    }

    const accessCheck = await verifyTabAccess(tabId, session.user.id, session.user.organizationId, (session.user as any).orgRole, true);
    if (accessCheck.error) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });

    const { taskCapabilities } = await getTaskCapabilitiesForOrg(session.user.organizationId);
    const planError = validateAttachmentsForPlan(attachments, taskCapabilities);
    if (planError) return NextResponse.json({ error: planError }, { status: 403 });

    const assignee = await resolveAssignee(assignedToUserId, session.user.organizationId, accessCheck.tab);
    if (assignee.error) return NextResponse.json({ error: assignee.error }, { status: assignee.status });

    const task = await Task.create({
      tabId,
      text: taskText,
      assignedToUserId: assignee.assignedToUserId,
      assignedToName: assignee.assignedToName,
      attachments,
      priority: priority || "medium",
      status,
      completed: status === "Completed"
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
    const { taskId, tabId, completed, text, priority, status, assignedToUserId } = data;

    if (!taskId || !tabId) return NextResponse.json({ error: "Missing taskId or tabId" }, { status: 400 });

    const accessCheck = await verifyTabAccess(tabId, session.user.id, session.user.organizationId, (session.user as any).orgRole, true);
    if (accessCheck.error) return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });

    // Build update object dynamically
    const updateFields: Record<string, any> = {};
    if (completed !== undefined) {
      updateFields.completed = Boolean(completed);
      updateFields.status = updateFields.completed ? "Completed" : "To Do";
    }
    if (typeof text === "string") updateFields.text = text.trim();
    if (priority !== undefined && ["high", "medium", "low"].includes(priority)) updateFields.priority = priority;
    if (status !== undefined) {
      const normalizedStatus = normalizeTaskStatus(status);
      if (!normalizedStatus) return NextResponse.json({ error: "Invalid task status" }, { status: 400 });
      updateFields.status = normalizedStatus;
      updateFields.completed = normalizedStatus === "Completed";
    }
    if (assignedToUserId !== undefined) {
      const assignee = await resolveAssignee(assignedToUserId, session.user.organizationId, accessCheck.tab);
      if (assignee.error) return NextResponse.json({ error: assignee.error }, { status: assignee.status });
      updateFields.assignedToUserId = assignee.assignedToUserId;
      updateFields.assignedToName = assignee.assignedToName;
    }
    if (data.attachments !== undefined) {
      const attachments = normalizeAttachments(data.attachments);
      const { taskCapabilities } = await getTaskCapabilitiesForOrg(session.user.organizationId);
      const planError = validateAttachmentsForPlan(attachments, taskCapabilities);
      if (planError) return NextResponse.json({ error: planError }, { status: 403 });
      updateFields.attachments = attachments;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, tabId },
      { $set: updateFields },
      { new: true }
    );

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

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
