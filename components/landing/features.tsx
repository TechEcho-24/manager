"use client";

import React from "react";
import { Zap, Shield, Cpu, Activity, Layers } from "lucide-react";

const featureItems = [
  { title: "Neural Sync Engine", desc: "Real-time synchronization between lead sources and CRM nodes with zero latency.", icon: Zap },
  { title: "AI Voice Synthesis", desc: "Automate follow-ups with hyper-realistic AI voices that sound human.", icon: Cpu },
  { title: "Quantum Security", desc: "Titan-level encryption for all sensitive lead data and communication logs.", icon: Shield },
  { title: "Universal Bulk Sync", desc: "Sync thousands of records across platforms with a single command.", icon: Layers },
  { title: "Live Telemetry", desc: "Track lead behavior and conversion strength in real-time.", icon: Activity },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 px-4 md:px-6">
       <div className="max-w-7xl mx-auto">
          <div className="mb-24 max-w-3xl">
             <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-white italic">Neural Architecture.</h2>
             <p className="text-xs font-bold text-white/40 tracking-[0.4em]">Engineered for high-density B2B synchronization and ultra-fast lead processing.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
             {featureItems.map((f, i) => (
                <div key={i} className="reveal group p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all duration-500 relative overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                   <div className="relative z-10">
                      <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,107,53,0.2)]">
                         <f.icon className="h-6 w-6 text-orange-400" />
                      </div>
                      <h3 className="text-xl font-black text-white mb-4 tracking-tight">{f.title}</h3>
                      <p className="text-sm font-bold text-indigo-100/70 tracking-widest drop-shadow-sm">{f.desc}</p>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
             ))}
          </div>
       </div>
    </section>
  );
}
