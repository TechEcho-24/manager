import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPayment extends Document {
  organizationId?: string; // Optional — set to "pending" at signup, updated after onboarding
  userId: string;
  planName?: string;       // Store plan name for reference
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: "created" | "paid" | "failed" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    organizationId: {
      type: String,
      required: false, // Optional — filled during onboarding completion
      index: true,
    },
    userId: { type: String, required: true },
    planName: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
  },
  { timestamps: true }
);

// Force model refresh in dev hot-reload to avoid stale schema
if (mongoose.models.Payment) {
  delete (mongoose.models as any).Payment;
}

export const Payment: Model<IPayment> = mongoose.model<IPayment>("Payment", PaymentSchema);
