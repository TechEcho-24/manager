import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "mock_cron_secret";
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const now = new Date();

    // 1. Activate paid trials whose 14-day trial has ended (they paid, so move to active)
    const activated = await Organization.updateMany(
      {
        "subscription.status": "trial",
        "subscription.trialEndsAt": { $lt: now },
        "subscription.currentPeriodEnd": { $exists: true, $ne: null }, // has a paid period set
      },
      {
        $set: { "subscription.status": "active" },
      }
    );

    // 2. Expire free trials (no payment made — no currentPeriodEnd)
    const expired = await Organization.updateMany(
      {
        "subscription.status": "trial",
        "subscription.trialEndsAt": { $lt: now },
        $or: [
          { "subscription.currentPeriodEnd": { $exists: false } },
          { "subscription.currentPeriodEnd": null },
        ],
      },
      {
        $set: { "subscription.status": "expired" },
      }
    );

    return NextResponse.json({
      success: true,
      activated: activated.modifiedCount,
      expired: expired.modifiedCount,
    });
  } catch (error: any) {
    console.error("Cron Check Trials Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

