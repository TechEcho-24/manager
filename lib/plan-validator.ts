import dbConnect from "@/lib/db";
import { Organization } from "@/models/organization";
import { Lead } from "@/models/lead";
import { User } from "@/models/user";
import { PLAN_CONFIG, PlanType } from "./plan-config";

export interface PlanStatus {
  isBlocked: boolean;
  isWarning: boolean;
  message?: string;
  usage: number;
  limit: number;
}

export async function checkLeadLimit(organizationId: string): Promise<PlanStatus> {
  await dbConnect();
  
  const org = await Organization.findById(organizationId);
  if (!org) throw new Error("Organization not found");

  const plan = (org.plan || "starter") as PlanType;
  const config = PLAN_CONFIG[plan];
  
  const currentLeads = await Lead.countDocuments({ organizationId });
  
  const status: PlanStatus = {
    isBlocked: false,
    isWarning: false,
    usage: currentLeads,
    limit: config.maxLeads,
  };

  if (currentLeads >= config.maxLeads) {
    status.isBlocked = true;
    status.message = "You’ve reached your plan limit. Upgrade to continue.";
  } else if (currentLeads >= config.maxLeads * 0.8) {
    status.isWarning = true;
    status.message = "You're nearing your limit. Upgrade to avoid interruption.";
  }

  return status;
}

export async function checkTeamLimit(organizationId: string): Promise<PlanStatus> {
  await dbConnect();
  
  const org = await Organization.findById(organizationId);
  if (!org) throw new Error("Organization not found");

  const plan = (org.plan || "starter") as PlanType;
  const config = PLAN_CONFIG[plan];
  
  const currentUsers = await User.countDocuments({ organizationId });
  
  const status: PlanStatus = {
    isBlocked: false,
    isWarning: false,
    usage: currentUsers,
    limit: config.maxUsers,
  };

  if (currentUsers >= config.maxUsers) {
    status.isBlocked = true;
    status.message = "You’ve reached your plan limit. Upgrade to continue.";
  } else if (currentUsers >= config.maxUsers * 0.8 && config.maxUsers > 1) {
    status.isWarning = true;
    status.message = "You're nearing your limit. Upgrade to avoid interruption.";
  }

  return status;
}

export async function validateFeature(organizationId: string, featureKey: keyof typeof PLAN_CONFIG.starter.features): Promise<{ allowed: boolean; message?: string }> {
  await dbConnect();
  
  const org = await Organization.findById(organizationId);
  if (!org) throw new Error("Organization not found");

  const plan = (org.plan || "starter") as PlanType;
  const config = PLAN_CONFIG[plan];
  
  const isAllowed = !!config.features[featureKey];
  
  return {
    allowed: isAllowed,
    message: isAllowed ? undefined : "This feature is available in a higher plan. Upgrade to unlock."
  };
}
