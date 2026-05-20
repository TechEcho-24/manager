"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Settings as SettingsIcon, Upload, Loader2, Save, Users, Copy, Check, UserPlus, RefreshCw, Calendar, ShieldCheck, AlertTriangle, Zap, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CldUploadWidget } from "next-cloudinary";
import { cn } from "@/lib/utils";
import { plans } from "@/components/landing/constants";

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

      {/* Subscription Card */}
      {(orgRole === "owner") && <SubscriptionManager />}
    </div>
  );
}

function TeamManagement() {
  const { data: teamData, isLoading, mutate } = useSWR("/api/organization/team", fetcher);
  const allMembers = teamData?.members || [];
  const team = allMembers.filter((m: any) => m.orgRole !== "client");
  
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

// ─── Subscription Manager ─────────────────────────────────────────────────────
function SubscriptionManager() {
  const { data: subData, mutate } = useSWR("/api/subscription/status", fetcher);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"idle" | "verifying" | "subscribing" | "done">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const plan = subData?.plan || "starter";
  const autoRenew = subData?.autoRenew || false;
  const status = subData?.status || "trial";
  const currentPeriodEnd = subData?.currentPeriodEnd;
  const daysUntilExpiry = subData?.daysUntilExpiry ?? null;

  // Derive price from landing page constants (USD * 83 = INR)
  const planConfig = plans.find((p) => p.name.toLowerCase() === plan.toLowerCase());
  const planPrice = planConfig ? Math.round((planConfig.price as number) * 83) : 0;

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handleSwitchToAutoPay = async () => {
    setShowModal(false);
    setStep("verifying");
    setStatusMsg("Opening ₹1 verification payment…");

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay SDK failed to load");

      // Step 1 — ₹1 verification order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1, planName: `${plan}-autopay-verify`, autoRenew: false }),
      });
      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      await new Promise<void>((resolve, reject) => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: "INR",
          name: "Pinglly CRM",
          description: "AutoPay Verification (₹1)",
          order_id: orderData.orderId,
          handler: async () => {
            resolve();
          },
          modal: { ondismiss: () => reject(new Error("Verification cancelled")) },
          theme: { color: "#6366f1" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });

      // Step 2 — Activate AutoPay in DB & Razorpay
      setStep("subscribing");
      setStatusMsg("Setting up recurring billing…");

      const activateRes = await fetch("/api/payments/activate-autopay", { method: "POST" });
      const activateData = await activateRes.json();
      if (activateData.error) throw new Error(activateData.error);

      setStep("done");
      
      let nextPaymentMsg = "";
      if (activateData.nextBillingDate) {
        const dateStr = new Date(activateData.nextBillingDate).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric"
        });
        nextPaymentMsg = ` Aapki next payment ₹${planPrice} ki ${dateStr} ko kategi.`;
      }

      toast.success("AutoPay enabled!" + nextPaymentMsg, { duration: 6000 });
      mutate();
    } catch (err: any) {
      setStep("idle");
      if (err.message !== "Verification cancelled") {
        toast.error(err.message || "Failed to enable AutoPay");
      }
    }
  };

  const PLAN_COLORS: Record<string, string> = {
    pro: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    growth: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    starter: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    enterprise: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <>
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Subscription & Billing
          </CardTitle>
          <CardDescription>
            Manage your plan, billing mode, and payment settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!subData ? (
            <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-5">
              {/* Plan + Status */}
              <div className="flex flex-wrap gap-4 items-center p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Current Plan</p>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-black border px-2.5 py-1 rounded-full uppercase tracking-widest", PLAN_COLORS[plan] || PLAN_COLORS.starter)}>
                      {plan}
                    </span>
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                      status === "active" ? "bg-emerald-500/10 text-emerald-500" :
                      status === "trial" ? "bg-blue-500/10 text-blue-400" :
                      "bg-red-500/10 text-red-400"
                    )}>
                      {status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Billing Mode</p>
                  <div className="flex items-center gap-1.5">
                    {autoRenew
                      ? <><RefreshCw className="h-3.5 w-3.5 text-emerald-500" /><span className="text-sm font-bold text-emerald-500">AutoPay</span></>
                      : <><Calendar className="h-3.5 w-3.5 text-amber-500" /><span className="text-sm font-bold text-amber-500">Manual Renewal</span></>
                    }
                  </div>
                </div>

                {currentPeriodEnd && (
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      {autoRenew ? "Next Billing" : "Expires On"}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {new Date(currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {daysUntilExpiry !== null && (
                        <span className={cn("ml-2 text-[10px] font-black", daysUntilExpiry <= 5 ? "text-red-400" : "text-muted-foreground/50")}>
                          ({daysUntilExpiry}d)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Switch to AutoPay */}
              {!autoRenew && plan !== "starter" && (
                <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                      <RefreshCw className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground">Enable AutoPay</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Razorpay will auto-charge <strong className="text-foreground/80">₹{planPrice}/month</strong>. No more manual renewals. Cancel anytime from Razorpay.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowModal(true)}
                    disabled={step !== "idle"}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest text-xs gap-2"
                  >
                    {step === "verifying" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {step === "subscribing" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {step === "idle" && <RefreshCw className="h-3.5 w-3.5" />}
                    {step === "idle" ? "Switch to AutoPay" : statusMsg}
                  </Button>
                </div>
              )}

              {/* Already on AutoPay */}
              {autoRenew && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-emerald-400">AutoPay is Active</p>
                    <p className="text-xs text-muted-foreground">Razorpay will automatically renew your plan. To cancel, visit your Razorpay payment history.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl border border-indigo-500/30 bg-card p-8 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-all">
              <X className="h-4 w-4" />
            </button>

            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-5">
              <RefreshCw className="h-6 w-6 text-indigo-400" />
            </div>

            <h3 className="text-lg font-black text-foreground mb-2">Enable AutoPay?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Secure setup:
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <span className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="text-xs font-black text-foreground">₹1 Verification</p>
                  <p className="text-[11px] text-muted-foreground">Confirms your payment method</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <span className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-black flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3" />
                </span>
                <div>
                  <p className="text-xs font-black text-foreground">AutoPay Activated</p>
                  <p className="text-[11px] text-muted-foreground">Next billing starts when your plan expires</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 font-bold">
                Cancel
              </Button>
              <Button onClick={handleSwitchToAutoPay} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black gap-2">
                <Zap className="h-3.5 w-3.5" />
                Proceed
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
