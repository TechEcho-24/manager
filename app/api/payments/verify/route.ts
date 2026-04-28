import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import { Payment } from "@/models/payment";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } =
      await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Strip surrounding quotes that can be added when the env value is quoted in .env.local
    const secret = (process.env.RAZORPAY_KEY_SECRET || "").replace(/^["']|["']$/g, "");

    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is not set");
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 });
    }

    // Razorpay signature verification: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("[Razorpay Verify] Order ID:", razorpay_order_id);
    console.log("[Razorpay Verify] Payment ID:", razorpay_payment_id);
    console.log("[Razorpay Verify] Received signature:", razorpay_signature);
    console.log("[Razorpay Verify] Generated signature:", generated_signature);
    console.log("[Razorpay Verify] Secret length:", secret.length);
    console.log("[Razorpay Verify] Match:", generated_signature === razorpay_signature);

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature — payment verification failed" }, { status: 400 });
    }

    await connectDB();
    const session = await auth();

    // Find the payment record created during order creation
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    // Mark payment as paid
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "paid";
    if (planName) payment.planName = planName;
    await payment.save();

    // If an org already exists for this user, update its subscription
    // (Org may not exist yet at this point — onboarding creates it)
    if (session?.user?.email) {
      const org = await Organization.findOne({ ownerId: session.user.email.toLowerCase() });
      if (org) {
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        org.plan = planName?.toLowerCase().includes("enterprise") ? "enterprise" : "pro";
        org.subscription.status = "active";
        org.subscription.currentPeriodEnd = currentPeriodEnd;
        // Link payment to org
        payment.organizationId = org._id.toString();
        await Promise.all([org.save(), payment.save()]);
      }
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    console.error("Verify Payment Error:", error?.message || error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
