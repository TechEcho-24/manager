import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Organization } from "@/models/organization";

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    const email = data.email?.toLowerCase().trim();
    const name = data.name?.trim();
    const phone = data.phone?.trim();

    if (!email || !name || !phone) {
      return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 });
    }

    // Check if organization already exists for this email
    let org = await Organization.findOne({ ownerId: email });
    if (!org) {
      org = await Organization.create({
        name: name, // Placeholder until onboarding where they enter companyName
        email: email,
        phone: phone,
        ownerId: email,
        plan: "free",
        subscription: {
          status: "trial", // Temporary, will be updated to active upon payment
        },
      });
    } else {
      org.name = name;
      org.phone = phone;
      await org.save();
    }

    return NextResponse.json({ success: true, organizationId: org._id });
  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
