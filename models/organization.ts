import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  email: string;
  phone: string;
  ownerId: string; // Will link to user's email or ID from NextAuth
  plan: "starter" | "growth" | "pro" | "enterprise";
  subscription: {
    status: "trial" | "active" | "past_due" | "cancelled" | "expired";
    trialEndsAt?: Date;
    currentPeriodEnd?: Date;
    razorpayCustomerId?: string;
    razorpaySubscriptionId?: string;
  };
  logoUrl?: string;
  primaryColor?: string;
  
  // STEP 1
  designation?: string;
  recoveryEmail?: string;
  website?: string;
  preferredCommunicationChannel?: string[];

  // STEP 2
  entityType?: string;
  industry?: string;
  companySize?: string;
  operatingRegion?: string[];
  foundingYear?: string;
  primaryBusinessModel?: string[];

  // STEP 3
  toolsUsed?: string[];
  crmUsersCount?: string;
  leadSources?: string[];
  averageMonthlyLeads?: string;
  hasExistingLeads?: boolean;

  // STEP 4
  revenueRange?: string;
  gstRegistered?: boolean;
  gstNumber?: string;
  targetAudience?: string[];
  businessPriority?: string[];

  // STEP 5 (Branding & Workspace Setup + Bot Interface)
  themePreference?: string;
  notificationPreferences?: string[];
  defaultCurrency?: string;
  botName?: string;
  welcomeMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    plan: {
      type: String,
      enum: ["starter", "growth", "pro", "enterprise"],
      default: "starter",
    },
    subscription: {
      status: {
        type: String,
        enum: ["trial", "active", "past_due", "cancelled", "expired"],
        default: "trial",
      },
      trialEndsAt: { type: Date },
      currentPeriodEnd: { type: Date },
      razorpayCustomerId: { type: String },
      razorpaySubscriptionId: { type: String },
    },
    logoUrl: { type: String },
    primaryColor: { type: String },

    // STEP 1
    designation: { type: String },
    recoveryEmail: { type: String },
    website: { type: String },
    preferredCommunicationChannel: [{ type: String }],

    // STEP 2
    entityType: { type: String },
    industry: { type: String },
    companySize: { type: String },
    operatingRegion: [{ type: String }],
    foundingYear: { type: String },
    primaryBusinessModel: [{ type: String }],

    // STEP 3
    toolsUsed: [{ type: String }],
    crmUsersCount: { type: String },
    leadSources: [{ type: String }],
    averageMonthlyLeads: { type: String },
    hasExistingLeads: { type: Boolean, default: false },

    // STEP 4
    revenueRange: { type: String },
    gstRegistered: { type: Boolean, default: false },
    gstNumber: { type: String },
    targetAudience: [{ type: String }],
    businessPriority: [{ type: String }],

    // STEP 5
    themePreference: { type: String },
    notificationPreferences: [{ type: String }],
    defaultCurrency: { type: String },
    botName: { type: String },
    welcomeMessage: { type: String },
  },
  { timestamps: true }
);

// Clear the model from mongoose if we need to force a schema update in dev
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Organization;
}

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
