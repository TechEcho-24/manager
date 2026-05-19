import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { Lead } from "@/models/lead";
import { DealPaymentLedger } from "@/models/deal-payment-ledger";
import { applyPaymentToLedger } from "@/lib/deal-payment-ledger";

export const dynamic = "force-dynamic";

const methods = ["UPI", "Bank Transfer", "Cash", "Card", "Cheque", "Other"] as const;
type PaymentMethod = typeof methods[number];
type SessionUser = {
  role?: string;
  organizationId?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = session.user as SessionUser;
    const data = await request.json();
    const lead = await Lead.findById(id);

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const isAdmin = user.role === "admin";
    const sameOrg = user.organizationId && lead.organizationId === user.organizationId;
    if (!isAdmin && !sameOrg) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const ledger = await DealPaymentLedger.findOne({ leadId: lead._id.toString() });
    if (!ledger) return NextResponse.json({ error: "Payment ledger not found" }, { status: 404 });

    const amount = Math.max(Number(data.amount) || 0, 0);
    if (amount <= 0) return NextResponse.json({ error: "Payment amount must be greater than zero" }, { status: 400 });

    const method: PaymentMethod = methods.includes(data.method) ? data.method : "UPI";
    const paidAt = data.paidAt ? new Date(data.paidAt) : new Date();
    const allocations = applyPaymentToLedger(ledger, {
      amount,
      paidAt,
      method,
      notes: data.notes || undefined,
      screenshotUrl: data.screenshotUrl || undefined,
      screenshotPublicId: data.screenshotPublicId || undefined,
    });

    lead.dealDetails = {
      ...(lead.dealDetails || {}),
      receivedAmount: (lead.dealDetails?.receivedAmount || 0) + amount,
      installments: lead.dealDetails?.installments || [],
    };
    lead.markModified("dealDetails");
    lead.activityTimeline.push({
      action: "Payment received",
      description: `₹${amount.toLocaleString("en-IN")} received via ${method}`,
      createdAt: new Date(),
      createdBy: session.user.name || "System",
    });

    await Promise.all([ledger.save(), lead.save()]);

    return NextResponse.json({ success: true, allocations });
  } catch (error) {
    console.error("Payment Ledger Add Payment Error:", error);
    return NextResponse.json({ error: "Failed to add payment" }, { status: 500 });
  }
}
