import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

const razorpay = new Razorpay({
  key_id: (process.env.RAZORPAY_KEY_ID || "").replace(/^["']|["']$/g, ""),
  key_secret: (process.env.RAZORPAY_KEY_SECRET || "").replace(/^["']|["']$/g, ""),
});

// Maps plan name → Razorpay Plan ID
const PLAN_IDS: Record<string, string> = {
  starter: process.env.RAZORPAY_PLAN_STARTER || "plan_SqlURsq5yl9kCi",
  growth: process.env.RAZORPAY_PLAN_GROWTH || "plan_SqlVST51N6vXs6",
  pro: process.env.RAZORPAY_PLAN_PRO || "plan_SqlW1bpduTV4aj",
  enterprise: process.env.RAZORPAY_PLAN_PRO || "plan_SqlW1bpduTV4aj",
};

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const org = await Organization.findOne({
      ownerId: session.user.email.toLowerCase(),
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const planKey = (org.plan || "starter").toLowerCase();
    const planId = PLAN_IDS[planKey];

    if (!planId) {
      return NextResponse.json({ error: "Invalid plan for subscription" }, { status: 400 });
    }

    // Create Razorpay Subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 120, // 10 years — effectively perpetual
      quantity: 1,
      customer_notify: 1,
      notes: {
        organizationId: org._id.toString(),
        plan: planKey,
        email: session.user.email,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      planId,
      plan: planKey,
    });
  } catch (error: any) {
    console.error("Create Subscription Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create subscription" }, { status: 500 });
  }
}
