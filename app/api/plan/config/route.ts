import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Organization } from "@/models/organization";
import { PLAN_CONFIG, PlanType } from "@/lib/plan-config";
import dbConnect from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let organizationId = (session.user as any).organizationId;
    
    await dbConnect();
    
    // Auto-create fallback if missing
    if (!organizationId) {
      const { User } = await import("@/models/user");
      const user = await User.findOne({ email: session.user.email });
      
      if (user?.organizationId) {
        organizationId = user.organizationId;
      } else {
        const newOrg = await Organization.create({
          name: `${session.user.name || session.user.email?.split('@')[0]}'s Workspace`,
          email: session.user.email,
          phone: "0000000000",
          ownerId: session.user.email as string,
          plan: "starter",
          subscription: { status: "trial" }
        });
        organizationId = newOrg._id.toString();
        await User.updateOne({ email: session.user.email }, { $set: { organizationId } });
      }
    }

    await dbConnect();
    let org = null;
    if (organizationId && organizationId.length === 24) {
      org = await Organization.findById(organizationId);
    }
    const plan = (org?.plan || "starter") as PlanType;
    
    return NextResponse.json({
      plan,
      config: PLAN_CONFIG[plan]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
