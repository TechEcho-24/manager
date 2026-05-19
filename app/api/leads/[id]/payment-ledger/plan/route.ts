import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { Lead } from "@/models/lead";
import { DealPaymentLedger } from "@/models/deal-payment-ledger";
import { materializeLedgerCycles } from "@/lib/deal-payment-ledger";

export const dynamic = "force-dynamic";

type SessionUser = {
  role?: string;
  organizationId?: string;
};

export async function PATCH(
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

    const billingDay = Math.min(Math.max(Number(data.billingDay) || 1, 1), 31);
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const totalDealValue = Math.max(Number(data.totalDealValue ?? lead.dealDetails?.totalValue) || 0, 0);
    const monthlyAmount = totalDealValue;
    const active = data.active !== false;

    if (monthlyAmount <= 0) {
      return NextResponse.json({ error: "Deal amount is required for recurring ledger." }, { status: 400 });
    }

    let ledger = await DealPaymentLedger.findOne({ leadId: lead._id.toString() });
    if (!ledger) {
      ledger = new DealPaymentLedger({
        leadId: lead._id.toString(),
        organizationId: lead.organizationId,
        clientUserId: lead.clientUserId,
        cycles: [],
        payments: [],
        advanceBalance: 0,
      });
    }

    ledger.plan = {
      planType: "monthly",
      monthlyAmount,
      billingDay,
      startDate,
      totalDealValue,
      currency: "INR",
      active,
    };
    ledger.organizationId = lead.organizationId;
    ledger.clientUserId = lead.clientUserId;
    materializeLedgerCycles(ledger);

    lead.dealDetails = {
      ...(lead.dealDetails || {}),
      totalValue: totalDealValue,
      receivedAmount: lead.dealDetails?.receivedAmount || 0,
      paymentPlan: "monthly",
      monthlyAmount,
      monthlyPaymentDate: billingDay,
      monthlyStartDate: startDate,
      installments: lead.dealDetails?.installments || [],
    };
    lead.markModified("dealDetails");
    lead.activityTimeline.push({
      action: "Payment plan updated",
      description: `Monthly ledger set to deal amount ₹${monthlyAmount.toLocaleString("en-IN")} due on day ${billingDay}`,
      createdAt: new Date(),
      createdBy: session.user.name || "System",
    });

    await Promise.all([ledger.save(), lead.save()]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment Ledger Plan Error:", error);
    return NextResponse.json({ error: "Failed to update payment plan" }, { status: 500 });
  }
}
