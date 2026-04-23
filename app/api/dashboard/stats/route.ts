import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Lead } from "@/models/lead";
import { subDays, startOfDay, endOfDay, addDays } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);
    const nextSevenDays = addDays(now, 7);

    // 1. Basic Counts
    const totalLeads = await Lead.countDocuments();
    
    const newLeadsThisWeek = await Lead.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      status: "New",
    });

    const contacted = await Lead.countDocuments({ status: "Contacted" });
    const interested = await Lead.countDocuments({ status: "Interested" });
    const followUpRequired = await Lead.countDocuments({ status: "Follow-up Required" });
    const converted = await Lead.countDocuments({ status: "Converted (Won)" });
    const lost = await Lead.countDocuments({ status: "Lost" });

    // 2. Response Rate Calculation
    // Total leads minus "New"
    const respondedLeads = await Lead.countDocuments({
      status: { $nin: ["New"] },
    });
    
    // Of the responded, how many are NOT "Not Interested" or "Lost"
    // Wait, the prompt says: "percentage of leads that are not 'New' or 'Not Interested'"
    // This could mean: (Total - New - Not Interested) / (Total - New)
    // Let's compute (Responded & not Not Interested) / Responded
    const positiveResponseLeads = await Lead.countDocuments({
      status: { $nin: ["New", "Not Interested"] }
    });

    const responseRate = respondedLeads > 0 
      ? Math.round((positiveResponseLeads / respondedLeads) * 100) 
      : 0;

    // 3. Leads by Status (Bar chart data)
    const leadsByStatusAggregation = await Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    const leadsByStatus = leadsByStatusAggregation.map(item => ({
      status: item._id,
      count: item.count
    }));

    // 4. Leads added per day for the last 30 days (Line chart data)
    // Ensure we fill in empty days
    const leadsPerDayAggregation = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Fill in missing days with 0
    const leadsPerDay = [];
    for (let i = 30; i >= 0; i--) {
      const date = subDays(now, i);
      const dateString = date.toISOString().split('T')[0];
      const found = leadsPerDayAggregation.find(item => item._id === dateString);
      leadsPerDay.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: found ? found.count : 0
      });
    }

    // 5. Recent Activity (last 5 leads added or updated)
    const recentActivityRaw = await Lead.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('fullName status updatedAt createdAt leadId activityTimeline')
      .lean();

    const recentActivity = recentActivityRaw.map(lead => ({
      id: lead._id.toString(),
      leadId: lead.leadId,
      name: lead.fullName,
      status: lead.status,
      // Find the most recent action if any, otherwise default to "Lead updated"
      action: lead.activityTimeline && lead.activityTimeline.length > 0 
        ? lead.activityTimeline[lead.activityTimeline.length - 1].action 
        : (lead.createdAt.getTime() === lead.updatedAt.getTime() ? "Lead created" : "Lead updated"),
      time: lead.updatedAt,
    }));

    // 6. Upcoming Follow-ups (leads where nextFollowupDate is within next 7 days)
    const upcomingFollowUpsRaw = await Lead.find({
      nextFollowupDate: {
        $gte: startOfDay(now),
        $lte: endOfDay(nextSevenDays)
      },
      status: { $nin: ["Converted (Won)", "Lost", "Not Interested"] } // exclude closed ones
    })
      .sort({ nextFollowupDate: 1 })
      .limit(10)
      .select('fullName status nextFollowupDate company')
      .lean();

    const upcomingFollowUps = upcomingFollowUpsRaw.map(lead => ({
      id: lead._id.toString(),
      name: lead.fullName,
      company: lead.company,
      status: lead.status,
      date: lead.nextFollowupDate,
    }));

    return NextResponse.json({
      stats: {
        totalLeads,
        newLeadsThisWeek,
        contacted,
        interested,
        followUpRequired,
        converted,
        lost,
        responseRate,
      },
      charts: {
        leadsByStatus,
        leadsPerDay,
      },
      lists: {
        recentActivity,
        upcomingFollowUps,
      }
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
