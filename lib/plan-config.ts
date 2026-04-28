export type PlanType = "free" | "pro" | "enterprise";

export interface PlanConfig {
  maxLeads: number;
  maxUsers: number;
  features: {
    analytics: boolean;
    aiChatbot: boolean;
    customDomain: boolean;
    prioritySupport: boolean;
    apiAccess: boolean;
  };
}

export const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
  free: {
    maxLeads: 50,
    maxUsers: 1,
    features: {
      analytics: false,
      aiChatbot: false,
      customDomain: false,
      prioritySupport: false,
      apiAccess: false,
    },
  },
  pro: {
    maxLeads: Infinity, // Unlimited
    maxUsers: 5,
    features: {
      analytics: true,
      aiChatbot: true,
      customDomain: false,
      prioritySupport: true,
      apiAccess: true,
    },
  },
  enterprise: {
    maxLeads: Infinity,
    maxUsers: Infinity,
    features: {
      analytics: true,
      aiChatbot: true,
      customDomain: true,
      prioritySupport: true,
      apiAccess: true,
    },
  },
};
