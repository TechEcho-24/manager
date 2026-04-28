import mongoose, { Schema, Document } from "mongoose";
import { LEAD_STATUSES, LEAD_PRIORITIES } from "@/lib/constants";

export { LEAD_STATUSES, LEAD_PRIORITIES };

export interface ILead extends Document {
  fullName: string;
  phone: string;
  userId: string;
  alternatePhone?: string;
  email?: string;
  company?: string;
  designation?: string;
  
  leadSource?: string;
  campaignName?: string;
  referredBy?: string;
  
  product?: string;
  requirementDescription?: string;
  budget?: string;
  quantity?: string;
  
  city?: string;
  state?: string;
  address?: string;
  
  status: typeof LEAD_STATUSES[number];
  priority: typeof LEAD_PRIORITIES[number];
  assignedTo?: string;
  tags: string[];
  attachments: string[];
  
  nextFollowupDate?: Date;
  
  notes: {
    text: string;
    createdAt: Date;
    createdBy?: string;
  }[];
  
  activityTimeline: {
    action: string;
    description: string;
    createdAt: Date;
    createdBy?: string;
  }[];
  
  dealDetails?: {
    totalValue: number;
    receivedAmount: number;
    paymentPlan: 'one-time' | 'monthly' | 'milestones';
    installments: {
      amount: number;
      dueDate: Date;
      status: 'pending' | 'paid';
      paidAt?: Date;
      reminderSentAt?: Date;
    }[];
  };

  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    userId: { type: String, required: true, index: true }, // Added for Multi-tenancy
    alternatePhone: { type: String },
    email: { type: String },
    company: { type: String },
    designation: { type: String },

    leadSource: { type: String },
    campaignName: { type: String },
    referredBy: { type: String },

    product: { type: String },
    requirementDescription: { type: String },
    budget: { type: String },
    quantity: { type: String },

    city: { type: String },
    state: { type: String },
    address: { type: String },

    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "New",
      required: true,
    },
    priority: {
      type: String,
      enum: LEAD_PRIORITIES,
      default: "Medium",
      required: true,
    },
    assignedTo: { type: String },
    tags: [{ type: String }],
    attachments: [{ type: String }],

    nextFollowupDate: { type: Date },

    notes: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: String },
      },
    ],

    activityTimeline: [
      {
        action: { type: String, required: true },
        description: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: String },
      },
    ],
    dealDetails: {
      totalValue: { type: Number, default: 0 },
      receivedAmount: { type: Number, default: 0 },
      paymentPlan: { 
        type: String, 
        enum: ['one-time', 'monthly', 'milestones'],
        default: 'one-time' 
      },
      installments: [
        {
          amount: { type: Number, required: true },
          dueDate: { type: Date, required: true },
          status: { 
            type: String, 
            enum: ['pending', 'paid'], 
            default: 'pending' 
          },
          paidAt: { type: Date },
          reminderSentAt: { type: Date },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Clear the model from mongoose if we need to force a schema update in dev
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Lead;
}

export const Lead = mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
