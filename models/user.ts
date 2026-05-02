import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: "client" | "admin";
  organizationId?: string;
  onboardingCompleted: boolean;
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
    organizationId: { type: String, index: true },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Clear the model from mongoose if we need to force a schema update in dev
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User;
}

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
