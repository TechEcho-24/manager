import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { Payment } from "@/models/payment";
import { Lead } from "@/models/lead";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();
    
    // STRICT ADMIN CHECK
    if ((session?.user as any)?.email !== "techecho.kanpur@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeOrgIds = await Organization.find({ "subscription.status": "active" }).distinct("_id");

    const [totalUsers, totalOrgs, payments, allLeads] = await Promise.all([
      User.countDocuments({ role: "client", organizationId: { $in: activeOrgIds } }),
      Organization.find({ _id: { $in: activeOrgIds } }),
      Payment.find({ status: "paid" }),
      Lead.countDocuments({ organizationId: { $in: activeOrgIds } }),
    ]);

    // Plan Distribution
    const planDistribution = {
      starter: totalOrgs.filter(o => o.plan === "starter").length,
      growth: totalOrgs.filter(o => o.plan === "growth").length,
      pro: totalOrgs.filter(o => o.plan === "pro").length,
    };

    // Revenue Analytics
    const now = new Date();
    const today = new Date(now.setHours(0,0,0,0));
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dailyRevenue = payments
      .filter(p => new Date(p.createdAt) >= today)
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const monthlyRevenue = payments
      .filter(p => new Date(p.createdAt) >= firstOfMonth)
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Recent Activity (Mock for now, can be real from a dedicated log model)
    const recentPurchases = payments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(p => ({
        id: p._id,
        email: p.userId,
        plan: p.planName,
        amount: p.amount,
        date: p.createdAt
      }));

    // User-wise Usage
    // Note: In a large system, this would be a separate aggregation
    const userUsage = await Promise.all(totalOrgs.slice(0, 10).map(async (org) => {
      const leadsCount = await Lead.countDocuments({ organizationId: org._id });
      return {
        id: org._id,
        name: org.name,
        email: org.email,
        plan: org.plan,
        leads: leadsCount,
        status: org.subscription.status,
        expiresAt: org.subscription.currentPeriodEnd || org.subscription.trialEndsAt
      };
    }));

    // Live Activity Feed
    const [recentLeads, recentUsers] = await Promise.all([
      Lead.find({ organizationId: { $in: activeOrgIds } }).sort({ createdAt: -1 }).limit(5),
      User.find({ role: "client", organizationId: { $in: activeOrgIds } }).sort({ createdAt: -1 }).limit(5),
    ]);

    const recentActivity = [
      ...recentLeads.map(l => ({ type: "lead", message: `New lead: ${l.fullName}`, date: l.createdAt })),
      ...recentUsers.map(u => ({ type: "user", message: `New user: ${u.email}`, date: u.createdAt })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalLeads: allLeads,
        totalRevenue,
        dailyRevenue,
        monthlyRevenue,
      },
      planDistribution,
      recentPurchases,
      userUsage,
      recentActivity
    });
  } catch (error: any) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch admin statistics" }, { status: 500 });
  }
}
