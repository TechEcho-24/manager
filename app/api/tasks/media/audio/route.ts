import crypto from "crypto";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import { getTaskCapabilities, PlanType } from "@/lib/plan-config";
import { Organization } from "@/models/organization";
import { TaskTab } from "@/models/taskTab";

export const runtime = "nodejs";

async function verifyTabWriteAccess(tabId: string, userId: string, orgId: string, orgRole: string) {
  const tab = await TaskTab.findOne({ _id: tabId, organizationId: orgId });
  if (!tab) return { error: "Tab not found", status: 404 };

  if (orgRole === "owner" || orgRole === "staff") return { tab };

  const access = tab.accessControl.find((entry: any) => entry.userId === userId);
  if (!access) return { error: "Access denied", status: 403 };
  if (access.permission !== "write") return { error: "Write permission required", status: 403 };

  return { tab };
}

function getCloudinaryCredentials() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) throw new Error("CLOUDINARY_URL is not configured");

  const parsed = new URL(cloudinaryUrl);
  return {
    cloudName: parsed.hostname,
    apiKey: decodeURIComponent(parsed.username),
    apiSecret: decodeURIComponent(parsed.password),
  };
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function parseWaveformPeaks(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return undefined;

  try {
    const peaks = JSON.parse(value);
    if (!Array.isArray(peaks)) return undefined;

    return peaks
      .filter((peak) => typeof peak === "number" && Number.isFinite(peak))
      .slice(0, 96);
  } catch {
    return undefined;
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const tabId = formData.get("tabId");
    const file = formData.get("file");

    if (typeof tabId !== "string" || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Missing tabId or audio file" }, { status: 400 });
    }

    const accessCheck = await verifyTabWriteAccess(
      tabId,
      session.user.id,
      session.user.organizationId,
      (session.user as any).orgRole,
    );
    if (accessCheck.error) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
    }

    const org = await Organization.findById(session.user.organizationId);
    const plan = (org?.plan || "starter") as PlanType;
    const taskCapabilities = getTaskCapabilities(plan);
    if (!taskCapabilities.voice) {
      return NextResponse.json(
        { error: "Voice task attachments are available on the Growth plan and higher." },
        { status: 403 },
      );
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file must be 15MB or smaller" }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "pinglly/task-audio";
    const signature = signCloudinaryParams({ folder, timestamp }, apiSecret);

    const uploadForm = new FormData();
    uploadForm.append("file", file, "task-voice.webm");
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp);
    uploadForm.append("folder", folder);
    uploadForm.append("signature", signature);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: "POST",
      body: uploadForm,
    });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      return NextResponse.json(
        { error: uploadData?.error?.message || "Failed to upload audio" },
        { status: 502 },
      );
    }

    const duration = Number(formData.get("duration"));

    return NextResponse.json({
      attachment: {
        type: "voice",
        url: uploadData.secure_url,
        publicId: uploadData.public_id,
        format: uploadData.format,
        bytes: uploadData.bytes,
        duration: Number.isFinite(duration) ? duration : uploadData.duration,
        waveformPeaks: parseWaveformPeaks(formData.get("waveformPeaks")),
      },
    });
  } catch (error: any) {
    console.error("POST Task Audio Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload audio" }, { status: 500 });
  }
}
