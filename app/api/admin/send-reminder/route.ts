import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.email !== "techecho.kanpur@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId, clientName, clientEmail, plan } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId required" }, { status: 400 });
    }

    await dbConnect();

    await Organization.findByIdAndUpdate(organizationId, {
      $set: { lastReminderSent: new Date() },
    });

    // Log the reminder (future: send email via Resend / SendGrid)
    console.log(`[Renewal Reminder] Sent to: ${clientName} <${clientEmail}> | Plan: ${plan} | Time: ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `Reminder logged for ${clientName}`,
    });
  } catch (error: any) {
    console.error("Send Reminder Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
