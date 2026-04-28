import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  name: string;
  email: string;
  companyName: string;
  subscriptionPlan: 'Basic' | 'Pro' | 'Enterprise';
  status: 'Active' | 'Pending' | 'Suspended';
  revenue: number;
  joinedAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    subscriptionPlan: { 
      type: String, 
      enum: ['Basic', 'Pro', 'Enterprise'], 
      default: 'Pro' 
    },
    status: { 
      type: String, 
      enum: ['Active', 'Pending', 'Suspended'], 
      default: 'Active' 
    },
    revenue: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Client = mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);
