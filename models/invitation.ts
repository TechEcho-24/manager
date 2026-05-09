import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvitation extends Document {
  organizationId: string;
  token: string;
  role: "staff" | "member";
  status: "pending" | "accepted";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    organizationId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    role: { type: String, enum: ["staff", "member"], default: "member" },
    status: { type: String, enum: ["pending", "accepted"], default: "pending" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Invitation;
}

export const Invitation: Model<IInvitation> =
  mongoose.models.Invitation || mongoose.model<IInvitation>("Invitation", InvitationSchema);
