"use client";

import React from "react";

export function Pathway() {
  return (
    <section id="process" className="py-20 md:py-32 px-4 md:px-6 bg-[#080810]/50 relative overflow-hidden">
       <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 md:gap-20">
          <div className="flex-1 space-y-12">
             <div className="space-y-6 reveal">
                <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter text-white leading-tight italic drop-shadow-xl">Mission <br/> Protocol.</h2>
                <p className="text-sm font-bold text-indigo-100/70 uppercase tracking-[0.4em]">Follow the neural pathway to peak conversion.</p>
             </div>
             <div className="space-y-2">
                {[
                   { step: "01", title: "Initialize Node", desc: "Connect your lead source to our neural sync engine." },
                   { step: "02", title: "Neural Sync", desc: "Data is filtered, verified and synthesized in real-time." },
                   { step: "03", title: "B2B Domination", desc: "Execute outreach with ultra-HD AI voice and tracking." }
                ].map((s, i) => (
                   <div key={i} className="reveal group flex flex-col sm:flex-row items-start gap-4 sm:gap-8 p-6 sm:p-8 rounded-[2rem] hover:bg-white/5 transition-all" style={{ animationDelay: `${i * 150}ms` }}>
                      <span className="text-4xl sm:text-5xl font-black text-orange-500/20 group-hover:text-orange-500 transition-colors italic">{s.step}</span>
                      <div className="space-y-2">
                         <h3 className="text-lg font-black text-white uppercase">{s.title}</h3>
                         <p className="text-sm font-bold text-indigo-100/70 uppercase leading-relaxed tracking-widest">{s.desc}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
          <div className="flex-1 relative mt-12 lg:mt-0">
             <div className="aspect-square rounded-[3rem] lg:rounded-[4rem] bg-gradient-to-br from-orange-600/20 to-transparent border border-orange-500/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-64 h-64 rounded-full bg-orange-500/10 blur-3xl animate-pulse" />
                   <div className="relative z-10 p-12 border border-white/5 rounded-3xl glass-chip floating-node-1">
                      <div className="flex flex-col gap-4">
                         <div className="h-2 w-32 bg-orange-500/20 rounded-full" />
                         <div className="h-2 w-20 bg-orange-500/10 rounded-full" />
                         <div className="h-10 w-10 rounded-lg bg-orange-500 shadow-xl shadow-orange-500/40" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}
