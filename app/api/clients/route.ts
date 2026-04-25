import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Client } from "@/models/client";
import { auth } from "@/auth";

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clients = await Client.find({}).sort({ joinedAt: -1 });
    return NextResponse.json({ clients });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const client = new Client(data);
    await client.save();

    return NextResponse.json({ message: "Client onboarded successfully", client }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
