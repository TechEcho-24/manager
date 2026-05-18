import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Lead } from "@/models/lead";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

type DealInstallmentPayload = {
  amount?: number | string;
  dueDate?: string | Date;
  status?: "pending" | "paid";
};

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

    // Include invite link if token exists
    let clientInviteLink: string | undefined;
    if (lead.clientInviteToken) {
      const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
      clientInviteLink = `${baseUrl}/invite/${lead.clientInviteToken}`;
    }

    return NextResponse.json({ ...lead, id: lead._id.toString(), _id: undefined, clientInviteLink });
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
    const session = await auth();
    const organizationId = (session?.user as any)?.organizationId;
    const { id } = await params;
    const data = await request.json();

    if (data.dealDetails) {
      const installments = Array.isArray(data.dealDetails.installments)
        ? data.dealDetails.installments
        : [];

      data.dealDetails = {
        ...data.dealDetails,
        totalValue: Number(data.dealDetails.totalValue) || 0,
        receivedAmount: Number(data.dealDetails.receivedAmount) || 0,
        installments: installments.map((installment: DealInstallmentPayload) => ({
          ...installment,
          amount: Number(installment.amount) || 0,
          dueDate: installment.dueDate ? new Date(installment.dueDate) : new Date(),
          status: installment.status === "paid" ? "paid" : "pending",
        })),
      };
    }
    
    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Determine what changed for the timeline
    const changes: string[] = [];
    const isNewlyConverted = data.status === "Converted (Won)" && lead.status !== "Converted (Won)";
    if (data.status && data.status !== lead.status) {
      changes.push(`Status changed to ${data.status}`);
      if (data.status === "Converted (Won)") changes.push("Deal closed! Financial tracking enabled.");
    }
    if (data.priority && data.priority !== lead.priority) changes.push(`Priority changed to ${data.priority}`);
    if (data.assignedTo && data.assignedTo !== lead.assignedTo) changes.push(`Reassigned to ${data.assignedTo}`);
    
    // Financial tracking
    if (data.dealDetails && JSON.stringify(data.dealDetails) !== JSON.stringify(lead.dealDetails)) {
       changes.push("Financial details or payment plan updated");
    }
    
    const description = changes.length > 0 ? changes.join(", ") : "Lead details updated";

    // Update fields
    lead.set(data);
    
    // Explicitly handle dealDetails if it's in the data to ensure Mongoose marks it as modified
    if (data.dealDetails) {
      lead.markModified('dealDetails');
    }
    
    // Auto-generate client invite when status changes to Converted (Won)
    let clientInviteLink: string | undefined;
    if (isNewlyConverted && organizationId && !lead.clientInviteToken) {
      const { Invitation } = await import("@/models/invitation");
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await Invitation.create({
        organizationId,
        token,
        role: "client",
        expiresAt,
      });

      lead.clientInviteToken = token;
      const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
      clientInviteLink = `${baseUrl}/invite/${token}`;
      changes.push("Client invite link generated");
    } else if (lead.clientInviteToken) {
      const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
      clientInviteLink = `${baseUrl}/invite/${lead.clientInviteToken}`;
    }

    // Add activity if requested or if something meaningful changed
    if (changes.length > 0 || data.forceActivityLog) {
      lead.activityTimeline.push({
        action: "Lead updated",
        description: data.activityDescription || description,
        createdAt: new Date(),
        createdBy: session?.user?.name || "System",
      });
    }

    await lead.save();

    return NextResponse.json({ 
      message: "Lead updated successfully", 
      lead: { ...lead.toObject(), id: lead._id.toString() },
      clientInviteLink,
    });
  } catch (error) {
    console.error("Update Lead Error:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

