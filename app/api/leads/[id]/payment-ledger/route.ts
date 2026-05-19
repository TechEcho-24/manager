import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { auth } from "@/auth";
import { Lead } from "@/models/lead";
import { DealPaymentLedger } from "@/models/deal-payment-ledger";
import { getLedgerSummary, materializeLedgerCycles } from "@/lib/deal-payment-ledger";

export const dynamic = "force-dynamic";

type SessionUser = {
  id?: string;
  role?: string;
  orgRole?: string;
  organizationId?: string;
};

type LeadLike = {
  _id: { toString: () => string };
  organizationId: string;
  clientUserId?: string;
  createdAt?: Date;
  dealDetails?: {
    paymentPlan?: string;
    totalValue?: number;
    monthlyStartDate?: Date;
    paymentDate?: Date;
    monthlyPaymentDate?: number;
  };
};

function serializeLedger(ledger: Awaited<ReturnType<typeof DealPaymentLedger.findOne>>) {
  if (!ledger) return null;
  const summary = getLedgerSummary(ledger);
  return {
    id: ledger._id.toString(),
    leadId: ledger.leadId,
    organizationId: ledger.organizationId,
    plan: ledger.plan,
    cycles: ledger.cycles,
    payments: ledger.payments,
    advanceBalance: ledger.advanceBalance || 0,
    summary,
  };
}

async function findAuthorizedLead(id: string) {
  const session = await auth();
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const user = session.user as SessionUser;
  const lead = await Lead.findById(id);
  if (!lead) return { error: NextResponse.json({ error: "Lead not found" }, { status: 404 }) };

  const isAdmin = user.role === "admin";
  const sameOrg = user.organizationId && lead.organizationId === user.organizationId;
  const linkedClient = user.orgRole === "client" && lead.clientUserId === user.id;

  if (!isAdmin && !sameOrg && !linkedClient) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { lead, session };
}

async function ensureLedgerForLead(lead: LeadLike) {
  let ledger = await DealPaymentLedger.findOne({ leadId: lead._id.toString() });
  if (ledger) return ledger;

  const dealDetails = lead.dealDetails || {};
  if (dealDetails.paymentPlan !== "monthly") return null;

  const monthlyAmount = Number(dealDetails.totalValue || 0);
  if (monthlyAmount <= 0) return null;
  const startDate = dealDetails.monthlyStartDate || dealDetails.paymentDate || lead.createdAt || new Date();
  const billingDay = Number(dealDetails.monthlyPaymentDate || new Date(startDate).getDate() || 1);

  ledger = await DealPaymentLedger.create({
    leadId: lead._id.toString(),
    organizationId: lead.organizationId,
    clientUserId: lead.clientUserId,
    plan: {
      planType: "monthly",
      monthlyAmount,
      billingDay,
      startDate,
      totalDealValue: Number(dealDetails.totalValue || 0),
      currency: "INR",
      active: true,
    },
    cycles: [],
    payments: [],
    advanceBalance: 0,
  });

  return ledger;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { id } = await params;
    const result = await findAuthorizedLead(id);
    if (result.error) return result.error;

    const ledger = await ensureLedgerForLead(result.lead);
    if (!ledger) {
      return NextResponse.json({
        found: false,
        message: "No monthly payment ledger exists for this deal.",
      });
    }

    if (result.lead.clientUserId && ledger.clientUserId !== result.lead.clientUserId) {
      ledger.clientUserId = result.lead.clientUserId;
    }

    const changed = materializeLedgerCycles(ledger);
    if (changed || ledger.isModified("clientUserId")) await ledger.save();

    return NextResponse.json({ found: true, ledger: serializeLedger(ledger) });
  } catch (error) {
    console.error("Payment Ledger GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch payment ledger" }, { status: 500 });
  }
}
