import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";
import { Payment } from "@/models/payment";
import { User } from "@/models/user";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    await connectDB();
    const data = await req.json();

    // Use session email or fallback to secondaryEmail from form
    const email = session?.user?.email?.toLowerCase().trim() || data.secondaryEmail?.toLowerCase().trim();
    
    if (!email) {
      return NextResponse.json({ success: true, message: "Onboarding details recorded (mock)" });
    }

    // Check if user has a paid payment
    const payment = await Payment.findOne({ 
      userId: session?.user?.id || email, 
      status: "paid" 
    }).sort({ createdAt: -1 });

    const companyName = data.companyName || "My Organization";

    let org = await Organization.findOne({ ownerId: email });
    if (!org) {
      org = await Organization.create({
        name: companyName,
        email: email,
        phone: data.phone || "000",
        ownerId: email,
        plan: payment ? "pro" : "free", // simplified plan logic
        subscription: { 
          status: payment ? "active" : "trial",
          currentPeriodEnd: payment ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined
        },
      });
      // if there was a payment with a temp org id, update it
      if (payment && payment.organizationId === "temp_org_id") {
        payment.organizationId = String(org._id);
        await payment.save();
      }
    } else {
      org.name = companyName;
      if (payment) {
        org.plan = "pro";
        org.subscription.status = "active";
      }
      await org.save();
    }

    // Mark user onboarding complete
    if (session?.user?.email) {
      await User.updateOne(
        { email: session.user.email },
        { $set: { onboardingCompleted: true } }
      );
    } else {
      await User.updateOne(
        { email },
        { $set: { onboardingCompleted: true } }
      );
    }

    return NextResponse.json({ success: true, organizationId: org._id });
  } catch (error: any) {
    console.error("Onboarding API Error:", error);
    return NextResponse.json({ error: "Failed to finalize onboarding" }, { status: 500 });
  }
}