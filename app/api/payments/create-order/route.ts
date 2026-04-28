import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db";
import { Payment } from "@/models/payment";
import { auth } from "@/auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, planName, organizationId } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Missing amount" }, { status: 400 });
    }

    await connectDB();

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      organizationId: organizationId || "pending", // pending until onboarding
      userId: session.user.id || session.user.email || "unknown",
      planName: planName || "unknown",
      amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "created",
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount });
  } catch (error: any) {
    console.error("Create Order Error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
