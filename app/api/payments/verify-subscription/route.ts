import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
      await req.json();

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify Razorpay subscription signature
    // HMAC-SHA256(payment_id + "|" + subscription_id, key_secret)
    const secret = (process.env.RAZORPAY_KEY_SECRET || "").replace(/^["']|["']$/g, "");
    const generated = crypto
      .createHmac("sha256", secret)
      .update(razorpay_payment_id + "|" + razorpay_subscription_id)
      .digest("hex");

    if (generated !== razorpay_signature) {
      console.error("[Verify Subscription] Signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await connectDB();
    const org = await Organization.findOne({
      ownerId: session.user.email.toLowerCase(),
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Save subscription details & switch to AutoPay
    org.subscription.autoRenew = true;
    org.subscription.razorpaySubscriptionId = razorpay_subscription_id;
    org.subscription.status = "active";

    // Extend currentPeriodEnd by 30 days from now
    const nextPeriodEnd = new Date();
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 30);
    org.subscription.currentPeriodEnd = nextPeriodEnd;

    await org.save();

    console.log(
      `[AutoPay Enabled] Org: ${org._id}, Sub: ${razorpay_subscription_id}`
    );

    return NextResponse.json({ success: true, message: "AutoPay enabled successfully!" });
  } catch (error: any) {
    console.error("Verify Subscription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
