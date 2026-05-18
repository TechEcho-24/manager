import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Notification } from "@/models/notification";
import { Lead } from "@/models/lead";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find user's organization
    const org = await Organization.findOne({
      ownerId: session.user.email.toLowerCase(),
    }).lean();

    if (!org) {
      return NextResponse.json({ created: 0, message: "No org found" });
    }

    const orgId = (org as any)._id.toString();
    const userId = session.user.id || session.user.email;

    // Today's date range (IST-aware: midnight to midnight)
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Check if already generated today
    const alreadyGenerated = await Notification.findOne({
      userId,
      organizationId: orgId,
      type: "followup",
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    if (alreadyGenerated) {
      return NextResponse.json({ created: 0, message: "Already generated today" });
    }

    // Find all leads with nextFollowupDate = today
    const leadsToday = await Lead.find({
      organizationId: orgId,
      nextFollowupDate: { $gte: todayStart, $lte: todayEnd },
    })
      .select("_id fullName phone status")
      .lean();

    if (leadsToday.length === 0) {
      return NextResponse.json({ created: 0, message: "No follow-ups today" });
    }

    // Stagger: first at 8 AM today, then +5 min per lead
    const eightAM = new Date(todayStart);
    eightAM.setHours(8, 0, 0, 0);
    const baseTime = now > eightAM ? now : eightAM;

    const notifs = leadsToday.map((lead: any, idx: number) => ({
      userId,
      organizationId: orgId,
      type: "followup",
      title: `📞 Follow-up: ${lead.fullName}`,
      message: `Aaj ${lead.fullName} ka follow-up scheduled hai. Status: ${lead.status}.`,
      leadId: lead._id.toString(),
      leadName: lead.fullName,
      isRead: false,
      displayAfter: new Date(baseTime.getTime() + idx * 5 * 60 * 1000), // +5min each
    }));

    await Notification.insertMany(notifs);

    return NextResponse.json({
      created: notifs.length,
      message: `${notifs.length} follow-up notifications generated`,
    });
  } catch (err: any) {
    console.error("Generate Notifications Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
