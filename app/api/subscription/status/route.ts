import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const org = await Organization.findOne({ ownerId: session.user.email || session.user.id });
    
    if (!org) {
      return NextResponse.json({ status: "none" });
    }

    let daysLeft = 0;
    if (org.subscription.status === "trial" && org.subscription.trialEndsAt) {
      const diff = new Date(org.subscription.trialEndsAt).getTime() - new Date().getTime();
      daysLeft = Math.ceil(diff / (1000 * 3600 * 24));
    }

    return NextResponse.json({
      plan: org.plan,
      status: org.subscription.status,
      daysLeft: Math.max(0, daysLeft)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
