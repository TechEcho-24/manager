"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ArrowRight, Star, Mail, Lock, Home as HomeIcon, Cpu } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please verify your email and password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[1100px] flex-col lg:flex-row overflow-hidden rounded-3xl border border-white/20 bg-[#0a0a1a]/40 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] backdrop-blur-[40px] animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Left Branding Side */}
      <div className="relative hidden lg:flex flex-1 flex-col p-12 overflow-hidden border-r border-white/10">
        {/* Actual Image Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/Users/anujsachan/.gemini/antigravity/brain/56d62cc0-ef67-49a3-9d61-361d1a42db1c/crm_dashboard_preview_1777041620913.png" 
            alt="Dashboard Preview" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#050510]/95 via-[#050510]/40 to-transparent" />
          <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
        </div>

        <a href="/" className="relative z-10 block group">
          <div className="flex items-center gap-3 mb-12 hover:scale-105 transition-transform">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.6)]">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">LeadPro</span>
              <span className="text-[8px] font-black tracking-[0.4em] text-indigo-400 mt-1">SaaS Terminal</span>
            </div>
          </div>
        </a>
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              <Star className="h-3 w-3 fill-current" />
              Trusted by 500+ Sales Teams
            </div>
            <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
              Focus on <br/>
              <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#818cf8_0%,#c084fc_50%,#22d3ee_100%)]">Closing Deals.</span>
            </h2>
            <p className="text-xl text-white/70 max-w-[380px] font-medium leading-relaxed drop-shadow-lg">
              Automate your workflow, track every interaction, and grow your revenue with AI-powered insights.
            </p>
          </div>

          <div className="mt-auto relative z-10 flex flex-col gap-8">
          <div className="flex items-center gap-3 text-white/80 drop-shadow-md">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">Active System Security</span>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="flex -space-x-3">
               {[
                 "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
                 "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
                 "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
                 "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop"
               ].map((url, i) => (
                 <Avatar key={i} className="h-12 w-12 border-2 border-white/10 shadow-2xl transition-transform hover:translate-y-[-4px] hover:z-20">
                   <AvatarImage src={url} alt={`User ${i}`} />
                   <AvatarFallback className="bg-indigo-900 font-bold text-white">U{i}</AvatarFallback>
                 </Avatar>
               ))}
               <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/10 bg-indigo-600 text-[10px] font-black text-white shadow-2xl">
                 +12k
               </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white uppercase tracking-widest">Powering Growth</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Live Connections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Side */}
      <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white/[0.02] relative overflow-hidden">
        
        {/* Back to Home Shortcut */}
        <a 
          href="/" 
          className="absolute top-8 right-8 flex items-center justify-center h-12 w-12 rounded-2xl bg-white/5 border border-white/5 text-white/30 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all z-50 group shadow-2xl"
          title="Return to Home"
        >
          <HomeIcon className="h-5 w-5" />
        </a>

        <div className="mb-10 relative z-10">
          {plan ? (
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-xl bg-[#7c3aed]/20 border border-[#7c3aed]/30 animate-pulse">
              <Cpu className="h-4 w-4 text-[#7c3aed]" />
              <span className="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest leading-none">Initializing {plan.replace(/-/g, ' ')} Node</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Verified Endpoint</span>
            </div>
          )}
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">System Login</h1>
          <p className="text-sm font-bold text-indigo-400/60 uppercase tracking-[0.25em] italic">Elite CRM Terminal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7 relative z-10">
          {error && (
            <div className="flex flex-col gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 text-sm text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="font-bold">{error}</span>
              </div>
              <a href="/" className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white underline">Need to head back home?</a>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">
              Terminal ID (Email)
            </Label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-indigo-400">
                <Mail className="h-5 w-5" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="admin@leadpro.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-16 rounded-2xl border-white/5 bg-white/[0.03] pl-14 pr-6 transition-all focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-[6px] focus:ring-indigo-500/10 text-white font-bold text-lg placeholder:text-white/10"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                Security Key (Password)
              </Label>
              <button type="button" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-200 transition-colors">
                Reset?
              </button>
            </div>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-indigo-400">
                <Lock className="h-5 w-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-16 rounded-2xl border-white/5 bg-white/[0.03] pl-14 pr-16 transition-all focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-[6px] focus:ring-indigo-500/10 text-white font-bold text-lg placeholder:text-white/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 transition-colors hover:text-indigo-400"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-6 w-6" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="group relative h-16 w-full overflow-hidden rounded-[1.25rem] bg-indigo-600 font-black text-white shadow-[0_20px_40px_-12px_rgba(79,70,229,0.5)] transition-all hover:translate-y-[-4px] hover:bg-indigo-500 hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.6)] active:translate-y-0"
          >
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="uppercase tracking-[0.25em] text-sm">Access Dashboard</span>
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
              </div>
            )}
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </Button>
        </form>

        <p className="mt-16 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
          Secure Terminal v4.6 • LeadPro System
        </p>
      </div>
    </div>
  );
}
