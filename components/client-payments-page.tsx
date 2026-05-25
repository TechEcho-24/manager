"use client";

import useSWR from "swr";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  IndianRupee,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type PendingCycle = {
  cycleKey: string;
  month: string;
  amount: number;
  previousDue: number;
  currentMonthAmount: number;
};

type PortalPayment = {
  totalValue: number;
  receivedAmount: number;
  balanceRemaining: number;
  paymentPlan: "one-time" | "monthly" | "milestones";
  monthlyPaymentDate?: number;
  installments: Array<{
    amount: number;
    dueDate: string;
    status: "pending" | "paid";
  }>;
  progressPercent?: number;
  status?: "paid" | "overdue" | "partial";
  previousCarryForward?: number;
  nextDue?: {
    dueDate: string;
  } | null;
  nextDueBreakdown?: {
    previousDue: number;
    currentMonthAmount: number;
    totalDue: number;
  } | null;
  pendingBreakdown?: PendingCycle[];
  lastPayment?: {
    amount: number;
    paidAt: string;
    method: string;
  } | null;
};

type ClientPortalResponse = {
  found?: boolean;
  error?: string;
  message?: string;
  leadName?: string;
  company?: string;
  payment?: PortalPayment;
  contractDocument?: {
    url?: string;
    fileName?: string;
    uploadedAt?: string;
  } | null;
};

function getOrdinalSuffix(n: number) {
  const value = n % 100;
  if (value >= 11 && value <= 13) return "th";
  if (n % 10 === 1) return "st";
  if (n % 10 === 2) return "nd";
  if (n % 10 === 3) return "rd";
  return "th";
}

