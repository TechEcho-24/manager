"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { data: session, status, update } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      // Send to signup with invite token — they need an account first
      router.push(`/signup?invite=${token}`);
    } else if (status === "authenticated") {
      handleJoin();
    }
  }, [status]);

  const handleJoin = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organization/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to join team");
      }

      // Update the session with new org info
      await update({
        organizationId: data.organizationId,
        orgRole: data.role,
      });

      setSuccess(true);

      // Send invited users to their role-specific landing page.
      const redirectTo = data.role === "client" ? "/payments" : data.role === "member" ? "/tasks" : "/dashboard";
      setTimeout(() => {
        router.push(redirectTo);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Users className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Workspace Invitation</h1>
        
        {loading ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium">Joining workspace...</p>
          </div>
        ) : error ? (
          <div className="py-6 flex flex-col items-center gap-4">
            <XCircle className="h-12 w-12 text-red-500 mb-2" />
            <p className="text-red-500 font-medium">{error}</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4" variant="outline">
              Return to Dashboard
            </Button>
          </div>
        ) : success ? (
          <div className="py-6 flex flex-col items-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
            <p className="text-emerald-500 font-medium">Successfully joined the workspace!</p>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
