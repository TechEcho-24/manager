"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Pricing } from "@/components/landing/pricing";
import { plans } from "@/components/landing/constants";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, RefreshCw, Calendar, Loader2, Zap } from "lucide-react";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  
  const [selectedPlan, setSelectedPlan] = useState("Growth");
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<{ finalPrice: number; planName: string } | null>(null);
  const [autoRenew, setAutoRenew] = useState<boolean | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const getPriceForPlan = (planName: string, isYearly: boolean) => {
    const found = plans.find((p) => p.name === planName);
    if (!found) return 0;
    let base = found.price as number;
    if (isYearly) {
      base = base * 12 * 0.9;
    }
    return base === 0 ? 0 : Math.round(base * 83);
  };

  const handlePlanSelect = (planName: string, isYearly: boolean) => {
    const finalPrice = getPriceForPlan(planName, isYearly);
    
    if (finalPrice > 0) {
      setPendingPaymentData({ finalPrice, planName });
      setShowBillingModal(true);
    } else {
      // Free plan selected (if any exist)
      // Just redirect to onboarding
      setIsLoadingOverlay(true);
      setTimeout(() => router.push("/onboarding"), 2000);
    }
  };

  const proceedWithPayment = async (selectedAutoRenew: boolean) => {
    if (!pendingPaymentData) return;
    setBillingLoading(true);
    setAutoRenew(selectedAutoRenew);
    const { finalPrice, planName } = pendingPaymentData;

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load.");

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalPrice, planName, autoRenew: selectedAutoRenew }),
      });
      const orderData = await orderRes.json();
      if (orderData.error) throw new Error(orderData.error);

      setShowBillingModal(false);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Pinglly CRM",
        description: `${planName} — ${selectedAutoRenew ? "Auto Pay" : "Manual Renewal"}`,
        order_id: orderData.orderId,
        prefill: { 
          name: session?.user?.name || "", 
          email: session?.user?.email || "" 
        },
        handler: async (response: any) => {
          const verifyData = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName,
            }),
          }).then((t) => t.json());

          if (verifyData.success) {
            await updateSession({ paymentCompleted: true });
            setBillingLoading(false);
            setIsLoadingOverlay(true);
            setTimeout(() => router.push("/onboarding"), 2000);
          } else {
            alert("Payment verification failed. Please contact support.");
            setBillingLoading(false);
          }
        },
        modal: {
          ondismiss: () => setBillingLoading(false),
        },
        theme: { color: "#6366f1" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Payment failed.");
      setBillingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-16">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Workspace</h1>
          <p className="text-white/60">Select a plan to provision your new organization. You will become its owner.</p>
        </div>
      </div>
      
      {/* Reusing the beautiful landing page pricing component */}
      <Pricing 
        selectedPlan={selectedPlan} 
        setSelectedPlan={setSelectedPlan} 
        onPlanSelect={handlePlanSelect}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoadingOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050510] text-center px-6"
          >
            <div className="relative mb-10">
              <div className="h-24 w-24 rounded-full border-2 border-indigo-500/20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-2 border-indigo-500 rounded-full"
                />
                <Zap className="h-10 w-10 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <p className="text-xl font-semibold text-white italic">
              Preparing Onboarding...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Billing Method Modal */}
      <AnimatePresence>
        {showBillingModal && pendingPaymentData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a1a] p-8 shadow-2xl"
            >
              <button
                onClick={() => { setShowBillingModal(false); setPendingPaymentData(null); }}
                className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-4">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-400 tracking-widest">PAYMENT METHOD</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Choose Billing Type</h2>
                <p className="text-sm text-white/40">
                  Plan: <span className="text-indigo-400 font-bold">{pendingPaymentData.planName}</span>
                  {" · "}₹{pendingPaymentData.finalPrice}/month
                </p>
              </div>

              <div className="space-y-3">
                {/* AutoPay Option */}
                <button
                  onClick={() => proceedWithPayment(true)}
                  disabled={billingLoading}
                  className="w-full group relative flex items-start gap-4 p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/60 transition-all text-left"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <RefreshCw className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-white text-sm">Enable AutoPay</span>
                      <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full tracking-widest">RECOMMENDED</span>
                    </div>
                    <p className="text-xs text-white/50">Auto-renews every month. You can <strong className="text-white/70">cancel or pause anytime</strong> from your settings.</p>
                  </div>
                  {billingLoading && autoRenew === true && (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0 mt-1" />
                  )}
                </button>

                {/* Manual Option */}
                <button
                  onClick={() => proceedWithPayment(false)}
                  disabled={billingLoading}
                  className="w-full group relative flex items-start gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all text-left"
                >
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-white/40 group-hover:text-white/70 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <span className="font-black text-white text-sm block mb-1">Manual Renew</span>
                    <p className="text-xs text-white/50">Pay once, renew manually each month. <strong className="text-white/70">You can switch to AutoPay later.</strong></p>
                  </div>
                  {billingLoading && autoRenew === false && (
                    <Loader2 className="h-4 w-4 animate-spin text-white/40 shrink-0 mt-1" />
                  )}
                </button>
              </div>

              <p className="mt-6 text-center text-[10px] text-white/25">
                Secured by Razorpay · 256-bit SSL encrypted
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
