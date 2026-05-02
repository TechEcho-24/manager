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

export async function checkLeadLimit(organizationId: string, userId: string): Promise<PlanStatus> {
  await dbConnect();
  
  if (!organizationId || organizationId.length !== 24) {
    return { isBlocked: false, isWarning: false, usage: 0, limit: PLAN_CONFIG.starter.maxLeads };
  }

  const org = await Organization.findById(organizationId);
  if (!org) return { isBlocked: false, isWarning: false, usage: 0, limit: PLAN_CONFIG.starter.maxLeads };

  const plan = (org.plan || "starter") as PlanType;
  const config = PLAN_CONFIG[plan];
  
  // Track leads per user
  const count = await Lead.countDocuments({ userId });
  
  return {
    isBlocked: config.maxLeads !== Infinity && count >= config.maxLeads,
    isWarning: config.maxLeads !== Infinity && count >= config.maxLeads * 0.8,
    usage: count,
    limit: config.maxLeads,
    message: count >= config.maxLeads 
      ? "Limit reached. Upgrade your plan to continue." 
      : count >= config.maxLeads * 0.8 
      ? "You have used 80% of your limit." 
      : undefined
  };
}

export async function checkTeamLimit(organizationId: string): Promise<PlanStatus> {
  await dbConnect();
  const org = await Organization.findById(organizationId);
  if (!org) return { isBlocked: true, isWarning: false, usage: 0, limit: 0 };

  const config = PLAN_CONFIG[org.plan as PlanType];
  const count = await User.countDocuments({ organizationId });

  return {
    isBlocked: config.maxUsers !== Infinity && count >= config.maxUsers,
    isWarning: config.maxUsers !== Infinity && count >= config.maxUsers * 0.8,
    usage: count,
    limit: config.maxUsers,
    message: count >= config.maxUsers ? "Limit reached. Upgrade your plan to continue." : undefined
  };
}

export async function checkReminderLimit(organizationId: string, userId: string): Promise<PlanStatus> {
  await dbConnect();
  const org = await Organization.findById(organizationId);
  if (!org) return { isBlocked: true, isWarning: false, usage: 0, limit: 0 };

  const config = PLAN_CONFIG[org.plan as PlanType];
  const { Reminder } = await import("@/models/reminder");
  const count = await Reminder.countDocuments({ 
    userId, 
    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } 
  });

  return {
    isBlocked: config.maxRemindersPerMonth !== Infinity && count >= config.maxRemindersPerMonth,
    isWarning: config.maxRemindersPerMonth !== Infinity && count >= config.maxRemindersPerMonth * 0.8,
    usage: count,
    limit: config.maxRemindersPerMonth,
    message: count >= config.maxRemindersPerMonth ? "Limit reached. Upgrade your plan to continue." : undefined
  };
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
