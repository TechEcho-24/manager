"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import useSWR from "swr";
import { CldUploadWidget } from "next-cloudinary";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Clock,
  CreditCard,
  Eye,
  FileImage,
  IndianRupee,
  Loader2,
  Plus,
  ReceiptText,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type LedgerCycle = {
  cycleKey: string;
  monthLabel: string;
  dueDate: string;
  expectedAmount: number;
  previousDue: number;
  advanceApplied: number;
  totalDue: number;
  receivedAmount: number;
  remainingBalance: number;
  status: "pending" | "paid" | "partial" | "overdue" | "advance";
};

type LedgerPayment = {
  _id?: string;
  amount: number;
  paidAt: string;
  method: string;
  notes?: string;
  screenshotUrl?: string;
  allocations: { cycleKey: string; amount: number }[];
};

type LedgerResponse = {
  found: boolean;
  message?: string;
  ledger?: {
    plan: {
      monthlyAmount: number;
      billingDay: number;
      startDate: string;
      totalDealValue: number;
      active: boolean;
    };
    cycles: LedgerCycle[];
    payments: LedgerPayment[];
    advanceBalance: number;
    summary: {
      totalDealValue: number;
      totalReceived: number;
      outstandingBalance: number;
      advanceBalance: number;
      progressPercent: number;
      nextDueCycle?: LedgerCycle;
      lastPayment?: LedgerPayment;
    };
  };
};

type LeadResponse = {
  fullName?: string;
  company?: string;
  dealDetails?: {
    totalValue?: number;
    monthlyPaymentDate?: number;
    monthlyStartDate?: string;
    paymentDate?: string;
  };
};

