import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: "client" | "admin";
  orgRole: "owner" | "staff" | "member" | "client";
  organizationId?: string;
  organizations?: Array<{
    organizationId: string;
    orgRole: "owner" | "staff" | "member" | "client";
    joinedAt: Date;
  }>;
  onboardingCompleted: boolean;
  paymentCompleted: boolean;
  pushSubscriptions?: Array<{
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String },
    role: { type: String, enum: ["client", "admin"], default: "client" },
    orgRole: { type: String, enum: ["owner", "staff", "member", "client"], default: "owner" },
    organizationId: { type: String, index: true },
    organizations: [{
      organizationId: { type: String, required: true },
      orgRole: { type: String, enum: ["owner", "staff", "member", "client"], required: true },
      joinedAt: { type: Date, default: Date.now }
    }],
    onboardingCompleted: { type: Boolean, default: false },
    paymentCompleted: { type: Boolean, default: false },
    pushSubscriptions: [{
      endpoint: { type: String, required: true },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true }
      }
    }],
  },
  { timestamps: true }
);

// Clear the model from mongoose if we need to force a schema update in dev
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User;
}

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
