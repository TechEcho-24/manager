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

    const result = await Organization.updateMany(
      { 
        "subscription.status": "active",
        "subscription.currentPeriodEnd": { $lt: now } 
      },
      { 
        $set: { "subscription.status": "past_due" } 
      }
    );

    return NextResponse.json({ success: true, updatedCount: result.modifiedCount });
  } catch (error: any) {
    console.error("Cron Check Renewals Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
