import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Lead } from "@/models/lead";

export const dynamic = "force-dynamic";

type SessionUser = {
  role?: string;
  orgRole?: string;
  organizationId?: string;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.orgRole === "client" || user.orgRole === "member") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!user.organizationId) {
      return NextResponse.json({ error: "No active organization found." }, { status: 400 });
    }

    await dbConnect();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim();
    const query: Record<string, unknown> = {
      organizationId: user.organizationId,
      status: "Converted (Won)",
    };

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { fullName: regex },
        { company: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const leads = await Lead.find(query)
      .select("fullName company designation email phone product city dealDetails clientInviteToken clientUserId contractDocument createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    const clients = leads.map((lead) => ({
      id: lead._id.toString(),
      fullName: lead.fullName,
      company: lead.company,
      designation: lead.designation,
      email: lead.email,
      phone: lead.phone,
      product: lead.product,
      city: lead.city,
      dealDetails: lead.dealDetails,
      clientInviteToken: lead.clientInviteToken,
      clientUserId: lead.clientUserId,
      hasContract: Boolean(lead.contractDocument?.url),
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Fetch Lead Clients Error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
