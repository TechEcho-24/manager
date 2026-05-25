import { format } from "date-fns";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { getLedgerSummary, materializeLedgerCycles } from "@/lib/deal-payment-ledger";
import { sendEmail } from "@/lib/email";
import { DealPaymentLedger } from "@/models/deal-payment-ledger";
import { Lead } from "@/models/lead";
import { Organization } from "@/models/organization";

export const dynamic = "force-dynamic";

type SessionUser = {
  id?: string;
  role?: string;
  orgRole?: string;
  organizationId?: string;
  name?: string | null;
};

type ReminderRequest = {
  cycleKey?: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function money(amount = 0) {
  return `INR ${Math.round(amount).toLocaleString("en-IN")}`;
}

function appUrl(path: string) {
  const baseUrl = (process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${baseUrl}${path}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as ReminderRequest;
    const lead = await Lead.findById(id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const isAdmin = user.role === "admin";
    const sameOrg = Boolean(user.organizationId && lead.organizationId === user.organizationId);
    if (!isAdmin && (!sameOrg || user.orgRole === "client")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: "Lead does not have an email address." }, { status: 400 });
    }

    const ledger = await DealPaymentLedger.findOne({ leadId: lead._id.toString() });
    if (!ledger) {
      return NextResponse.json({ error: "No payment ledger found for this lead." }, { status: 404 });
    }

    const changed = materializeLedgerCycles(ledger);
    const summary = getLedgerSummary(ledger);
    const cycle = body.cycleKey
      ? ledger.cycles.find((item) => item.cycleKey === body.cycleKey)
      : summary.nextDueCycle;

    if (!cycle || cycle.remainingBalance <= 0) {
      return NextResponse.json({ error: "No pending payment cycle found for reminder." }, { status: 400 });
    }

    const organization = await Organization.findById(lead.organizationId).select("name");
    const senderName =
      organization?.name?.trim() ||
      process.env.RESEND_FROM_NAME?.trim() ||
      "Pinglly CRM";
    const dueDate = new Date(cycle.dueDate);
    const paymentUrl = appUrl("/payments");
    const subject = `Payment reminder for ${lead.fullName} - ${cycle.monthLabel}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <p>Hi ${escapeHtml(lead.fullName)},</p>
        <p>This is a reminder for your pending payment for ${escapeHtml(cycle.monthLabel)}.</p>
        <table style="border-collapse: collapse; margin: 18px 0; min-width: 280px;">
          <tr><td style="padding: 8px 12px; border: 1px solid #e5e7eb;">Due date</td><td style="padding: 8px 12px; border: 1px solid #e5e7eb;"><strong>${escapeHtml(format(dueDate, "dd MMM yyyy"))}</strong></td></tr>
          <tr><td style="padding: 8px 12px; border: 1px solid #e5e7eb;">Total due</td><td style="padding: 8px 12px; border: 1px solid #e5e7eb;"><strong>${escapeHtml(money(cycle.totalDue))}</strong></td></tr>
          <tr><td style="padding: 8px 12px; border: 1px solid #e5e7eb;">Remaining balance</td><td style="padding: 8px 12px; border: 1px solid #e5e7eb;"><strong>${escapeHtml(money(cycle.remainingBalance))}</strong></td></tr>
        </table>
        <p>You can view the payment ledger here: <a href="${escapeHtml(paymentUrl)}">${escapeHtml(paymentUrl)}</a></p>
        <p>Regards,<br />${escapeHtml(senderName)}</p>
        <p style="border-top: 1px solid #e5e7eb; margin-top: 28px; padding-top: 14px; color: #6b7280; font-size: 12px;">
          Powered by <strong style="color: #4f46e5;">Pinglly</strong>
        </p>
      </div>
    `;
    const text = [
      `Hi ${lead.fullName},`,
      "",
      `This is a reminder for your pending payment for ${cycle.monthLabel}.`,
      `Due date: ${format(dueDate, "dd MMM yyyy")}`,
      `Total due: ${money(cycle.totalDue)}`,
      `Remaining balance: ${money(cycle.remainingBalance)}`,
      "",
      `View payment ledger: ${paymentUrl}`,
      "",
      `Regards,`,
      senderName,
      "",
      "Powered by Pinglly",
    ].join("\n");

    const result = await sendEmail({
      to: [lead.email],
      subject,
      html,
      text,
      fromName: senderName,
      idempotencyKey: `lead-payment-reminder/${lead._id.toString()}/${cycle.cycleKey}`,
      tags: [
        { name: "category", value: "payment_reminder" },
        { name: "lead_id", value: lead._id.toString().slice(0, 256) },
      ],
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.message, name: result.name }, { status: 502 });
    }

    cycle.reminderSentAt = new Date();
    ledger.markModified("cycles");
    lead.activityTimeline.push({
      action: "Payment reminder sent",
      description: `${cycle.monthLabel} payment reminder emailed to ${lead.email}`,
      createdAt: new Date(),
      createdBy: user.name || session.user.email || "System",
    });

    await Promise.all([ledger.save(), lead.save()]);

    return NextResponse.json({
      success: true,
      emailId: result.id,
      cycleKey: cycle.cycleKey,
      reminderSentAt: cycle.reminderSentAt,
      materializedCycles: changed,
    });
  } catch (error) {
    console.error("Payment Reminder Email Error:", error);
    return NextResponse.json({ error: "Failed to send payment reminder" }, { status: 500 });
  }
}
