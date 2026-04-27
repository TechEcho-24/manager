"use client";

import React from "react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <footer className="pt-20 pb-10 px-6">
       <div className="max-w-7xl mx-auto rounded-[4rem] bg-gradient-to-br from-orange-900/40 to-[#000] border border-orange-500/30 p-12 md:p-32 text-center relative overflow-hidden group">
          {/* Background Glow */}
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-orange-600/10 blur-[200px] rounded-full animate-pulse" />
          
          <div className="relative z-10 space-y-12 reveal">
             <h3 className="text-4xl md:text-8xl font-black uppercase tracking-tighter text-white italic leading-tight">Ready to <br/> Ascend?</h3>
             <p className="max-w-2xl mx-auto text-sm md:text-xl font-bold text-white/50 uppercase tracking-[0.4em] leading-loose">Join 2,000+ elite teams dominating the market with LeadPro neural technology.</p>
             <div className="flex justify-center pt-8">
                <Link href="/login" className="px-12 py-5 rounded-full btn-cyber-filled text-[13px] font-black uppercase tracking-[0.4em] text-white shadow-[0_20px_50px_rgba(255,107,53,0.3)]">
                   Connect Now
                </Link>
             </div>
          </div>
       </div>
    </footer>
  );
}

export function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-white/5">
       <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-4">
             <div className="text-2xl font-black tracking-tighter uppercase italic text-white">Lead<span className="text-[#ea580c]">Pro</span></div>
             <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">© 2026 Neural Ops. All rights Reserved.</p>
          </div>
          <div className="flex gap-12">
             {["Architecture", "Research", "Security", "Legal"].map(l => (
                <Link key={l} href="#" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">{l}</Link>
             ))}
          </div>
       </div>
    </footer>
  );
}
