import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.email !== "techecho.kanpur@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const clients = await User.find({ role: "client" }).lean();
    const orgIds = clients
      .map((c) => c.organizationId)
      .filter((id) => typeof id === "string" && id.length === 24) as string[];

    const organizations = await Organization.find({ _id: { $in: orgIds } }).lean();
    const orgMap = Object.fromEntries(organizations.map((o) => [o._id.toString(), o]));

    const now = new Date();

    const result = clients.map((user) => {
      const orgId = user.organizationId as string;
      const org = orgId ? orgMap[orgId] : null;
      const plan = org?.plan || "starter";
      const status = org?.subscription?.status || "trial";
      const currentPeriodEnd = org?.subscription?.currentPeriodEnd || null;
      const trialEndsAt = org?.subscription?.trialEndsAt || null;
      const autoRenew = org?.subscription?.autoRenew || false;

      let daysUntilExpiry: number | null = null;
      if (currentPeriodEnd) {
        const diff = new Date(currentPeriodEnd).getTime() - now.getTime();
        daysUntilExpiry = Math.ceil(diff / (1000 * 3600 * 24));
      }

      let daysLeftTrial: number | null = null;
      if (status === "trial" && trialEndsAt) {
        const diff = new Date(trialEndsAt).getTime() - now.getTime();
        daysLeftTrial = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
      }

      return {
        id: user._id.toString(),
        organizationId: orgId || null,
        name: user.name || user.email.split("@")[0],
        email: user.email,
        phone: user.phone || null,
        plan,
        status,
        autoRenew,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd).toISOString() : null,
        trialEndsAt: trialEndsAt ? new Date(trialEndsAt).toISOString() : null,
        daysUntilExpiry,
        daysLeftTrial,
        lastReminderSent: org?.lastReminderSent
          ? new Date(org.lastReminderSent).toISOString()
          : null,

        // Onboarding - Step 1
        designation: org?.designation || null,
        recoveryEmail: org?.recoveryEmail || null,
        website: org?.website || null,
        preferredCommunicationChannel: org?.preferredCommunicationChannel || [],

        // Step 2
        entityType: org?.entityType || null,
        industry: org?.industry || null,
        companySize: org?.companySize || null,
        operatingRegion: org?.operatingRegion || [],
        foundingYear: org?.foundingYear || null,
        primaryBusinessModel: org?.primaryBusinessModel || [],

        // Step 3
        toolsUsed: org?.toolsUsed || [],
        crmUsersCount: org?.crmUsersCount || null,
        leadSources: org?.leadSources || [],
        averageMonthlyLeads: org?.averageMonthlyLeads || null,
        hasExistingLeads: org?.hasExistingLeads ?? null,

        // Step 4
        revenueRange: org?.revenueRange || null,
        gstRegistered: org?.gstRegistered ?? null,
        gstNumber: org?.gstNumber || null,
        targetAudience: org?.targetAudience || [],
        businessPriority: org?.businessPriority || [],

        // Step 5
        themePreference: org?.themePreference || null,
        defaultCurrency: org?.defaultCurrency || null,
        botName: org?.botName || null,
        welcomeMessage: org?.welcomeMessage || null,
        logoUrl: org?.logoUrl || null,
        primaryColor: org?.primaryColor || null,
      };
    });

    // Sort: nearest expiry first (nulls at end), then trial users, then others
    result.sort((a, b) => {
      if (a.daysUntilExpiry !== null && b.daysUntilExpiry !== null) {
        return a.daysUntilExpiry - b.daysUntilExpiry;
      }
      if (a.daysUntilExpiry !== null) return -1;
      if (b.daysUntilExpiry !== null) return 1;
      return 0;
    });

    return NextResponse.json({ clients: result });
  } catch (error: any) {
    console.error("Admin Clients API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
