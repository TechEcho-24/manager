"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Loader2, UserPlus, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function InviteModal({ onClose }: { onClose: () => void }) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-xl">Invite Team Member</CardTitle>
            <CardDescription className="mt-1.5">Generate an invite link to give access to your workspace.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="h-10 px-3 rounded-md border text-sm flex-1 bg-background text-foreground"
              >
                <option value="member">Task Member</option>
                <option value="staff">Staff (Full Access)</option>
                <option value="client">Client</option>
              </select>
              <Button onClick={generateInvite} disabled={generating} className="gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Generate Link
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
        </CardContent>
      </Card>
    </div>
  );
}
