import { NextResponse } from "next/server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { Organization } from "@/models/organization";
import { getTaskCapabilities, PLAN_CONFIG, PlanType } from "@/lib/plan-config";
import dbConnect from "@/lib/db";
import { User } from "@/models/user";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let organizationId = (session.user as any).organizationId;
    
    await dbConnect();
    
    // Auto-create fallback if missing
    if (!organizationId) {
      const email = session.user.email;
      if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

      const user = await User.findOne({ email });
      
      if (user?.organizationId) {
        organizationId = user.organizationId;
      } else {
        const newOrg = await Organization.create({
          name: `${session.user.name || email.split('@')[0]}'s Workspace`,
          email: email,
          phone: "0000000000",
          ownerId: email,
          plan: "starter",
          subscription: { status: "trial" }
        });
        organizationId = newOrg._id.toString();
        await User.updateOne({ email: email }, { $set: { organizationId } });
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
      config: PLAN_CONFIG[plan],
      taskCapabilities: getTaskCapabilities(plan),
      logoUrl: org?.logoUrl || null,
      industry: org?.industry || null,
      entityType: org?.entityType || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