const statusStyles: Record<LedgerCycle["status"], string> = {
  paid: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  partial: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  overdue: "border-red-500/20 bg-red-500/10 text-red-600",
  advance: "border-primary/20 bg-primary/10 text-primary",
  pending: "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

function money(amount = 0) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function dateValue(date?: string) {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function readCloudinaryInfo(info: unknown) {
  if (!info || typeof info !== "object") return null;
  const uploadInfo = info as { secure_url?: unknown; public_id?: unknown };
  if (typeof uploadInfo.secure_url !== "string") return null;
  return {
    url: uploadInfo.secure_url,
    publicId: typeof uploadInfo.public_id === "string" ? uploadInfo.public_id : undefined,
  };
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary", className)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="mt-1 text-xl font-black text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DealPaymentLedgerClient({ leadId }: { leadId: string }) {
  const { data, isLoading, mutate } = useSWR<LedgerResponse>(`/api/leads/${leadId}/payment-ledger`, fetcher);
  const { data: leadData } = useSWR<LeadResponse>(`/api/leads/${leadId}`, fetcher);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [detailCycle, setDetailCycle] = useState<LedgerCycle | null>(null);
  const [saving, setSaving] = useState(false);
  const [screenshot, setScreenshot] = useState<{ url: string; publicId?: string } | null>(null);

  const ledger = data?.ledger;
  const defaultStartDate = dateValue(leadData?.dealDetails?.monthlyStartDate || leadData?.dealDetails?.paymentDate) || new Date().toISOString().split("T")[0];

  const [planForm, setPlanForm] = useState({
    totalDealValue: "",
    billingDay: "1",
    startDate: new Date().toISOString().split("T")[0],
    active: true,
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paidAt: new Date().toISOString().split("T")[0],
    method: "UPI",
    notes: "",
  });

  const getPlanDefaults = () => {
    if (ledger?.plan) {
      return {
        totalDealValue: String(ledger.plan.totalDealValue || ""),
        billingDay: String(ledger.plan.billingDay || 1),
        startDate: dateValue(ledger.plan.startDate),
        active: ledger.plan.active,
      };
    }
    if (leadData?.dealDetails) {
      return {
        totalDealValue: String(leadData.dealDetails.totalValue || ""),
        billingDay: String(leadData.dealDetails.monthlyPaymentDate || 1),
        startDate: defaultStartDate,
        active: true,
      };
    }
    return planForm;
  };

  const openPlanDialog = () => {
    setPlanForm(getPlanDefaults());
    setPlanOpen(true);
  };

  const nextDueDate = ledger?.summary.nextDueCycle
    ? format(new Date(ledger.summary.nextDueCycle.dueDate), "dd MMM yyyy")
    : "Completed";

  const submitPlan = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/payment-ledger/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planForm),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save payment plan");
      toast.success("Payment plan saved");
      setPlanOpen(false);
      mutate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save payment plan"));
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/payment-ledger/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentForm,
          screenshotUrl: screenshot?.url,
          screenshotPublicId: screenshot?.publicId,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to add payment");
      toast.success("Payment added and allocated to oldest dues");
      setPaymentOpen(false);
      setScreenshot(null);
      setPaymentForm({ amount: "", paidAt: new Date().toISOString().split("T")[0], method: "UPI", notes: "" });
      mutate();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add payment"));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/deals" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to deals
          </Link>
          <h1 className="text-2xl font-black tracking-tight lg:text-3xl">Recurring Payment Ledger</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {leadData?.company ? `${leadData.company} · ` : ""}{leadData?.fullName || "Converted deal"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 rounded-xl" onClick={openPlanDialog}>
            <RotateCcw className="h-4 w-4" />
            {ledger ? "Update Plan" : "Setup Plan"}
          </Button>
          <Button className="h-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20" onClick={() => setPaymentOpen(true)} disabled={!ledger}>
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </div>

      {!ledger ? (
        <Card className="border-dashed border-border bg-card shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <ReceiptText className="h-12 w-12 text-primary/40" />
            <div>
              <h2 className="text-lg font-black">No monthly ledger yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">{data?.message || "Setup a monthly plan to begin recurring tracking."}</p>
            </div>
            <Button className="mt-2 rounded-xl" onClick={openPlanDialog}>Setup Monthly Ledger</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="Total Deal Value" value={money(ledger.summary.totalDealValue)} icon={IndianRupee} />
            <SummaryCard title="Total Amount Received" value={money(ledger.summary.totalReceived)} icon={Banknote} className="bg-emerald-500/10 text-emerald-600" />
            <SummaryCard title="Outstanding Balance" value={money(ledger.summary.outstandingBalance)} icon={Clock} className="bg-amber-500/10 text-amber-600" />
            <SummaryCard title="Next Due Date" value={nextDueDate} icon={Calendar} className="bg-red-500/10 text-red-600" />
          </div>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-black">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-6">
              {[
                ["Plan Type", "Monthly"],
                ["Monthly Cycle Amount", money(ledger.plan.totalDealValue)],
                ["Billing Date", `${ledger.plan.billingDay}${ordinal(ledger.plan.billingDay)} of month`],
                ["Start Date", format(new Date(ledger.plan.startDate), "dd MMM yyyy")],
                ["Next Payment Due", nextDueDate],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-muted/20 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-black text-foreground">{value}</p>
                </div>
              ))}
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</p>
                <Badge className="mt-1 border-primary/20 bg-primary/10 text-primary">{ledger.plan.active ? "Active" : "Paused"}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black">Monthly Ledger</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Previous Due</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.cycles.map((cycle) => (
                    <TableRow key={cycle.cycleKey}>
                      <TableCell className="font-bold">{cycle.monthLabel}</TableCell>
                      <TableCell>{format(new Date(cycle.dueDate), "dd MMM yyyy")}</TableCell>
                      <TableCell>{money(cycle.expectedAmount)}</TableCell>
                      <TableCell>{money(cycle.previousDue)}</TableCell>
                      <TableCell className="font-black">{money(cycle.totalDue)}</TableCell>
                      <TableCell className="text-emerald-600">{money(cycle.receivedAmount)}</TableCell>
                      <TableCell className="text-amber-600">{money(cycle.remainingBalance)}</TableCell>
                      <TableCell>
                        <Badge className={cn("capitalize", statusStyles[cycle.status])}>{cycle.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" className="rounded-lg" onClick={() => {
                            setPaymentForm((current) => ({ ...current, amount: String(cycle.remainingBalance || cycle.totalDue) }));
                            setPaymentOpen(true);
                          }}>
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setDetailCycle(cycle)}>
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-black">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ledger.payments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                  No payments recorded yet.
                </div>
              ) : ledger.payments.map((payment) => (
                <div key={payment._id || payment.paidAt} className="grid gap-3 rounded-xl border border-border bg-muted/10 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-lg font-black text-foreground">{money(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payment.paidAt), "dd MMM yyyy")} via {payment.method}
                    </p>
                    {payment.notes && <p className="mt-2 text-sm text-foreground/70">{payment.notes}</p>}
                    <p className="mt-2 text-[11px] font-bold text-muted-foreground">
                      Allocated: {payment.allocations.length ? payment.allocations.map((item) => `${item.cycleKey} ${money(item.amount)}`).join(", ") : "Advance balance"}
                    </p>
                  </div>
                  {payment.screenshotUrl && (
                    <a href={payment.screenshotUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-bold text-primary">
                      <FileImage className="h-4 w-4" />
                      Screenshot
                    </a>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={planOpen} onOpenChange={setPlanOpen} contentClassName="max-w-xl bg-card">
        <DialogHeader>
          <DialogTitle>{ledger ? "Update Payment Plan" : "Setup Monthly Ledger"}</DialogTitle>
          <DialogDescription>Plan changes apply to future materialized cycles; old monthly rows stay as historical snapshots.</DialogDescription>
        </DialogHeader>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Total Deal Value" value={planForm.totalDealValue} onChange={(value) => setPlanForm((current) => ({ ...current, totalDealValue: value }))} />
          <Field label="Billing Day" value={planForm.billingDay} min={1} max={31} onChange={(value) => setPlanForm((current) => ({ ...current, billingDay: value }))} />
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Start Date</label>
            <Input type="date" className="mt-2 h-10 rounded-xl" value={planForm.startDate} onChange={(event) => setPlanForm((current) => ({ ...current, startDate: event.target.value }))} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => setPlanOpen(false)}>Cancel</Button>
          <Button className="rounded-xl" onClick={submitPlan} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Plan
          </Button>
        </div>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen} contentClassName="max-w-xl bg-card">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <DialogDescription>Payments automatically clear the oldest unpaid dues first.</DialogDescription>
        </DialogHeader>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Amount Received" value={paymentForm.amount} onChange={(value) => setPaymentForm((current) => ({ ...current, amount: value }))} />
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment Date</label>
            <Input type="date" className="mt-2 h-10 rounded-xl" value={paymentForm.paidAt} onChange={(event) => setPaymentForm((current) => ({ ...current, paidAt: event.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment Method</label>
            <select className="mt-2 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" value={paymentForm.method} onChange={(event) => setPaymentForm((current) => ({ ...current, method: event.target.value }))}>
              {["UPI", "Bank Transfer", "Cash", "Card", "Cheque", "Other"].map((method) => <option key={method}>{method}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Screenshot</label>
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              options={{ clientAllowedFormats: ["png", "jpeg", "jpg", "webp", "pdf"], maxFiles: 1, multiple: false }}
              onSuccess={(result) => {
                const uploaded = readCloudinaryInfo(result.info);
                if (uploaded) {
                  setScreenshot(uploaded);
                }
              }}
            >
              {({ open }) => (
                <Button type="button" variant="outline" className="mt-2 h-10 w-full rounded-xl" onClick={() => open()}>
                  <Upload className="h-4 w-4" />
                  {screenshot ? "Uploaded" : "Upload"}
                </Button>
              )}
            </CldUploadWidget>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</label>
            <textarea
              className="mt-2 min-h-24 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={paymentForm.notes}
              onChange={(event) => setPaymentForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Reference ID, remarks, or collection notes"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => setPaymentOpen(false)}>Cancel</Button>
          <Button className="rounded-xl" onClick={submitPayment} disabled={saving || !paymentForm.amount}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Payment
          </Button>
        </div>
      </Dialog>

      <Dialog open={!!detailCycle} onOpenChange={() => setDetailCycle(null)} contentClassName="max-w-lg bg-card">
        {detailCycle && (
          <>
            <DialogHeader>
              <DialogTitle>{detailCycle.monthLabel}</DialogTitle>
              <DialogDescription>Cycle snapshot and carry-forward details.</DialogDescription>
            </DialogHeader>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Expected Amount", money(detailCycle.expectedAmount)],
                ["Previous Due", money(detailCycle.previousDue)],
                ["Advance Applied", money(detailCycle.advanceApplied)],
                ["Total Due", money(detailCycle.totalDue)],
                ["Received", money(detailCycle.receivedAmount)],
                ["Remaining", money(detailCycle.remainingBalance)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-muted/20 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="mt-1 text-sm font-black">{value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}

function Field({ label, value, onChange, min, max }: { label: string; value: string; onChange: (value: string) => void; min?: number; max?: number }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <Input type="number" min={min ?? 0} max={max} className="mt-2 h-10 rounded-xl" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ordinal(day: number) {
  const value = day % 100;
  if (value >= 11 && value <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
