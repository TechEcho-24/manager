"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Zap, AlertTriangle, RefreshCw, Loader2, X, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SubStatus {
  status: string;
  daysLeft: number;
  daysUntilExpiry: number;
  autoRenew: boolean;
  currentPeriodEnd: string | null;
  plan: string;
}

// ─── Sub-component: Trial Active Banner ─────────────────────────────────────
function TrialActiveBanner({
  daysLeft,
  isPaidTrial,
  plan,
  onCancelled,
}: {
  daysLeft: number;
  isPaidTrial: boolean;
  plan: string;
  onCancelled: () => void;
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/subscription/cancel-trial", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        onCancelled();
      }
    } catch {
      // silent
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-600 px-4 py-2.5 text-white text-xs font-bold flex flex-wrap items-center justify-center gap-3 z-50 relative">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-300 shrink-0" />
          <span>
            <span className="text-emerald-300">{daysLeft}-day FREE TRIAL</span>
            {isPaidTrial && (
              <> · <span className="text-white/70 font-normal">{plan.toUpperCase()} plan · Billing starts after trial</span></>
            )}
          </span>
        </div>
        {isPaidTrial && (
          <button
            onClick={() => setConfirmCancel(true)}
            className="text-[10px] font-black text-white/50 hover:text-white/80 underline underline-offset-2 transition-all"
          >
            Cancel Trial
          </button>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <AnimatePresence>
        {confirmCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl border border-red-500/30 bg-zinc-950 p-8 shadow-2xl"
            >
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-5">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-lg font-black text-white mb-2">Cancel Your Trial?</h3>
              <p className="text-sm text-white/50 mb-6">
                You will lose access to all <strong className="text-white/70">{plan.toUpperCase()}</strong> features immediately. Your account will revert to the Starter plan. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm font-black text-white/50 hover:text-white transition-all"
                >
                  Keep Trial
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-400 transition-all"
                >
                  {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {cancelling ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export function TrialBanner() {
  const { data: session } = useSession();
  const [data, setData] = useState<SubStatus | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const orgRole = (session?.user as any)?.orgRole || "owner";

  const fetchStatus = useCallback(() => {
    if (orgRole === "member") return;
    fetch("/api/subscription/status")
      .then((res) => res.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(console.error);
  }, [orgRole]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRenew = async () => {
    if (!data?.plan) return;
    setRenewLoading(true);

    const planPrices: Record<string, number> = {
      pro: 4150,
      growth: 2490,
      starter: 0,
    };

    const amount = planPrices[data.plan] || 4150;

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Razorpay failed to load");

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, planName: data.plan, autoRenew: false }),
      });
      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Pinglly CRM",
        description: `Renew ${data.plan} plan`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyData = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName: data.plan,
            }),
          }).then((t) => t.json());

          if (verifyData.success) {
            setRenewLoading(false);
            setDismissed(true);
            setTimeout(fetchStatus, 1000);
          } else {
            setRenewLoading(false);
          }
        },
        modal: { ondismiss: () => setRenewLoading(false) },
        theme: { color: "#6366f1" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Renew error:", err);
      setRenewLoading(false);
    }
  };

  if (orgRole === "member" || !data || dismissed) return null;

  // PAID TRIAL or FREE TRIAL banner
  if (data.status === "trial" && data.daysLeft > 0) {
    const isPaidTrial = !!data.currentPeriodEnd;
    return (
      <TrialActiveBanner
        daysLeft={data.daysLeft}
        isPaidTrial={isPaidTrial}
        plan={data.plan}
        onCancelled={() => { setData(null); setDismissed(true); }}
      />
    );
  }

  // EXPIRY WARNING — manual renew, <= 5 days left
  const showExpiryWarning =
    data.status === "active" &&
    !data.autoRenew &&
    data.daysUntilExpiry <= 5 &&
    data.daysUntilExpiry > 0;

  // EXPIRED / PAST DUE
  const showExpired =
    data.status === "past_due" ||
    data.status === "expired";

  if (!showExpiryWarning && !showExpired) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={cn(
          "w-full px-4 py-3 z-50 relative",
          showExpired
            ? "bg-gradient-to-r from-red-950/90 to-red-900/80 border-b border-red-500/30"
            : "bg-gradient-to-r from-amber-950/90 to-orange-900/80 border-b border-amber-500/30"
        )}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
              showExpired ? "bg-red-500/20" : "bg-amber-500/20"
            )}>
              <AlertTriangle className={cn(
                "h-4 w-4",
                showExpired ? "text-red-400" : "text-amber-400 animate-pulse"
              )} />
            </div>
            <div>
              {showExpired ? (
                <>
                  <p className="text-sm font-black text-white">Your plan has expired</p>
                  <p className="text-xs text-red-300/70">Renew now to restore full access to your CRM workspace.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-black text-white">
                    Your <span className="text-amber-300 uppercase">{data.plan}</span> plan expires in{" "}
                    <span className="text-amber-300">{data.daysUntilExpiry} day{data.daysUntilExpiry !== 1 ? "s" : ""}</span>
                  </p>
                  <p className="text-xs text-amber-300/60">Renew now to avoid losing access. No auto-pay is set up.</p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRenew}
              disabled={renewLoading}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-xl font-black text-xs tracking-widest transition-all",
                showExpired
                  ? "bg-red-500 hover:bg-red-400 text-white shadow-[0_4px_15px_rgba(239,68,68,0.4)]"
                  : "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_4px_15px_rgba(245,158,11,0.4)]",
                renewLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {renewLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {renewLoading ? "Opening..." : "Renew Now"}
            </button>

            {!showExpired && (
              <button
                onClick={() => setDismissed(true)}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
