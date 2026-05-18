import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";
import { User } from "@/models/user";
import { Invitation } from "@/models/invitation";
import { auth } from "@/auth";
import crypto from "crypto";

const PLAN_LIMITS = {
  starter: 2, // owner + 1
  growth: 6, // owner + 5
  pro: 999999, // unlimited
  enterprise: 999999,
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    const orgRole = (session?.user as any)?.orgRole || "owner";
    const orgId = (session?.user as any)?.organizationId;

    if (!session?.user || !orgId || (orgRole !== "owner" && orgRole !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const role = data.role === "staff" ? "staff" : data.role === "client" ? "client" : "member";

    const org = await Organization.findById(orgId);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check Plan Limits
    const currentMemberCount = await User.countDocuments({ organizationId: orgId });
    const pendingInvitesCount = await Invitation.countDocuments({ organizationId: orgId, status: "pending" });
    const totalCount = currentMemberCount + pendingInvitesCount;

    const plan = org.plan as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;

    if (totalCount >= limit) {
      return NextResponse.json({ 
        error: `Plan limit reached. Your ${plan} plan allows up to ${limit} total members (including pending invites). Please upgrade your plan.`
      }, { status: 403 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // valid for 7 days

    const invitation = await Invitation.create({
      organizationId: orgId,
      token,
      role,
      expiresAt,
    });

    // In a real app we'd email the link if data.email is provided.
    // We just return it for the user to copy.
    const inviteLink = `${process.env.AUTH_URL || "http://localhost:3000"}/invite/${token}`;

    return NextResponse.json({ success: true, link: inviteLink });
  } catch (error: any) {
    console.error("POST Invite API Error:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
