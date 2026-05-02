import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReminder extends Document {
  organizationId: string;
  userId: string;
  leadId: string;
  type: "payment" | "followup";
  message: string;
  sentAt: Date;
  status: "sent" | "failed";
}

const ReminderSchema = new Schema<IReminder>(
  {
    organizationId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    leadId: { type: String, required: true },
    type: { type: String, enum: ["payment", "followup"], default: "payment" },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["sent", "failed"], default: "sent" },
  },
  { timestamps: true }
);

// Clear the model from mongoose if we need to force a schema update in dev
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Reminder;
}

export const Reminder: Model<IReminder> =
  mongoose.models.Reminder || mongoose.model<IReminder>("Reminder", ReminderSchema);
