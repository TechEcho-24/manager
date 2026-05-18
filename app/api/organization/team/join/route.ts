import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user";
import { Invitation } from "@/models/invitation";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const invitation = await Invitation.findOne({ token, status: "pending" });
    if (!invitation) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
    }

    const org = await Organization.findById(invitation.organizationId);
    if (!org) {
      return NextResponse.json({ error: "Organization no longer exists" }, { status: 404 });
    }

    // Accept invite — mark onboarding as complete so invited users skip it
    const user = await User.findOne({ email: session.user.email });
    if (user) {
      // Migrate to multi-workspace array if needed
      if (user.organizationId && (!user.organizations || user.organizations.length === 0)) {
        user.organizations = [{
          organizationId: user.organizationId,
          orgRole: user.orgRole || "owner",
          joinedAt: new Date()
        }];
      }

      // Add new organization to array if not already present
      if (!user.organizations) user.organizations = [];
      const existingOrgIndex = user.organizations.findIndex(org => org.organizationId === invitation.organizationId);
      if (existingOrgIndex === -1) {
        user.organizations.push({
          organizationId: invitation.organizationId,
          orgRole: invitation.role,
          joinedAt: new Date()
        });
      } else {
        user.organizations[existingOrgIndex].orgRole = invitation.role;
      }

      // Set as active
      user.organizationId = invitation.organizationId;
      user.orgRole = invitation.role;
      user.onboardingCompleted = true;
      user.paymentCompleted = true;
      await user.save();
    }

    invitation.status = "accepted";
    await invitation.save();

    // If client role, link this user to the lead that generated the invite
    if (invitation.role === "client" && user) {
      try {
        const { Lead } = await import("@/models/lead");
        await Lead.updateOne(
          { clientInviteToken: token, organizationId: invitation.organizationId },
          { $set: { clientUserId: user._id.toString() } }
        );
      } catch (linkErr) {
        console.error("Failed to link client user to lead:", linkErr);
      }
    }

    return NextResponse.json({ success: true, organizationId: invitation.organizationId, role: invitation.role });
  } catch (error: any) {
    console.error("POST Join API Error:", error);
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
  }
}
