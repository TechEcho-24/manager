import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // In our simplified system, organization ownerId is mapped to email
    const email = session.user.email.toLowerCase().trim();
    const org = await Organization.findOne({ ownerId: email }).lean();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      logoUrl: org.logoUrl,
      primaryColor: org.primaryColor,
    });
  } catch (error: any) {
    console.error("GET Branding API Error:", error);
    return NextResponse.json({ error: "Failed to fetch branding" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    
    const email = session.user.email.toLowerCase().trim();
    const org = await Organization.findOne({ ownerId: email });

    console.log("PATCH /api/organization/branding - Received data:", data);

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (data.logoUrl !== undefined) org.logoUrl = data.logoUrl;
    if (data.primaryColor !== undefined) org.primaryColor = data.primaryColor;

    console.log("PATCH /api/organization/branding - Saving org with logoUrl:", org.logoUrl, "primaryColor:", org.primaryColor);

    await org.save();

    console.log("PATCH /api/organization/branding - Successfully saved");

    return NextResponse.json({ success: true, message: "Branding updated successfully" });
  } catch (error: any) {
    console.error("PATCH Branding API Error:", error);
    return NextResponse.json({ error: "Failed to update branding" }, { status: 500 });
  }
}
