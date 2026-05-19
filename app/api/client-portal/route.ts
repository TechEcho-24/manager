import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Lead } from "@/models/lead";
import { auth } from "@/auth";
import { DealPaymentLedger } from "@/models/deal-payment-ledger";
import { getLedgerSummary, materializeLedgerCycles } from "@/lib/deal-payment-ledger";

export const dynamic = "force-dynamic";

type ClientSessionUser = {
  id?: string;
  orgRole?: string;
  organizationId?: string;
};

type PortalInstallment = {
  amount: number;
  dueDate: string | Date;
  status: "pending" | "paid";
  paidAt?: string | Date;
};

// GET: Fetch client portal data for the currently logged-in client user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = session.user as ClientSessionUser;
    const orgRole = sessionUser.orgRole;
    if (orgRole !== "client") {
      return NextResponse.json({ error: "Not a client user" }, { status: 403 });
    }

    await dbConnect();

    const userId = sessionUser.id;
    const organizationId = sessionUser.organizationId;

    if (!userId || !organizationId) {
      return NextResponse.json({ error: "Missing user context" }, { status: 400 });
    }

    // Find the lead that this client user is linked to
    const lead = await Lead.findOne({
      organizationId,
      clientUserId: userId,
      status: "Converted (Won)",
    }).lean();

    if (!lead) {
      return NextResponse.json({
        found: false,
        message: "No linked deal found for your account.",
      });
    }

    const dealDetails = lead.dealDetails || {
      totalValue: 0,
      receivedAmount: 0,
      paymentPlan: "one-time",
      installments: [],
    };

    const totalValue = dealDetails.totalValue || 0;
    const receivedAmount = dealDetails.receivedAmount || 0;
    const balanceRemaining = Math.max(totalValue - receivedAmount, 0);
    const paymentPlan = dealDetails.paymentPlan || "one-time";
    const monthlyPaymentDate = dealDetails.monthlyPaymentDate;
    const installments = ((dealDetails.installments || []) as PortalInstallment[]).map((inst) => ({
      amount: inst.amount,
      dueDate: inst.dueDate,
      status: inst.status,
      paidAt: inst.paidAt,
    }));

    let ledger = await DealPaymentLedger.findOne({ leadId: lead._id.toString() });
    const monthlyAmount = Number(totalValue || 0);
    if (!ledger && paymentPlan === "monthly" && monthlyAmount > 0) {
      const startDate = dealDetails.monthlyStartDate || dealDetails.paymentDate || lead.createdAt || new Date();
      ledger = await DealPaymentLedger.create({
        leadId: lead._id.toString(),
        organizationId,
        clientUserId: userId,
        plan: {
          planType: "monthly",
          monthlyAmount,
          billingDay: Number(monthlyPaymentDate || new Date(startDate).getDate() || 1),
          startDate,
          totalDealValue: Number(totalValue || 0),
          currency: "INR",
          active: true,
        },
        cycles: [],
        payments: [],
        advanceBalance: 0,
      });
    }
    let ledgerPayment: Record<string, unknown> | null = null;
    if (ledger) {
      const changed = materializeLedgerCycles(ledger);
      if (changed) await ledger.save();
      const summary = getLedgerSummary(ledger);
      ledgerPayment = {
        source: "ledger",
        totalValue: summary.totalDealValue,
        receivedAmount: summary.totalReceived,
        balanceRemaining: summary.outstandingBalance,
        progressPercent: summary.progressPercent,
        advanceBalance: summary.advanceBalance,
        nextDue: summary.nextDueCycle
          ? {
            amount: summary.nextDueCycle.remainingBalance,
            dueDate: summary.nextDueCycle.dueDate,
            monthLabel: summary.nextDueCycle.monthLabel,
            status: summary.nextDueCycle.status,
            previousDue: summary.nextDueCycle.previousDue,
            currentMonthAmount: summary.nextDueCycle.expectedAmount,
            totalDue: summary.nextDueCycle.totalDue,
          }
          : null,
        lastPayment: summary.lastPayment
          ? {
            amount: summary.lastPayment.amount,
            paidAt: summary.lastPayment.paidAt,
            method: summary.lastPayment.method,
          }
          : null,
        previousCarryForward: summary.previousCarryForward,
        nextDueBreakdown: summary.nextDueBreakdown,
        pendingBreakdown: summary.pendingBreakdown,
        status:
          summary.outstandingBalance <= 0
            ? "paid"
            : summary.nextDueCycle?.status === "overdue"
              ? "overdue"
              : "partial",
      };
    }

    // Calculate payment alerts
    const now = new Date();
    const alerts: { type: "warning" | "danger" | "info"; message: string }[] = [];

    if (paymentPlan === "monthly" && monthlyPaymentDate) {
      const currentDate = now.getDate();
      const daysUntilPayment = monthlyPaymentDate >= currentDate 
        ? monthlyPaymentDate - currentDate 
        : (30 - currentDate) + monthlyPaymentDate; // Approximate
      
      if (daysUntilPayment <= 7 && balanceRemaining > 0) {
        alerts.push({
          type: daysUntilPayment <= 0 ? "danger" : "warning",
          message: daysUntilPayment <= 0
            ? `Your monthly payment is due today (₹${balanceRemaining.toLocaleString()})`
            : `Your monthly payment is due in ${daysUntilPayment} day${daysUntilPayment !== 1 ? "s" : ""} on the ${monthlyPaymentDate}${getOrdinalSuffix(monthlyPaymentDate)}`,
        });
      }
    }

    if (paymentPlan === "milestones") {
      const pendingInstallments = installments.filter((inst) => inst.status === "pending");
      for (const inst of pendingInstallments) {
        const dueDate = new Date(inst.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          alerts.push({
            type: "danger",
            message: `Payment of ₹${inst.amount.toLocaleString()} was due on ${dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} — overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`,
          });
        } else if (diffDays <= 7) {
          alerts.push({
            type: "warning",
            message: `Payment of ₹${inst.amount.toLocaleString()} is due ${diffDays === 0 ? "today" : `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`} on ${dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
          });
        }
      }
    }

    if (paymentPlan === "one-time" && balanceRemaining > 0) {
      alerts.push({
        type: "info",
        message: `Outstanding balance: ₹${balanceRemaining.toLocaleString()}`,
      });
    }

    return NextResponse.json({
      found: true,
      leadName: lead.fullName,
      company: lead.company,
      contractDocument: lead.contractDocument || null,
      payment: {
        totalValue,
        receivedAmount,
        balanceRemaining,
        paymentPlan,
        monthlyPaymentDate,
        paymentDate: dealDetails.paymentDate,
        installments,
        ...(ledgerPayment || {}),
      },
      alerts,
    });
  } catch (error) {
    console.error("Client Portal API Error:", error);
    return NextResponse.json({ error: "Failed to fetch client portal data" }, { status: 500 });
  }
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
