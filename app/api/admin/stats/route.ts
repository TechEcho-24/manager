import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { Payment } from "@/models/payment";
import { Lead } from "@/models/lead";
import { Reminder } from "@/models/reminder";
import { auth } from "@/auth";
import { PLAN_CONFIG } from "@/lib/plan-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();
    
    // STRICT ADMIN CHECK
    if ((session?.user as any)?.email !== "techecho.kanpur@gmail.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all Users to map names globally
    const allUsers = await User.find({});
    const clients = allUsers.filter(u => u.role === "client");
    const totalUsersCount = clients.length;
    
    // Filter valid 24-char IDs to prevent Mongoose crashes
    const orgIds = [...new Set(clients
      .map(c => c.organizationId)
      .filter(id => typeof id === 'string' && id.length === 24)
    )] as string[];

    const [organizations, payments, allLeadsCount] = await Promise.all([
      Organization.find({ _id: { $in: orgIds } }),
      Payment.find({ status: "paid" }),
      Lead.countDocuments(),
    ]);

    const orgMap = Object.fromEntries(organizations.map(o => [o._id.toString(), o]));

    // Efficient Aggregation for Usage Tracking
    const [leadUsage, teamUsage, reminderUsage] = await Promise.all([
      Lead.aggregate([
        { $group: { _id: "$userId", count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $group: { _id: "$organizationId", count: { $sum: 1 } } }
      ]),
      Reminder.aggregate([
        { 
          $match: { 
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } 
          } 
        },
        { $group: { _id: "$userId", count: { $sum: 1 } } }
      ])
    ]);

    const usageMap = {
      leads: Object.fromEntries(leadUsage.filter(u => u._id).map(u => [u._id.toString(), u.count])),
      team: Object.fromEntries(teamUsage.filter(u => u._id).map(u => [u._id.toString(), u.count])),
      reminders: Object.fromEntries(reminderUsage.filter(u => u._id).map(u => [u._id.toString(), u.count]))
    };

    const userStats = clients.map((user) => {
      const userIdStr = user._id.toString();
      const orgIdStr = user.organizationId;
      const org = orgIdStr ? orgMap[orgIdStr] : null;
      const plan = org?.plan || "starter";
      const config = (PLAN_CONFIG as any)[plan];

      return {
        id: userIdStr,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        plan: plan,
        usage: {
          leads: usageMap.leads[userIdStr] || 0,
          leadsLimit: config.maxLeads,
          team: usageMap.team[orgIdStr || ''] || 1,
          teamLimit: config.maxUsers,
          reminders: usageMap.reminders[userIdStr] || 0,
          remindersLimit: config.maxRemindersPerMonth
        },
        status: org?.subscription?.status || "active",
        expiresAt: org?.subscription?.currentPeriodEnd || org?.subscription?.trialEndsAt
      };
    });

    // Plan Distribution
    const planDistribution = {
      starter: organizations.filter(o => o.plan === "starter").length,
      growth: organizations.filter(o => o.plan === "growth").length,
      pro: organizations.filter(o => o.plan === "pro").length,
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

    // Recent Activity
    const [recentLeads, recentUsers] = await Promise.all([
      Lead.find().sort({ createdAt: -1 }).limit(5),
      User.find({ role: "client" }).sort({ createdAt: -1 }).limit(5),
    ]);

    const recentActivity = [
      ...recentLeads.map(l => ({ type: "lead", message: `New lead: ${l.fullName}`, date: l.createdAt })),
      ...recentUsers.map(u => ({ type: "user", message: `New signup: ${u.email}`, date: u.createdAt })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const recentPurchases = payments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(p => {
        const pUser = allUsers.find(c => c._id.toString() === p.userId || c.email === p.userId);
        return {
          id: p._id,
          userId: p.userId,
          name: pUser?.name || pUser?.email?.split('@')[0] || 'Unknown User',
          email: pUser?.email || p.userId,
          plan: p.planName,
          amount: p.amount,
          date: p.createdAt
        };
      });

    return NextResponse.json({
      stats: {
        totalUsers: totalUsersCount,
        totalLeads: allLeadsCount,
        totalRevenue,
        dailyRevenue,
        monthlyRevenue
      },
      planDistribution,
      userUsage: userStats,
      recentActivity,
      recentPurchases
    });
  } catch (error: any) {
    console.error("ADMIN STATS CRITICAL FAILURE:", {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: error.message || "Failed to fetch admin statistics",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
