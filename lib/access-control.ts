import { IOrganization } from "@/models/organization";
import { PLAN_CONFIG, PlanType } from "./plan-config";

export function getEffectivePlan(organization: IOrganization): PlanType {
  const now = new Date();
  
  // If in trial and trial hasn't expired, they act as PRO
  if (
    organization.subscription.status === "trial" &&
    organization.subscription.trialEndsAt &&
    organization.subscription.trialEndsAt > now
  ) {
    return "pro";
  }

  // If subscription is expired, cancelled, or past due, fallback to free logic
  // (We could alternatively block everything, but the plan says fallback to free/read-only)
  if (
    ["expired", "cancelled", "past_due"].includes(organization.subscription.status)
  ) {
    return "free";
  }

  // Return the actual plan
  return organization.plan;
}

export function canAccessFeature(
  organization: IOrganization,
  feature: keyof typeof PLAN_CONFIG["free"]["features"]
): boolean {
  const plan = getEffectivePlan(organization);
  return PLAN_CONFIG[plan].features[feature] === true;
}

export function checkLimit(
  organization: IOrganization,
  limitType: "maxLeads" | "maxUsers",
  currentUsage: number
): boolean {
  const plan = getEffectivePlan(organization);
  const limit = PLAN_CONFIG[plan][limitType];
  
  return currentUsage < limit;
}

export function isSubscriptionExpired(organization: IOrganization): boolean {
  return ["expired", "cancelled", "past_due"].includes(organization.subscription.status);
}
