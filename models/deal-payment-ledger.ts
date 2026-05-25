import mongoose, { Document, Model, Schema } from "mongoose";

export type DealLedgerCycleStatus = "pending" | "paid" | "partial" | "overdue" | "advance";

export interface IDealLedgerCycle {
  cycleKey: string;
  monthLabel: string;
  dueDate: Date;
  expectedAmount: number;
  previousDue: number;
  advanceApplied: number;
  totalDue: number;
  receivedAmount: number;
  remainingBalance: number;
  status: DealLedgerCycleStatus;
  reminderSentAt?: Date;
}

export interface IDealPaymentAllocation {
  cycleKey: string;
  amount: number;
}

export interface IDealPaymentHistory {
  amount: number;
  paidAt: Date;
  method: "UPI" | "Bank Transfer" | "Cash" | "Card" | "Cheque" | "Other";
  notes?: string;
  screenshotUrl?: string;
  screenshotPublicId?: string;
  allocations: IDealPaymentAllocation[];
}

export interface IDealPaymentLedger extends Document {
  leadId: string;
  organizationId: string;
  clientUserId?: string;
  plan: {
    planType: "monthly";
    monthlyAmount: number;
    billingDay: number;
    startDate: Date;
    totalDealValue: number;
    currency: "INR";
    active: boolean;
  };
  cycles: IDealLedgerCycle[];
  payments: IDealPaymentHistory[];
  advanceBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const DealLedgerCycleSchema = new Schema<IDealLedgerCycle>(
  {
    cycleKey: { type: String, required: true },
    monthLabel: { type: String, required: true },
    dueDate: { type: Date, required: true },
    expectedAmount: { type: Number, required: true, default: 0 },
    previousDue: { type: Number, required: true, default: 0 },
    advanceApplied: { type: Number, required: true, default: 0 },
    totalDue: { type: Number, required: true, default: 0 },
    receivedAmount: { type: Number, required: true, default: 0 },
    remainingBalance: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "partial", "overdue", "advance"],
      default: "pending",
    },
    reminderSentAt: { type: Date },
  },
  { _id: false },
);

const DealPaymentHistorySchema = new Schema<IDealPaymentHistory>(
  {
    amount: { type: Number, required: true },
    paidAt: { type: Date, required: true, default: Date.now },
    method: {
      type: String,
      enum: ["UPI", "Bank Transfer", "Cash", "Card", "Cheque", "Other"],
      default: "UPI",
    },
    notes: { type: String },
    screenshotUrl: { type: String },
    screenshotPublicId: { type: String },
    allocations: [
      {
        cycleKey: { type: String, required: true },
        amount: { type: Number, required: true },
        _id: false,
      },
    ],
  },
  { _id: true },
);

const DealPaymentLedgerSchema = new Schema<IDealPaymentLedger>(
  {
    leadId: { type: String, required: true, unique: true, index: true },
    organizationId: { type: String, required: true, index: true },
    clientUserId: { type: String, index: true },
    plan: {
      planType: { type: String, enum: ["monthly"], default: "monthly" },
      monthlyAmount: { type: Number, required: true, default: 0 },
      billingDay: { type: Number, min: 1, max: 31, required: true, default: 1 },
      startDate: { type: Date, required: true, default: Date.now },
      totalDealValue: { type: Number, required: true, default: 0 },
      currency: { type: String, enum: ["INR"], default: "INR" },
      active: { type: Boolean, default: true },
    },
    cycles: [DealLedgerCycleSchema],
    payments: [DealPaymentHistorySchema],
    advanceBalance: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const DealPaymentLedger: Model<IDealPaymentLedger> =
  mongoose.models.DealPaymentLedger ||
  mongoose.model<IDealPaymentLedger>("DealPaymentLedger", DealPaymentLedgerSchema);
