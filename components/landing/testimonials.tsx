"use client";

import React from "react";
import { Activity } from "lucide-react";

const testimonials = [
  { name: "Rahul Sharma", role: "CEO, GrowthOps", content: "LeadPro's neural sync is a game changer. We scaled from 200 to 5000 leads with zero data corruption. The interface is purely efficient.", avatar: "RS" },
  { name: "Jessica Chen", role: "VP Sales, Nexus Flow", content: "The AI voice synthesis is so realistic our clients didn't realize they were talking to an agent. Conversion up by 45%.", avatar: "JC" },
  { name: "Vikram Malhotra", role: "Head of Growth, DataSphere", content: "The modular partition system is brilliant. High-density information at your fingertips without the bloat of traditional CRMs.", avatar: "VM" }
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-transparent to-[#080810]">
       <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-baseline gap-4 md:gap-8 mb-16 md:mb-24">
             <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter text-white italic">Neural Evidence.</h2>
             <p className="text-xs font-black text-orange-500 uppercase tracking-[0.5em]">Network Reports [LIVE]</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-left">
             {testimonials.map((t, i) => (
                <div key={i} className="reveal group p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all relative overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                   <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-orange-600/30 flex items-center justify-center text-orange-400 font-black text-lg shadow-[0_0_15px_rgba(255,107,53,0.3)] border border-orange-500/40 transition-transform group-hover:scale-110">{t.avatar}</div>
                      <div className="mt-8 space-y-4">
                         <p className="text-lg font-bold text-white leading-relaxed italic">"{t.content}"</p>
                         <div className="flex items-center gap-3">
                            <div className="h-[1px] w-8 bg-white/10" />
                            <span className="text-[10px] font-black uppercase text-white tracking-widest">{t.name}</span>
                            <Activity className="h-3 w-3 text-orange-500 animate-pulse" />
                         </div>
                      </div>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
             ))}
          </div>
       </div>
    </section>
  );
}
