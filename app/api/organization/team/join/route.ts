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
      user.organizationId = invitation.organizationId;
      user.orgRole = invitation.role;
      user.onboardingCompleted = true;
      user.paymentCompleted = true;
      await user.save();
    }

    invitation.status = "accepted";
    await invitation.save();

    return NextResponse.json({ success: true, organizationId: invitation.organizationId, role: invitation.role });
  } catch (error: any) {
    console.error("POST Join API Error:", error);
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
  }
}
