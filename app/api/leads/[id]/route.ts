import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Lead } from "@/models/lead";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const lead = await Lead.findById(id).lean();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ ...lead, id: lead._id.toString(), _id: undefined });
  } catch (error) {
    console.error("Fetch Lead Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await request.json();
    
    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Determine what changed for the timeline
    const changes: string[] = [];
    if (data.status && data.status !== lead.status) changes.push(`Status changed to ${data.status}`);
    if (data.priority && data.priority !== lead.priority) changes.push(`Priority changed to ${data.priority}`);
    if (data.assignedTo && data.assignedTo !== lead.assignedTo) changes.push(`Reassigned to ${data.assignedTo}`);
    
    const description = changes.length > 0 ? changes.join(", ") : "Lead details updated";

    // Update fields
    Object.assign(lead, data);
    
    // Add activity if requested or if something meaningful changed
    if (changes.length > 0 || data.forceActivityLog) {
      lead.activityTimeline.push({
        action: "Lead updated",
        description: data.activityDescription || description,
        createdAt: new Date(),
        createdBy: "System",
      });
    }

    await lead.save();

    return NextResponse.json({ message: "Lead updated successfully", lead: { ...lead.toObject(), id: lead._id.toString() } });
  } catch (error) {
    console.error("Update Lead Error:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}
