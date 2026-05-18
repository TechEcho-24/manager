import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: "client" | "admin";
  orgRole: "owner" | "staff" | "member";
  organizationId?: string;
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
    orgRole: { type: String, enum: ["owner", "staff", "member"], default: "owner" },
    organizationId: { type: String, index: true },
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
