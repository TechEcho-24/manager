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

    const organizationId = (session.user as any).organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }

    await dbConnect();
    const org = await Organization.findById(organizationId);
    const plan = (org?.plan || "starter") as PlanType;
    
    return NextResponse.json({
      plan,
      config: PLAN_CONFIG[plan]
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
