import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Lead } from "@/models/lead";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

// Upload / update contract document
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const data = await request.json();
    const { url, publicId, fileName } = data;

    if (!url) {
      return NextResponse.json({ error: "Document URL is required" }, { status: 400 });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    lead.contractDocument = {
      url,
      publicId: publicId || undefined,
      uploadedAt: new Date(),
      fileName: fileName || "Contract Document",
    };
    lead.markModified("contractDocument");

    lead.activityTimeline.push({
      action: "Contract uploaded",
      description: `Legal contract document "${fileName || "Contract"}" was uploaded`,
      createdAt: new Date(),
      createdBy: session.user.name || "System",
    });

    await lead.save();

    return NextResponse.json({ 
      success: true, 
      contractDocument: lead.contractDocument 
    });
  } catch (error) {
    console.error("Contract Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload contract" }, { status: 500 });
  }
}

// Delete contract document
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const { id } = await params;

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    lead.contractDocument = undefined;
    lead.markModified("contractDocument");

    lead.activityTimeline.push({
      action: "Contract removed",
      description: "Legal contract document was removed",
      createdAt: new Date(),
      createdBy: session.user.name || "System",
    });

    await lead.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contract Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete contract" }, { status: 500 });
  }
}
