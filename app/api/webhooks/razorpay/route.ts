import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import { Payment } from "@/models/payment";
import { Organization } from "@/models/organization";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";

    if (!signature) {
      return NextResponse.json({ error: "No signature found" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    await connectDB();

    switch (event.event) {
      case "payment.captured": {
        const paymentData = event.payload.payment.entity;
        const orderId = paymentData.order_id;
        
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment && payment.status !== "paid") {
          payment.status = "paid";
          payment.razorpayPaymentId = paymentData.id;
          await payment.save();
          
          const org = await Organization.findById(payment.organizationId);
          if (org) {
            org.subscription.status = "active";
            const newEnd = new Date();
            newEnd.setMonth(newEnd.getMonth() + 1);
            org.subscription.currentPeriodEnd = newEnd;
            await org.save();
          }
        }
        break;
      }
      
      case "payment.failed": {
        const paymentData = event.payload.payment.entity;
        const payment = await Payment.findOne({ razorpayOrderId: paymentData.order_id });
        if (payment) {
          payment.status = "failed";
          await payment.save();
        }
        break;
      }
      
      case "refund.processed": {
        const refundData = event.payload.refund.entity;
        const paymentId = refundData.payment_id;
        const payment = await Payment.findOne({ razorpayPaymentId: paymentId });
        if (payment) {
          payment.status = "refunded";
          await payment.save();
          
          const org = await Organization.findById(payment.organizationId);
          if (org) {
            org.subscription.status = "cancelled";
            org.plan = "free";
            await org.save();
          }
        }
        break;
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
