import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkLeadLimit } from "@/lib/plan-validator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const organizationId = user.organizationId;
    const userId = user.id;

    if (!organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }

    const status = await checkLeadLimit(organizationId, userId);
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
