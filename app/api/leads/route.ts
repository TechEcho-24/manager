import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Lead } from "@/models/lead";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
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

    // Filters - STRICT USER ISOLATION (Except for Super Admin)
    const user = session.user as any;
    const userId = user.id;
    const isAdmin = user.email === "techecho.kanpur@gmail.com";

    if (!userId) return NextResponse.json({ error: "Session identity failure" }, { status: 401 });
    
    // Admin gets all data, clients only get their own
    const query: any = isAdmin ? {} : { userId: userId };

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
  let session: any = null;
  try {
    await dbConnect();
    session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let organizationId = (session.user as any).organizationId;
    
    // Fallback 1: Fetch from DB if session is stale
    if (!organizationId && session.user.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user?.organizationId) {
        organizationId = user.organizationId;
      }
    }

    // Fallback 2: AUTO-CREATE ORG if still missing
    if (!organizationId && session.user.email) {
      console.log("Auto-creating organization for user:", session.user.email);
      const newOrg = await Organization.create({
        name: `${session.user.name || session.user.email.split('@')[0]}'s Workspace`,
        email: session.user.email,
        phone: "0000000000",
        ownerId: session.user.email,
        plan: "starter",
        subscription: { status: "trial" }
      });
      
      organizationId = newOrg._id.toString();
      
      // Update User record
      await User.updateOne(
        { email: session.user.email },
        { $set: { organizationId: organizationId } }
      );
    }

    if (!organizationId) {
      return NextResponse.json({ error: "System failed to establish workspace identity." }, { status: 500 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
       return NextResponse.json({ error: "User identity required" }, { status: 401 });
    }

    // Check Plan Limit
    const planStatus = await checkLeadLimit(organizationId, userId);
    if (planStatus.isBlocked) {
      return NextResponse.json({ 
        error: planStatus.message, 
        limitReached: true 
      }, { status: 403 });
    }

    const data = await request.json();
    
    // DEBUG LOGS
    console.log("Lead Creation Request:", {
      userId,
      organizationId,
      payload: data
    });

    const lead = new Lead({
      ...data,
      userId: userId, // FORCE FROM SESSION
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
    console.error("CRITICAL: Lead Creation API Crash:", {
      message: error.message,
      stack: error.stack,
      user: session?.user?.email || "Unknown",
      orgId: (session?.user as any)?.organizationId || "Unknown"
    });
    
    return NextResponse.json({ 
      error: error.message || "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ids } = await request.json();
    const userId = (session.user as any).id;
    await Lead.deleteMany({ _id: { $in: ids }, userId: userId }); // DELETE ONLY USER DATA

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
    const userId = (session.user as any).id;
    const organizationId = (session.user as any).organizationId;

    await Lead.updateMany(
      { _id: { $in: ids }, userId: userId }, // UPDATE ONLY USER DATA
      { 
        $set: { status, updatedAt: new Date() },
        $push: { activityTimeline: { action: "Status updated", description: `Updated to ${status}`, createdAt: new Date(), createdBy: session.user.name } }
      }
    );

    // Auto-generate client invite when lead is converted
    let inviteLinks: Record<string, string> = {};
    if (status === "Converted (Won)" && organizationId) {
      const { Invitation } = await import("@/models/invitation");
      const crypto = await import("crypto");
      const leads = await Lead.find({ _id: { $in: ids }, userId: userId, clientInviteToken: { $exists: false } });
      
      for (const lead of leads) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days for client invites

        await Invitation.create({
          organizationId,
          token,
          role: "client",
          expiresAt,
        });

        lead.clientInviteToken = token;
        await lead.save();

        const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
        inviteLinks[lead._id.toString()] = `${baseUrl}/invite/${token}`;
      }
    }

    return NextResponse.json({ 
      message: "Leads updated successfully",
      inviteLinks: Object.keys(inviteLinks).length > 0 ? inviteLinks : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update leads" }, { status: 500 });
  }
}
