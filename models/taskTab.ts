import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITaskTabAccess {
  userId: string;
  permission: "read" | "write";
}

export interface ITaskTab extends Document {
  organizationId: string;
  name: string;
  type: "project" | "lead";
  accessControl: ITaskTabAccess[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskTabSchema = new Schema<ITaskTab>(
  {
    organizationId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["project", "lead"], default: "project" },
    accessControl: [
      {
        userId: { type: String, required: true },
        permission: { type: String, enum: ["read", "write"], required: true },
      },
    ],
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.TaskTab;
}

export const TaskTab: Model<ITaskTab> =
  mongoose.models.TaskTab || mongoose.model<ITaskTab>("TaskTab", TaskTabSchema);
