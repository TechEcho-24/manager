import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Task } from "@/models/task";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "mock_cron_secret";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const now = new Date();
    const todayDow = now.getDay(); // 0=Sun..6=Sat
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Delete expired recurring tasks (older than 7 days)
    const deleted = await Task.deleteMany({
      isRecurring: true,
      expiresAt: { $lt: now, $exists: true },
    });

    // 2. Find all recurring groups that should have a task today
    const recurringGroups = await Task.aggregate([
      { $match: { isRecurring: true, recurringDays: todayDow } },
      {
        $group: {
          _id: "$recurringGroupId",
          sample: { $first: "$$ROOT" },
        },
      },
    ]);

    let created = 0;
    for (const group of recurringGroups) {
      // Check if today's instance already exists
      const existsToday = await Task.findOne({
        recurringGroupId: group._id,
        createdAt: { $gte: todayStart },
      });

      if (!existsToday && group.sample) {
        const s = group.sample;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await Task.create({
          tabId: s.tabId,
          text: s.text,
          assignedToUserId: s.assignedToUserId,
          assignedToName: s.assignedToName,
          attachments: s.attachments || [],
          priority: s.priority,
          status: "To Do",
          completed: false,
          isRecurring: true,
          recurringDays: s.recurringDays,
          recurringGroupId: group._id,
          expiresAt,
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      expiredDeleted: deleted.deletedCount,
      recurringCreated: created,
    });
  } catch (error: any) {
    console.error("Cron Recurring Tasks Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
