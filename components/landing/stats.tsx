"use client";

import React from "react";

export function Stats() {
  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.01]">
       <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center">
             {[
                { label: "Synced Leads", value: "12.8M+" },
                { label: "Neural Nodes", value: "840+" },
                { label: "Active Pro Core", value: "15k+" },
                { label: "System Uptime", value: "99.99%" }
             ].map((s, i) => (
                <div key={i} className="space-y-2">
                   <div className="text-3xl md:text-5xl font-black text-white italic">{s.value}</div>
                   <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/20">{s.label}</div>
                </div>
             ))}
          </div>
       </div>
    </section>
  );
}
