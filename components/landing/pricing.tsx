"use client";

import React from "react";
import Link from "next/link";
import { Zap, Shield, Cpu, Activity, Layers, Lock, Search, Phone, Mail, UserPlus, Eye, Building2, Loader2, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { plans } from "./constants";

export function Pricing({ selectedPlan, setSelectedPlan }: { selectedPlan: string, setSelectedPlan: (val: string) => void }) {
  return (
    <section id="pricing" className="py-32 px-6">
       <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
             <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-white italic">Select Priority Node.</h2>
                <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] leading-relaxed">Scale your infrastructure without friction. Each node provides a dedicated neural pathway for lead management.</p>
             </div>
             <div className="flex gap-2 p-2 bg-white/5 border border-white/10 rounded-full">
                {plans.map(p => (
                   <button 
                     key={p.name}
                     onClick={() => setSelectedPlan(p.name)}
                     className={cn(
                       "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                       selectedPlan === p.name ? "bg-orange-600 text-white shadow-lg" : "text-white/40 hover:text-white"
                     )}
                   >
                     {p.name}
                   </button>
                ))}
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
                         <span className="text-6xl font-black text-white italic tracking-tighter">${p.price}</span>
                         <span className="text-sm font-bold text-white/30 uppercase tracking-widest">/node</span>
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
       </div>
    </section>
  );
}
