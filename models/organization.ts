import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  email: string;
  phone: string;
  ownerId: string; // Will link to user's email or ID from NextAuth
  plan: "free" | "pro" | "enterprise";
  subscription: {
    status: "trial" | "active" | "past_due" | "cancelled" | "expired";
    trialEndsAt?: Date;
    currentPeriodEnd?: Date;
    razorpayCustomerId?: string;
    razorpaySubscriptionId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    subscription: {
      status: {
        type: String,
        enum: ["trial", "active", "past_due", "cancelled", "expired"],
        default: "trial",
      },
      trialEndsAt: { type: Date },
      currentPeriodEnd: { type: Date },
      razorpayCustomerId: { type: String },
      razorpaySubscriptionId: { type: String },
    },
  },
  { timestamps: true }
);

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
