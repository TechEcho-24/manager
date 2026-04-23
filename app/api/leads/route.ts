import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Lead } from "@/models/lead";
import { subDays, startOfMonth, subMonths, startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await dbConnect();

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
    const query: any = {};

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

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    // Create the lead
    const lead = new Lead({
      ...data,
      activityTimeline: [
        {
          action: "Lead created",
          description: "Lead added via system dashboard",
          createdAt: new Date(),
          createdBy: "System",
        }
      ]
    });

    await lead.save();

    return NextResponse.json({ message: "Lead created successfully", lead: { ...lead.toObject(), id: lead._id.toString() } }, { status: 201 });
  } catch (error) {
    console.error("Create Lead Error:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    await Lead.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({ message: "Leads deleted successfully" });
  } catch (error) {
    console.error("Delete Leads Error:", error);
    return NextResponse.json(
      { error: "Failed to delete leads" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const { ids, status } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }
    if (!status) {
      return NextResponse.json({ error: "No status provided" }, { status: 400 });
    }

    // Prepare activity timeline entry
    const activityEntry = {
      action: "Status updated",
      description: `Status changed to ${status} via bulk update`,
      createdAt: new Date(),
      createdBy: "System",
    };

    await Lead.updateMany(
      { _id: { $in: ids } },
      { 
        $set: { status, updatedAt: new Date() },
        $push: { activityTimeline: activityEntry }
      }
    );

    return NextResponse.json({ message: "Leads updated successfully" });
  } catch (error) {
    console.error("Update Leads Error:", error);
    return NextResponse.json(
      { error: "Failed to update leads" },
      { status: 500 }
    );
  }
}
