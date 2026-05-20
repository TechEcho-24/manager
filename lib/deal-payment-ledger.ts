import { addMonths, endOfMonth, format, isAfter, isBefore, startOfMonth } from "date-fns";
import type {
  DealLedgerCycleStatus,
  IDealLedgerCycle,
  IDealPaymentAllocation,
  IDealPaymentLedger,
} from "@/models/deal-payment-ledger";

export type LedgerPaymentInput = {
  amount: number;
  paidAt: Date;
  method: "UPI" | "Bank Transfer" | "Cash" | "Card" | "Cheque" | "Other";
  notes?: string;
  screenshotUrl?: string;
  screenshotPublicId?: string;
};

export function getCycleKey(date: Date) {
  return format(date, "yyyy-MM");
}

function dueDateForMonth(date: Date, billingDay: number) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(monthStart);
  const clampedDay = Math.min(Math.max(billingDay, 1), monthEnd.getDate());
  return new Date(monthStart.getFullYear(), monthStart.getMonth(), clampedDay);
}

function statusForCycle(cycle: Pick<IDealLedgerCycle, "receivedAmount" | "remainingBalance" | "totalDue" | "dueDate" | "advanceApplied">, now: Date): DealLedgerCycleStatus {
  if (cycle.remainingBalance <= 0) {
    return cycle.advanceApplied > 0 && cycle.totalDue === 0 ? "advance" : "paid";
  }
  if (cycle.receivedAmount > 0) return "partial";
  if (isBefore(cycle.dueDate, startOfDay(now))) return "overdue";
  return "pending";
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function normalizeCycle(cycle: IDealLedgerCycle, now: Date) {
  cycle.remainingBalance = Math.max(cycle.totalDue - cycle.receivedAmount, 0);
  cycle.status = statusForCycle(cycle, now);
}

function laterMonth(a: Date, b: Date) {
  return isAfter(a, b) ? a : b;
}

export function materializeLedgerCycles(ledger: IDealPaymentLedger, now = new Date()) {
  const plan = ledger.plan;
  if (!plan?.active || !plan.totalDealValue || !plan.startDate) return false;

  let changed = false;
  const cycles = ledger.cycles || [];
  const existingKeys = new Set(cycles.map((cycle) => cycle.cycleKey));
  const startMonth = startOfMonth(new Date(plan.startDate));
  const currentMonth = startOfMonth(now);
  const nextDue = dueDateForMonth(currentMonth, plan.billingDay);
  let endMonth = isAfter(startOfDay(now), nextDue) ? startOfMonth(addMonths(currentMonth, 1)) : currentMonth;

  for (const cycle of cycles) {
    const oldStatus = cycle.status;
    normalizeCycle(cycle, now);
    if (oldStatus !== cycle.status) changed = true;
  }

  const latestCycle = [...cycles].sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())[0];
  if (latestCycle && latestCycle.remainingBalance <= 0) {
    const latestMonth = startOfMonth(new Date(latestCycle.dueDate));
    if (!isAfter(latestMonth, currentMonth)) {
      endMonth = laterMonth(endMonth, startOfMonth(addMonths(latestMonth, 1)));
    }
  }

  let cursor = cycles.length > 0
    ? startOfMonth(addMonths(new Date(cycles[cycles.length - 1].dueDate), 1))
    : startMonth;
  let carryForward = cycles.length > 0 ? Math.max(cycles[cycles.length - 1].remainingBalance, 0) : 0;
  let advanceBalance = Math.max(ledger.advanceBalance || 0, 0);

  while (!isAfter(cursor, endMonth)) {
    const cycleKey = getCycleKey(cursor);
    if (!existingKeys.has(cycleKey)) {
      const dueDate = dueDateForMonth(cursor, plan.billingDay);
      const expectedAmount = Math.max(plan.totalDealValue, 0);
      const grossDue = expectedAmount + carryForward;
      const advanceApplied = Math.min(advanceBalance, grossDue);
      const totalDue = Math.max(grossDue - advanceApplied, 0);
      const cycle: IDealLedgerCycle = {
        cycleKey,
        monthLabel: format(cursor, "MMMM yyyy"),
        dueDate,
        expectedAmount,
        previousDue: carryForward,
        advanceApplied,
        totalDue,
        receivedAmount: 0,
        remainingBalance: totalDue,
        status: "pending",
      };
      normalizeCycle(cycle, now);
      cycles.push(cycle);
      existingKeys.add(cycleKey);
      carryForward = cycle.remainingBalance;
      advanceBalance -= advanceApplied;
      changed = true;
    } else {
      const cycle = cycles.find((item) => item.cycleKey === cycleKey);
      carryForward = cycle ? Math.max(cycle.remainingBalance, 0) : carryForward;
    }
    cursor = startOfMonth(addMonths(cursor, 1));
  }

  if ((ledger.advanceBalance || 0) !== advanceBalance) {
    ledger.advanceBalance = advanceBalance;
    changed = true;
  }

  if (changed) ledger.markModified("cycles");
  return changed;
}