export function ClientPaymentsPage() {
  const { data, isLoading } = useSWR<ClientPortalResponse>("/api/client-portal", fetcher);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading your payments...</span>
      </div>
    );
  }

  if (!data?.found || !data.payment) {
    return (
      <Card className="mx-auto mt-8 max-w-xl border-dashed border-border bg-card">
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <CreditCard className="h-11 w-11 text-primary/35" />
          <h1 className="text-xl font-black">No linked payment ledger</h1>
          <p className="text-sm text-muted-foreground">
            {data?.error || data?.message || "Your organization has not linked a deal to this account yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { payment, contractDocument, leadName, company } = data;
  const progressPercent = payment.progressPercent ?? (
    payment.totalValue > 0
      ? Math.min(100, Math.round((payment.receivedAmount / payment.totalValue) * 100))
      : 0
  );
  const status = payment.status || (payment.balanceRemaining <= 0 ? "paid" : "partial");
  const statusClass =
    status === "paid"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
      : status === "overdue"
        ? "border-red-500/20 bg-red-500/10 text-red-600"
        : "border-amber-500/20 bg-amber-500/10 text-amber-600";
  const nextDueDate = payment.nextDue?.dueDate
    ? new Date(payment.nextDue.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const pendingBreakdown = payment.pendingBreakdown || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight lg:text-3xl">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your payment ledger{leadName ? ` for ${company ? `${company} - ` : ""}${leadName}` : ""}
        </p>
      </div>

      <Card className="overflow-hidden border-border">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-emerald-500/5 pb-3">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base font-bold">
            <CreditCard className="h-4 w-4 text-primary" />
            Payment Status
            <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest", statusClass)}>
              {status === "paid" ? "Paid" : status === "overdue" ? "Overdue" : "Partial Payment"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-4">
          {nextDueDate && (
            <div className={cn(
              "flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
              status === "overdue" ? "border-red-500/20 bg-red-500/5" : "border-primary/15 bg-primary/5",
            )}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={cn("h-4 w-4 shrink-0", status === "overdue" ? "text-red-500" : "text-primary")} />
                <span className="text-sm font-bold">Next payment due on {nextDueDate}</span>
              </div>
              {!!payment.previousCarryForward && payment.previousCarryForward > 0 && (
                <span className="text-xs font-black text-amber-600">
                  Previous due: INR {payment.previousCarryForward.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <AmountCard label="Total Deal Value" value={payment.totalValue} icon={IndianRupee} className="border-primary/10 bg-primary/5 text-primary" />
            <AmountCard label="Amount Paid" value={payment.receivedAmount} icon={TrendingUp} className="border-emerald-500/10 bg-emerald-500/5 text-emerald-600" />
            <AmountCard label="Balance Due" value={payment.balanceRemaining} icon={IndianRupee} className="border-amber-500/10 bg-amber-500/5 text-amber-600" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-muted-foreground">Payment Progress</span>
              <span className="font-black">{progressPercent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted/30">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {payment.nextDueBreakdown && payment.nextDueBreakdown.previousDue > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-amber-700">Next Due Split</h2>
              <div className="mt-3 space-y-2 text-sm">
                <PaymentLine label="Previous month pending" value={payment.nextDueBreakdown.previousDue} />
                <PaymentLine label="Current month amount" value={payment.nextDueBreakdown.currentMonthAmount} />
                <PaymentLine label="Total due now" value={payment.nextDueBreakdown.totalDue} strong />
              </div>
            </div>
          )}

          {pendingBreakdown.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/10 p-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Outstanding Breakdown</h2>
              <div className="mt-3 space-y-2">
                {pendingBreakdown.map((item) => (
                  <PaymentLine key={item.cycleKey} label={`Pending from ${item.month}`} value={item.amount} />
                ))}
              </div>
            </div>
          )}

          {payment.lastPayment ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-black text-emerald-700">
                INR {payment.lastPayment.amount.toLocaleString("en-IN")} received on{" "}
                {new Date(payment.lastPayment.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} via {payment.lastPayment.method}
              </p>
            </div>
          ) : payment.paymentPlan === "monthly" && payment.monthlyPaymentDate ? (
            <div className="flex items-center gap-2 rounded-xl border border-sky-500/10 bg-sky-500/5 px-4 py-3 text-sm text-sky-700">
              <Calendar className="h-4 w-4" />
              Monthly payment due on the <strong>{payment.monthlyPaymentDate}{getOrdinalSuffix(payment.monthlyPaymentDate)}</strong> of every month
            </div>
          ) : payment.paymentPlan === "milestones" && payment.installments.length > 0 ? (
            <div className="space-y-2 rounded-xl border border-border bg-muted/10 p-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Milestones</h2>
              {payment.installments.map((installment, index) => {
                const dueDate = new Date(installment.dueDate);
                const isPaid = installment.status === "paid";
                const isOverdue = !isPaid && dueDate < new Date();
                return (
                  <div key={`${installment.dueDate}-${index}`} className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                    <span className="text-sm font-bold">INR {installment.amount.toLocaleString("en-IN")}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", isPaid ? "text-emerald-600" : isOverdue ? "text-red-600" : "text-amber-600")}>
                      {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <FileText className="h-4 w-4 text-indigo-500" />
            Contract Document
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {contractDocument?.url ? (
            <a href={contractDocument.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-colors hover:bg-emerald-500/10">
              <FileText className="h-5 w-5 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{contractDocument.fileName || "Contract Document"}</p>
                <p className="text-[10px] text-muted-foreground">
                  {contractDocument.uploadedAt
                    ? `Uploaded ${new Date(contractDocument.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                    : "Click to view document"}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-emerald-600" />
            </a>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border p-6 text-center text-sm font-bold text-muted-foreground">
              No contract uploaded yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AmountCard({ label, value, icon: Icon, className }: {
  label: string;
  value: number;
  icon: typeof IndianRupee;
  className: string;
}) {
  return (
    <div className={cn("rounded-xl border p-4", className)}>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-2 text-xl font-black">INR {value.toLocaleString("en-IN")}</div>
    </div>
  );
}

function PaymentLine({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between rounded-lg bg-background px-3 py-2", strong && "bg-amber-500/10 font-black text-amber-700")}>
      <span>{label}</span>
      <span className="font-black">INR {value.toLocaleString("en-IN")}</span>
    </div>
  );
}
