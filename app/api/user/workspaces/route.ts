import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build the list of organizations the user is a part of
    let userOrgs = user.organizations || [];

    // Fallback: If migration hasn't happened but they have an organizationId
    if (userOrgs.length === 0 && user.organizationId) {
      userOrgs = [{
        organizationId: user.organizationId,
        orgRole: user.orgRole || "owner",
        joinedAt: new Date()
      }];
    }

    if (userOrgs.length === 0) {
      return NextResponse.json({ workspaces: [] });
    }

    const orgIds = userOrgs.map(org => org.organizationId);

    // Fetch organization details
    const organizations = await Organization.find({ _id: { $in: orgIds } })
      .select("_id name logoUrl plan")
      .lean();

    // Combine user role with organization details
    const workspaces = organizations.map(org => {
      const orgIdString = org._id.toString();
      const userOrgDetails = userOrgs.find(uo => uo.organizationId === orgIdString);
      return {
        id: orgIdString,
        name: org.name,
        logoUrl: org.logoUrl || null,
        plan: org.plan || "starter",
        role: userOrgDetails?.orgRole || "member",
        isActive: user.organizationId === orgIdString
      };
    });

    return NextResponse.json({ workspaces });
  } catch (error: any) {
    console.error("GET Workspaces Error:", error);
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
  }
}
