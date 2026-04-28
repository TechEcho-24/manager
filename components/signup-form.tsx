"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ArrowRight, Star, Mail, Lock, Home as HomeIcon, UserPlus, Sparkles, Target, Building2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingMessages = [
    "Initializing your AI-driven sales engine...",
    "Optimizing lead management pathways for maximum ROI...",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Initial loading for the button
    setTimeout(() => {
      setIsLoading(false);
      setIsLoadingOverlay(true); // Trigger the big loading screen
      
      // Navigate to onboarding after a few seconds of "initializing"
      setTimeout(() => {
        router.push("/onboarding");
      }, 6000);
    }, 800);
  };

  return (
    <>
      <AnimatePresence>
        {isLoadingOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050510] text-center p-6"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
            </div>

            <div className="relative mb-12">
              <div className="h-24 w-24 rounded-full border-2 border-indigo-500/20 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-2 border-indigo-500 rounded-full"
                />
                <Zap className="h-10 w-10 text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-6 max-w-md">
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={loadingTextIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl font-black text-white italic tracking-tight h-16 flex items-center justify-center"
                >
                  {loadingMessages[loadingTextIndex]}
                </motion.h2>
              </AnimatePresence>
              
              <div className="flex flex-col items-center gap-4">
                <div className="h-1 w-64 rounded-full bg-white/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 6, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  />
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Establishing Neural Link</span>
              </div>
            </div>

            {/* Benefit Badges */}
            <div className="mt-20 flex flex-wrap justify-center gap-8 opacity-40">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">AI Automation</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Predictive Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Scale Infrastructure</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex w-full max-w-[1100px] flex-col lg:flex-row overflow-hidden rounded-3xl border border-white/20 bg-[#0a0a1a]/40 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] backdrop-blur-[40px] animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Left Branding Side */}
      <div className="relative hidden lg:flex flex-1 flex-col p-12 overflow-hidden border-r border-white/10">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" 
            alt="Growth Preview" 
            className="w-full h-full object-cover opacity-40 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#050510]/95 via-[#050510]/40 to-transparent" />
        </div>

        <Link href="/" className="relative z-10 block group">
          <div className="flex flex-col items-start mb-12 hover:scale-105 transition-transform">
            <img src="/assets/logo.png" alt="Pinglly Logo" className="h-12 object-contain drop-shadow-[0_0_20px_rgba(79,70,229,0.6)]" />
            <span className="text-[8px] font-black tracking-[0.4em] text-indigo-400 mt-1 uppercase ml-1">by TechEcho</span>
          </div>
        </Link>
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              <UserPlus className="h-3 w-3" />
              Join the Next Generation
            </div>
            <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl italic">
              Ready to <br/>
              <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#818cf8_0%,#c084fc_50%,#22d3ee_100%)]">Dominate.</span>
            </h2>
            <p className="text-xl text-white/70 max-w-[380px] font-medium leading-relaxed drop-shadow-lg">
              Initialize your high-performance CRM node in seconds.
            </p>
          </div>

          <div className="mt-auto relative z-10 flex items-center gap-5">
            <div className="flex -space-x-3">
               {[
                 "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
                 "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop",
                 "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop"
               ].map((url, i) => (
                 <Avatar key={i} className="h-10 w-10 border-2 border-white/10">
                   <AvatarImage src={url} />
                   <AvatarFallback>U</AvatarFallback>
                 </Avatar>
               ))}
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Joined by 12,000+ experts</span>
          </div>
      </div>

      {/* Right Content Side */}
      <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white/[0.02] relative">
        <Link 
          href="/" 
          className="absolute top-8 right-8 flex items-center justify-center h-12 w-12 rounded-2xl bg-white/5 border border-white/5 text-white/30 hover:bg-indigo-600 hover:text-white transition-all z-50 shadow-2xl"
        >
          <HomeIcon className="h-5 w-5" />
        </Link>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Protocol Start</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter italic">Phase: Join</h1>
          <p className="text-lg text-white/40 font-medium">Click below to initialize your secure onboarding protocol.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="group relative h-20 w-full overflow-hidden rounded-[1.5rem] bg-white font-black text-black shadow-[0_20px_40px_-12px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="uppercase tracking-[0.4em] text-sm">Initialize Onboarding</span>
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
              </div>
            )}
          </Button>
        </form>

        <p className="mt-12 text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-white underline ml-1">Sign In</Link>
        </p>
      </div>
    </div>
    </>
  );
}
