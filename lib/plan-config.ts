export type PlanType = "starter" | "growth" | "pro" | "enterprise";

export interface PlanConfig {
  maxLeads: number;
  maxUsers: number;
  maxRemindersPerMonth: number;
  features: {
    leadInput: "manual" | "chatbot" | "ai_capture";
    taskAssignment: "text" | "voice" | "image";
    automation: "disabled" | "basic" | "advanced";
    analytics: boolean;
    apiAccess: boolean;
  };
}

export const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
  starter: {
    maxLeads: 500,
    maxUsers: 1,
    maxRemindersPerMonth: 50,
    features: {
      leadInput: "manual",
      taskAssignment: "text",
      automation: "disabled",
      analytics: false,
      apiAccess: false,
    },
  },
  growth: {
    maxLeads: 5000,
    maxUsers: 5,
    maxRemindersPerMonth: 500,
    features: {
      leadInput: "chatbot",
      taskAssignment: "voice",
      automation: "basic",
      analytics: true,
      apiAccess: false,
    },
  },
  pro: {
    maxLeads: Infinity,
    maxUsers: Infinity,
    maxRemindersPerMonth: Infinity,
    features: {
      leadInput: "ai_capture",
      taskAssignment: "image",
      automation: "advanced",
      analytics: true,
      apiAccess: true,
    },
  },
  enterprise: {
    maxLeads: Infinity,
    maxUsers: Infinity,
    maxRemindersPerMonth: Infinity,
    features: {
      leadInput: "ai_capture",
      taskAssignment: "image",
      automation: "advanced",
      analytics: true,
      apiAccess: true,
    },
  },
};
