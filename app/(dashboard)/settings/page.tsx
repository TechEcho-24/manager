"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Settings as SettingsIcon, Upload, Loader2, Save, Users, Copy, Check, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CldUploadWidget } from "next-cloudinary";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const { data: session } = useSession();
  const orgRole = (session?.user as any)?.orgRole || "owner";
  const { data, isLoading, mutate } = useSWR("/api/organization/branding", fetcher);

  const [formData, setFormData] = useState({
    logoUrl: "",
    primaryColor: "#7c3aed",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastDataString, setLastDataString] = useState("");

  useEffect(() => {
    if (data && !data.error) {
      const dataString = JSON.stringify(data);
      if (dataString !== lastDataString) {
        setFormData({
          logoUrl: data.logoUrl || "",
          primaryColor: data.primaryColor || "#7c3aed",
        });
        setLastDataString(dataString);
      }
    }
  }, [data, lastDataString]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/organization/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast.success("Branding settings updated successfully");
      mutate();
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and branding preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Branding
            </CardTitle>
            <CardDescription>
              Update your logo and primary color to match your brand identity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <Label>Company Logo</Label>
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    options={{
                      cropping: true,
                      croppingAspectRatio: 1,
                      showSkipCropButton: false,
                      clientAllowedFormats: ["png", "jpeg", "jpg", "svg", "webp"],
                      maxFiles: 1,
                    }}
                    onSuccess={(result: any) => {
                      setFormData((prev) => ({
                        ...prev,
                        logoUrl: result?.info?.secure_url || "",
                      }));
                    }}
                  >
                    {({ open }) => (
                      <div
                        onClick={() => open()}
                        className="group relative h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex overflow-hidden"
                      >
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-all" />
                            <span className="mt-2 text-xs text-muted-foreground">
                              Click to upload (SQUARE)
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </CldUploadWidget>
                </div>

                <div className="space-y-4">
                  <Label>Primary Color</Label>
                  <div className="flex gap-3">
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      {[
                        "#7c3aed",
                        "#ff6b35",
                        "#3b82f6",
                        "#10b981",
                        "#f43f5e",
                        "#fbbf24",
                        "#ffffff",
                        "#000000",
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, primaryColor: color }))
                          }
                          className={cn(
                            "h-8 w-full rounded-md transition-all border border-border",
                            formData.primaryColor === color
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                              : "opacity-70 hover:opacity-100",
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="h-8 w-8 rounded-md cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-primary text-white hover:bg-primary/90 font-bold shadow-md"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Settings
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {(orgRole === "owner" || orgRole === "staff") && <TeamManagement />}
      </div>
    </div>
  );
}

function TeamManagement() {
  const { data: teamData, isLoading, mutate } = useSWR("/api/organization/team", fetcher);
  const team = teamData?.members || [];
  
  const [inviteLink, setInviteLink] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteRole, setInviteRole] = useState("member");

  const generateInvite = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/organization/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: inviteRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate invite");
      setInviteLink(data.link);
      toast.success("Invite link generated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border bg-card shadow-sm h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Management
        </CardTitle>
        <CardDescription>
          Invite members to your workspace. Roles determine their level of access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="h-10 px-3 rounded-md border text-sm"
            >
              <option value="member">Task Member</option>
              <option value="staff">Staff (Full Access)</option>
            </select>
            <Button onClick={generateInvite} disabled={generating} className="gap-2">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Generate Invite Link
            </Button>
          </div>

          {inviteLink && (
            <div className="flex items-center gap-2 mt-2 p-2 border rounded-lg bg-muted/30">
              <input type="text" readOnly value={inviteLink} className="flex-1 bg-transparent text-sm outline-none px-2" />
              <Button size="sm" variant="secondary" onClick={copyToClipboard} className="shrink-0 h-8">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-bold mb-3">Current Members ({team.length})</h3>
          {isLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {team.map((member: any) => (
                <div key={member._id} className="flex items-center justify-between p-3 border rounded-xl bg-card">
                  <div>
                    <p className="text-sm font-bold">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-primary/10 text-primary rounded-md">
                    {member.orgRole}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
