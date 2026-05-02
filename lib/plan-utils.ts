import { PlanType, PLAN_CONFIG } from "./plan-config";
import dbConnect from "./db";
import { Organization } from "@/models/organization";

export async function getPlanConfig(organizationId: string) {
  await dbConnect();
  const org = await Organization.findById(organizationId);
  const plan = (org?.plan || "starter") as PlanType;
  return PLAN_CONFIG[plan];
}
