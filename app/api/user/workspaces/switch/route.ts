import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/user";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle legacy users by quickly checking if they only have one workspace
    // and it's the one they're switching to. Otherwise verify against organizations array.
    let targetRole = null;

    if (user.organizations && user.organizations.length > 0) {
      const targetOrg = user.organizations.find(org => org.organizationId === organizationId);
      if (!targetOrg) {
        return NextResponse.json({ error: "You do not have access to this workspace" }, { status: 403 });
      }
      targetRole = targetOrg.orgRole;
    } else {
      // Legacy fallback
      if (user.organizationId === organizationId) {
        targetRole = user.orgRole || "owner";
      } else {
        return NextResponse.json({ error: "You do not have access to this workspace" }, { status: 403 });
      }
    }

    // Update the active workspace
    user.organizationId = organizationId;
    user.orgRole = targetRole;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      organizationId, 
      role: targetRole 
    });
  } catch (error: any) {
    console.error("POST Switch Workspace API Error:", error);
    return NextResponse.json({ error: "Failed to switch workspace" }, { status: 500 });
  }
}
