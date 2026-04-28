"use client";

import React from "react";

export function FAQ() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-6">
       <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white italic mb-20 text-center">Security Protocols.</h2>
          <div className="space-y-4">
             {[
                { q: "Is lead data encrypted during synchronization?", a: "Every packet is encrypted using Titan-level military grade security protocols before leaving its source." },
                { q: "What is the neural sync latency?", a: "Standard nodes operate at sub-100ms. Pro nodes operate in near-zero real-time." },
                { q: "Can I partition my leads based on clients?", a: "Yes, Pro Core supports multi-client partitions for complete separation of lead streams." }
             ].map((f, i) => (
                <div key={i} className="reveal group p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all" style={{ animationDelay: `${i * 100}ms` }}>
                   <h4 className="text-sm font-black text-white uppercase mb-4 group-hover:text-orange-400 transition-colors tracking-widest">{f.q}</h4>
                   <p className="text-xs font-bold text-indigo-100/50 uppercase leading-loose tracking-widest">{f.a}</p>
                </div>
             ))}
          </div>
       </div>
    </section>
  );
}
