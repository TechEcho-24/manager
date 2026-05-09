import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  tabId: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    tabId: { type: String, required: true, index: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Task;
}

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
