import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    // Verify webhook signature
    if (secret && secret !== "your_webhook_secret_here") {
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (expectedSig !== signature) {
        console.error("[Webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event as string;
    const subPayload = event.payload?.subscription?.entity;

    if (!subPayload) {
      return NextResponse.json({ received: true });
    }

    await connectDB();

    const subscriptionId = subPayload.id as string;
    let org = await Organization.findOne({
      "subscription.razorpaySubscriptionId": subscriptionId,
    });

    if (!org) {
      const orgId = subPayload.notes?.organizationId;
      if (orgId) org = await Organization.findById(orgId);
    }

    if (!org) {
      console.warn(`[Webhook] No org found for subscription: ${subscriptionId}`);
      return NextResponse.json({ received: true });
    }

    switch (eventType) {
      case "subscription.charged": {
        const nextPeriodEnd = new Date();
        nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 30);
        org.subscription.status = "active";
        org.subscription.currentPeriodEnd = nextPeriodEnd;
        org.subscription.razorpaySubscriptionId = subscriptionId;
        org.subscription.autoRenew = true;
        await org.save();
        console.log(`[Webhook] subscription.charged → Org ${org._id} renewed`);
        break;
      }
      case "subscription.cancelled": {
        org.subscription.autoRenew = false;
        org.subscription.razorpaySubscriptionId = undefined;
        await org.save();
        console.log(`[Webhook] subscription.cancelled → Org ${org._id}`);
        break;
      }
      case "subscription.halted": {
        org.subscription.status = "past_due";
        org.subscription.autoRenew = false;
        await org.save();
        console.log(`[Webhook] subscription.halted → Org ${org._id} past_due`);
        break;
      }
      case "subscription.completed": {
        org.subscription.status = "expired";
        org.subscription.autoRenew = false;
        await org.save();
        console.log(`[Webhook] subscription.completed → Org ${org._id}`);
        break;
      }
      default:
        console.log(`[Webhook] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Razorpay Webhook] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
