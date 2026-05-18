import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";
import { User } from "@/models/user";
import { auth } from "@/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const org = await Organization.findOne({ ownerId: session.user.email.toLowerCase() });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (org.subscription.status !== "trial") {
      return NextResponse.json({ error: "You are not currently on a trial." }, { status: 400 });
    }

    // Cancel the trial — revert to starter / cancelled
    org.plan = "starter";
    org.subscription.status = "cancelled";
    org.subscription.trialEndsAt = undefined;
    org.subscription.currentPeriodEnd = undefined;
    org.subscription.autoRenew = false;
    await org.save();

    // Revert paymentCompleted on user so they can re-purchase
    await User.findOneAndUpdate(
      { email: session.user.email.toLowerCase() },
      { $set: { paymentCompleted: false } }
    );

    return NextResponse.json({ success: true, message: "Trial cancelled successfully." });
  } catch (error: any) {
    console.error("Cancel Trial Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
