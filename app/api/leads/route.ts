import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Lead } from "@/models/lead";
import { subDays, startOfMonth, subMonths, startOfDay, endOfDay } from "date-fns";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;

    // Filters
    const organizationId = (session.user as any).organizationId;
    const query: any = { organizationId: organizationId };

    const search = searchParams.get("search");
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { company: searchRegex },
      ];
    }

    const status = searchParams.get("status");
    if (status && status !== "All") {
      query.status = status;
    }

    const priority = searchParams.get("priority");
    if (priority && priority !== "All") {
      query.priority = priority;
    }

    const leadSource = searchParams.get("leadSource");
    if (leadSource && leadSource !== "All") {
      query.leadSource = leadSource;
    }

    const dateRange = searchParams.get("dateRange");
    if (dateRange && dateRange !== "All") {
      const now = new Date();
      if (dateRange === "This Week") {
        query.createdAt = { $gte: startOfDay(subDays(now, 7)) };
      } else if (dateRange === "This Month") {
        query.createdAt = { $gte: startOfMonth(now) };
      } else if (dateRange === "Last 3 Months") {
        query.createdAt = { $gte: subMonths(now, 3) };
      }
    }

    // Follow-up specific filters
    const hasFollowup = searchParams.get("hasFollowup");
    if (hasFollowup === "true") {
      query.nextFollowupDate = { $exists: true, $ne: "" };
    } else if (hasFollowup === "false") {
      query.$or = [
        { nextFollowupDate: { $exists: false } },
        { nextFollowupDate: "" },
        { nextFollowupDate: null }
      ];
    }

    const followUpRange = searchParams.get("followUpRange");
    if (followUpRange) {
      const now = startOfDay(new Date());
      if (followUpRange === "Overdue") {
        query.nextFollowupDate = { $lt: now.toISOString() };
      } else if (followUpRange === "Today") {
        query.nextFollowupDate = { 
          $gte: now.toISOString(), 
          $lte: endOfDay(now).toISOString() 
        };
      } else if (followUpRange === "Upcoming") {
        query.nextFollowupDate = { $gt: endOfDay(now).toISOString() };
      }
    }

    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Lead.countDocuments(query),
    ]);

    // Map _id to id
    const mappedLeads = leads.map((lead) => ({
      ...lead,
      id: lead._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({
      leads: mappedLeads,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch Leads Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

import { checkLeadLimit } from "@/lib/plan-validator";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const organizationId = (session.user as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: "Organization not found. Please complete onboarding." }, { status: 400 });
    }

    // Check Plan Limit
    const planStatus = await checkLeadLimit(organizationId);
    if (planStatus.isBlocked) {
      return NextResponse.json({ 
        error: planStatus.message, 
        limitReached: true 
      }, { status: 403 });
    }

    const data = await request.json();

    const lead = new Lead({
      ...data,
      userId: (session.user as any).id,
      organizationId: organizationId,
      activityTimeline: [
        {
          action: "Lead created",
          description: "Lead added via system dashboard",
          createdAt: new Date(),
          createdBy: session.user.name || "System",
        }
      ]
    });

    await lead.save();
    return NextResponse.json({ 
      message: "Lead created successfully", 
      id: lead._id,
      warning: planStatus.isWarning ? planStatus.message : undefined
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ids } = await request.json();
    const organizationId = (session.user as any).organizationId;
    await Lead.deleteMany({ _id: { $in: ids }, organizationId: organizationId }); // DELETE ONLY ORG DATA

    return NextResponse.json({ message: "Leads deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete leads" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ids, status } = await request.json();
    const organizationId = (session.user as any).organizationId;

    await Lead.updateMany(
      { _id: { $in: ids }, organizationId: organizationId }, // UPDATE ONLY ORG DATA
      { 
        $set: { status, updatedAt: new Date() },
        $push: { activityTimeline: { action: "Status updated", description: `Updated to ${status}`, createdAt: new Date(), createdBy: session.user.name } }
      }
    );

    return NextResponse.json({ message: "Leads updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update leads" }, { status: 500 });
  }
}