export function applyPaymentToLedger(ledger: IDealPaymentLedger, input: LedgerPaymentInput, now = new Date()) {
  materializeLedgerCycles(ledger, now);

  let remainingPayment = Math.max(Number(input.amount) || 0, 0);
  const allocations: IDealPaymentAllocation[] = [];
  const payableCycles = [...ledger.cycles]
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .filter((cycle) => cycle.remainingBalance > 0);

  for (const cycle of payableCycles) {
    if (remainingPayment <= 0) break;
    const allocated = Math.min(remainingPayment, cycle.remainingBalance);
    cycle.receivedAmount += allocated;
    cycle.remainingBalance = Math.max(cycle.totalDue - cycle.receivedAmount, 0);
    normalizeCycle(cycle, now);
    allocations.push({ cycleKey: cycle.cycleKey, amount: allocated });
    remainingPayment -= allocated;
  }

  if (remainingPayment > 0) {
    ledger.advanceBalance = Math.max(ledger.advanceBalance || 0, 0) + remainingPayment;
  }

  ledger.payments.push({
    amount: input.amount,
    paidAt: input.paidAt,
    method: input.method,
    notes: input.notes,
    screenshotUrl: input.screenshotUrl,
    screenshotPublicId: input.screenshotPublicId,
    allocations,
  });

  materializeLedgerCycles(ledger, now);
  ledger.markModified("cycles");
  ledger.markModified("payments");
  return allocations;
}

export function getLedgerSummary(ledger: IDealPaymentLedger) {
  const totalDealValue = ledger.plan.totalDealValue || 0;
  const totalReceived = (ledger.payments || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
  // Sum only each cycle's own expectedAmount (not remainingBalance) to avoid
  // double-counting carry-forward. e.g. May ₹15k unpaid → carried into June's
  // totalDue, so summing remainingBalance would count it twice (₹15k + ₹30k = ₹45k).
  // Correct outstanding = total expected across all cycles − total received.
  const totalExpected = (ledger.cycles || []).reduce((sum, cycle) => sum + Math.max(cycle.expectedAmount || 0, 0), 0);
  const outstandingBalance = Math.max(totalExpected - totalReceived, 0);
  const nextDueCycle = (ledger.cycles || [])
    .filter((cycle) => cycle.remainingBalance > 0)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
  const lastPayment = [...(ledger.payments || [])].sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())[0];
  const previousCarryForward = nextDueCycle ? Math.max(nextDueCycle.previousDue || 0, 0) : 0;
  const nextDueBreakdown = nextDueCycle
    ? {
      previousDue: Math.max(nextDueCycle.previousDue || 0, 0),
      currentMonthAmount: Math.max(nextDueCycle.expectedAmount - nextDueCycle.advanceApplied, 0),
      totalDue: Math.max(nextDueCycle.totalDue || 0, 0),
    }
    : null;
  const pendingBreakdown = (ledger.cycles || [])
    .filter((cycle) => cycle.remainingBalance > 0)
    .map((cycle) => ({
      cycleKey: cycle.cycleKey,
      month: format(cycle.dueDate, "MMMM"),
      monthLabel: cycle.monthLabel,
      amount: cycle.remainingBalance,
      previousDue: cycle.previousDue,
      currentMonthAmount: Math.max(cycle.expectedAmount - cycle.advanceApplied, 0),
      totalDue: cycle.totalDue,
    }));

  return {
    totalDealValue,
    totalReceived,
    outstandingBalance,
    advanceBalance: ledger.advanceBalance || 0,
    nextDueCycle,
    nextDueBreakdown,
    lastPayment,
    previousCarryForward,
    pendingBreakdown,
    progressPercent: totalDealValue > 0 ? Math.min(100, Math.round((totalReceived / totalDealValue) * 100)) : 0,
  };
}
