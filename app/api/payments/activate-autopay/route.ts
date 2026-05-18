import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

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

    // ─── 1. Immediately mark autoRenew = true in DB ───────────────────────────
    // (₹1 verification already confirmed payment method)
    org.subscription.autoRenew = true;
    org.subscription.status = org.subscription.status === "trial" ? "trial" : "active";

    // Keep existing currentPeriodEnd (next billing date = when current plan expires)
    // If no period end set, default to 30 days from now
    if (!org.subscription.currentPeriodEnd) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 30);
      org.subscription.currentPeriodEnd = fallback;
    }

    const nextBillingDate = org.subscription.currentPeriodEnd;

    // ─── 2. Try to create Razorpay subscription (best effort) ─────────────────
    let subscriptionId: string | null = null;
    try {
      const keyId = (process.env.RAZORPAY_KEY_ID || "").replace(/^["']|["']$/g, "");
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").replace(/^["']|["']$/g, "");

      if (keyId && keySecret) {
        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const planKey = (org.plan || "starter").toLowerCase();
        const planId = PLAN_IDS[planKey];

        if (planId) {
          const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: 120,
            quantity: 1,
            customer_notify: 1,
            notes: {
              organizationId: org._id.toString(),
              plan: planKey,
              email: session.user.email,
            },
          });
          subscriptionId = subscription.id;
          org.subscription.razorpaySubscriptionId = subscriptionId;
          console.log(`[AutoPay] Subscription created: ${subscriptionId}`);
        }
      }
    } catch (subErr: any) {
      // Non-fatal: autoRenew is already true, subscription creation failed
      console.error("[AutoPay] Subscription creation failed (non-fatal):", subErr.message);
    }

    await org.save();

    console.log(`[AutoPay Activated] Org: ${org._id}, nextBilling: ${nextBillingDate}`);

    return NextResponse.json({
      success: true,
      subscriptionId,
      nextBillingDate: nextBillingDate?.toISOString() || null,
      message: "AutoPay activated successfully",
    });
  } catch (error: any) {
    console.error("Activate AutoPay Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
