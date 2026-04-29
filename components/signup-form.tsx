"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Zap, Loader2, ArrowRight, Home as HomeIcon,
  UserPlus, Sparkles, Target, Building2, Eye, EyeOff,
  CheckCircle2, Phone, Mail, User, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { plans } from "./landing/constants";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const billingParam = searchParams.get("billing");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingMessages = [
    "Initializing your AI-driven sales engine...",
    "Optimizing lead management pathways...",
    "Syncing neural nodes with your business pulse...",
    "Ready to scale: Your Pinglly environment is stabilizing.",
    "Almost there! Preparing your personalized terminal..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoadingOverlay) {
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoadingOverlay]);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const getPriceForPlan = (planName: string) => {
    const found = plans.find((p) => p.name === planName);
    if (!found) return 0;
    let base = found.price as number;
    if (billingParam === "yearly") {
      base = base * 12 * 0.9;
    }
    return base === 0 ? 0 : Math.round(base * 83);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Register or detect existing user
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, phone, password }),
      });
      const registerData = await registerRes.json();

      if (registerRes.status === 409 && registerData.error === "USER_EXISTS") {
        const signInRes = await signIn("credentials", { redirect: false, email, password });
        if (signInRes?.error) throw new Error("Account already exists but login failed. Check your password.");
      } else if (!registerRes.ok) {
        throw new Error(registerData.error || "Registration failed");
      } else {
        const signInRes = await signIn("credentials", { redirect: false, email, password });
        if (signInRes?.error) throw new Error("Login failed after registration");
      }

      localStorage.setItem("onboardingPrefill", JSON.stringify({ name: fullName, email, phone }));

      // 2. Handle paid plan
      if (planParam) {
        const finalPrice = getPriceForPlan(planParam);
        if (finalPrice > 0) {
          const isLoaded = await loadRazorpay();
          if (!isLoaded) throw new Error("Razorpay SDK failed to load.");

          const orderRes = await fetch("/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: finalPrice, planName: planParam }),
          });
          const orderData = await orderRes.json();
          if (orderData.error) throw new Error(orderData.error);

          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: "INR",
            name: "Pinglly CRM",
            description: `Upgrade to ${planParam}`,
            order_id: orderData.orderId,
            prefill: { name: fullName, email, contact: phone },
            handler: async (response: any) => {
              const verifyData = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planName: planParam,
                }),
              }).then((t) => t.json());

              if (verifyData.success) {
                setIsLoading(false);
                setIsLoadingOverlay(true);
                setTimeout(() => router.push("/onboarding"), 5000);
              } else {
                setError("Payment verification failed. Please contact support.");
                setIsLoading(false);
              }
            },
            theme: { color: "#6366f1" },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          setIsLoading(false);
          return;
        }
      }

      // Free plan or no plan
      setIsLoading(false);
      setIsLoadingOverlay(true);
      setTimeout(() => router.push("/onboarding"), 5000);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoadingOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050510] text-center px-6"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
            </div>
            <div className="relative mb-10">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-indigo-500/20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-2 border-indigo-500 rounded-full"
                />
                <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-6 max-w-sm sm:max-w-md w-full">
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingTextIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-base sm:text-xl font-semibold text-white italic h-14 flex items-center justify-center"
                                 >
                  {loadingMessages[loadingTextIndex]}
                </motion.p>
              </AnimatePresence>
              <div className="flex flex-col items-center gap-3">
                <div className="h-1 w-48 sm:w-64 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20"
                  style={{ fontFamily: "var(--font-manrope)" }}>
                  Establishing Neural Link
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card */}
      <div className="w-full max-w-[1100px] flex flex-col lg:flex-row overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0a0a1a]/60 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] backdrop-blur-[40px]">

        {/* Left Branding — hidden on mobile */}
        <div className="hidden lg:flex flex-1 flex-col p-12 overflow-hidden border-r border-white/10 relative">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
              alt="Growth Preview"
              className="w-full h-full object-cover opacity-30 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#050510]/95 via-[#050510]/50 to-transparent" />
          </div>

          <Link href="/" className="relative z-10 block">
            <div className="flex flex-col items-start mb-12">
              <img src="/assets/logo.png" alt="Pinglly" className="h-10 object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
              <span className="text-[8px] font-bold tracking-[0.4em] text-indigo-400 mt-1 uppercase ml-1"
                style={{ fontFamily: "var(--font-manrope)" }}>by TechEcho</span>
            </div>
          </Link>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--font-montserrat)" }}>
              <UserPlus className="h-3 w-3" /> Join the Next Generation
            </div>
            <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight italic"
              style={{ fontFamily: "var(--font-manrope)" }}>
              Ready to<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                Dominate.
              </span>
            </h2>
            <p className="text-base text-white/60 max-w-[360px] leading-relaxed"
                           Initialize your high-performance CRM node. Join 12,000+ sales experts.
            </p>
          </div>

          <div className="relative z-10 mt-auto flex items-center gap-4">
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"
              ].map((url, i) => (
                <img key={i} src={url} alt="User" className="h-9 w-9 rounded-full border-2 border-indigo-500/30 object-cover" />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest"
              style={{ fontFamily: "var(--font-montserrat)" }}>Joined by 12,000+ experts</span>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="flex-1 p-6 sm:p-10 lg:p-14 flex flex-col justify-center bg-white/[0.01] relative">
          <Link
            href="/"
            className="absolute top-5 right-5 sm:top-7 sm:right-7 flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:bg-indigo-600 hover:text-white transition-all z-50"
          >
            <HomeIcon className="h-4 w-4" />
          </Link>

          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <img src="/assets/logo.png" alt="Pinglly" className="h-8 object-contain" />
            <span className="text-[9px] font-bold tracking-[0.3em] text-indigo-400 uppercase"
              style={{ fontFamily: "var(--font-manrope)" }}>by TechEcho</span>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest"
                style={{ fontFamily: "var(--font-manrope)" }}>Protocol Start</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight"
              style={{ fontFamily: "var(--font-manrope)" }}>
              Phase: Join
            </h1>
            <p className="text-sm text-white/40 leading-relaxed"               Create your account to access the platform.
            </p>
            {planParam && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <CheckCircle2 className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs font-semibold text-orange-300"
                  style={{ fontFamily: "var(--font-montserrat)" }}>
                  Plan: {planParam}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20 leading-relaxed">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5"
                  style={{ fontFamily: "var(--font-montserrat)" }}>
                  <User className="h-3 w-3" /> Full Name
                </Label>
                <Input
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="h-11 rounded-xl border-white/10 bg-white/[0.05] px-4 text-white text-sm placeholder:text-white/20 focus:border-indigo-500/50 transition-colors"
                                 />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5"
                  style={{ fontFamily: "var(--font-montserrat)" }}>
                  <Phone className="h-3 w-3" /> Phone
                </Label>
                <Input
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 00000 00000"
                  className="h-11 rounded-xl border-white/10 bg-white/[0.05] px-4 text-white text-sm placeholder:text-white/20 focus:border-indigo-500/50 transition-colors"
                                 />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5"
                style={{ fontFamily: "var(--font-montserrat)" }}>
                <Mail className="h-3 w-3" /> Email Address
              </Label>
              <Input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="h-11 rounded-xl border-white/10 bg-white/[0.05] px-4 text-white text-sm placeholder:text-white/20 focus:border-indigo-500/50 transition-colors"
                             />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1.5"
                style={{ fontFamily: "var(--font-montserrat)" }}>
                <Lock className="h-3 w-3" /> Password
              </Label>
              <div className="relative">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="h-11 rounded-xl border-white/10 bg-white/[0.05] px-4 pr-12 text-white text-sm placeholder:text-white/20 focus:border-indigo-500/50 transition-colors"
                                 />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "group relative h-14 w-full overflow-hidden rounded-2xl font-bold text-sm tracking-widest uppercase transition-all",
                "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
                "shadow-[0_8px_32px_-8px_rgba(99,102,241,0.5)] hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.7)]",
                "hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              )}
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span>{planParam && getPriceForPlan(planParam) > 0 ? "Pay & Create Account" : "Create Account"}</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-white/30"             Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
