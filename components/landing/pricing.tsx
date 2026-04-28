"use client";

import React from "react";
import Link from "next/link";
import { Zap, Shield, Cpu, Activity, Layers, Lock, Search, Phone, Mail, UserPlus, Eye, Building2, Loader2, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { plans } from "./constants";

export function Pricing({ selectedPlan, setSelectedPlan }: { selectedPlan: string, setSelectedPlan: (val: string) => void }) {
  const [isYearly, setIsYearly] = React.useState(false);
  const [currency, setCurrency] = React.useState<"USD" | "INR">("USD");

  const getPrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    let price = basePrice;
    if (isYearly) price = price * 0.9;
    if (currency === "INR") price = price * 83;
    
    if (currency === "INR") return Math.round(price);
    return price.toFixed(2);
  };

  const getCurrencySymbol = () => currency === "USD" ? "$" : "₹";

  return (
    <section id="pricing" className="py-32 px-6">
       <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
             <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white italic">Select Priority Node.</h2>
                <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] leading-relaxed">Scale your infrastructure without friction. Each node provides a dedicated neural pathway for lead management.</p>
             </div>
             <div className="flex flex-col gap-4 items-start md:items-end">
                <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-full">
                  <button onClick={() => setCurrency("USD")} className={cn("px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", currency === "USD" ? "bg-white/20 text-white shadow-md" : "text-white/40 hover:text-white")}>USD</button>
                  <button onClick={() => setCurrency("INR")} className={cn("px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", currency === "INR" ? "bg-white/20 text-white shadow-md" : "text-white/40 hover:text-white")}>INR</button>
                </div>
                <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-full items-center">
                  <button onClick={() => setIsYearly(false)} className={cn("px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", !isYearly ? "bg-orange-600 text-white shadow-lg" : "text-white/40 hover:text-white")}>Monthly</button>
                  <button onClick={() => setIsYearly(true)} className={cn("px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2", isYearly ? "bg-orange-600 text-white shadow-lg" : "text-white/40 hover:text-white")}>
                     Yearly <span className={cn("px-2 py-0.5 rounded-full text-[8px]", isYearly ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-400")}>-10%</span>
                  </button>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {plans.map((p, i) => (
                <div 
                   key={i} 
                   onClick={() => setSelectedPlan(p.name)}
                   className={cn(
                      "reveal group relative p-12 rounded-[3.5rem] border transition-all duration-700 cursor-pointer overflow-hidden",
                      selectedPlan === p.name 
                         ? "bg-white/[0.03] border-orange-500/50 scale-[1.02] shadow-[0_40px_80px_-20px_rgba(255,107,53,0.15)]" 
                         : "bg-white/[0.01] border-white/5 hover:border-white/20"
                   )}
                   style={{ animationDelay: `${i * 100}ms` }}
                >
                   {p.highlight && (
                      <div className="absolute top-8 right-8 px-4 py-1 bg-gradient-to-r from-orange-600 to-orange-400 text-white text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse shadow-[0_0_15px_rgba(255,107,53,0.5)]">
                         Neural Priority
                      </div>
                   )}

                   <h4 className={cn("text-[11px] font-black uppercase tracking-[0.4em] mb-8 transition-colors text-glow", selectedPlan === p.name ? "text-orange-400" : "text-white/40")}>{p.name}</h4>
                   
                   <div className="mb-10">
                      <div className="flex items-baseline gap-2">
                         <span className="text-5xl lg:text-6xl font-black text-white italic tracking-tighter">
                           {getCurrencySymbol()}{getPrice(p.price as number)}
                         </span>
                         <span className="text-sm font-bold text-white/30 uppercase tracking-widest">
                           /{isYearly ? "yr" : "mo"}
                         </span>
                      </div>
                   </div>

                   <div className="space-y-5 mb-12">
                      {p.features.map((f, idx) => (
                         <div key={idx} className="flex items-center gap-4 group/item">
                            <div className={cn(
                               "h-1.5 w-1.5 rounded-full transition-all duration-500",
                               selectedPlan === p.name ? "bg-orange-500 shadow-[0_0_8px_#ff6b35]" : "bg-white/10"
                            )} />
                            <span className={cn(
                               "text-[10px] font-bold uppercase tracking-widest transition-colors",
                               selectedPlan === p.name ? "text-white" : "text-white/40"
                            )}>{f}</span>
                         </div>
                      ))}
                   </div>

                   <Link 
                      href="/signup" 
                      className={cn(
                         "block w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.5em] text-center transition-all",
                         selectedPlan === p.name ? "btn-cyber-filled text-white" : "bg-white/10 text-white hover:bg-white/20"
                      )}
                   >
                      {p.buttonText}
                   </Link>
                </div>
             ))}
          </div>

          {/* Custom Contact Us Section */}
          <div className="mt-24 reveal relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-12 text-center md:text-left">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="max-w-xl">
                   <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 text-white italic">Need a Custom Node?</h3>
                   <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                      Have unique requirements? Let our engineers build a custom neural pathway tailored specifically for your enterprise.
                   </p>
                </div>
                <div>
                   <Link 
                      href="/contact" 
                      className="inline-flex items-center justify-center px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.4em] transition-all bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                   >
                      Contact Engineering
                   </Link>
                </div>
             </div>
             
             {/* Decorative Background Elements */}
             <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/10 blur-[80px] pointer-events-none" />
             <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
          </div>
       </div>
    </section>
  );
}
