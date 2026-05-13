import mongoose, { Schema, Document, Model } from "mongoose";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants";

export interface ITaskAttachment {
  type: "voice" | "image";
  url: string;
  publicId?: string;
  format?: string;
  bytes?: number;
  duration?: number;
  width?: number;
  height?: number;
  waveformPeaks?: number[];
  createdAt?: Date;
}

export interface ITask extends Document {
  tabId: string;
  text?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  attachments: ITaskAttachment[];
  completed: boolean;
  status: TaskStatus;
  priority: "high" | "medium" | "low";
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    tabId: { type: String, required: true, index: true },
    text: { type: String, default: "" },
    assignedToUserId: { type: String, index: true },
    assignedToName: { type: String },
    attachments: [
      {
        type: { type: String, enum: ["voice", "image"], required: true },
        url: { type: String, required: true },
        publicId: { type: String },
        format: { type: String },
        bytes: { type: Number },
        duration: { type: Number },
        width: { type: Number },
        height: { type: Number },
        waveformPeaks: [{ type: Number }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    completed: { type: Boolean, default: false },
    status: { type: String, enum: TASK_STATUSES, default: "To Do", index: true },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Task;
}

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
