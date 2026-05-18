import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  userId: string;
  organizationId: string;
  type: "followup" | "renewal" | "general";
  title: string;
  message: string;
  leadId?: string;
  leadName?: string;
  isRead: boolean;
  displayAfter: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    organizationId: { type: String, required: true, index: true },
    type: { type: String, enum: ["followup", "renewal", "general"], default: "followup" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    leadId: { type: String },
    leadName: { type: String },
    isRead: { type: Boolean, default: false },
    displayAfter: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Notification;
}

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
