"use client";

import React from "react";

export function LogoStrip() {
  return (
    <section className="py-20 border-y border-white/5 bg-white/[0.01]">
       <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black tracking-[0.5em] text-white/20 mb-12 italic">Powering Elite Neural Networks</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
             {["CYBERDYNE", "STARK ENT", "WEYLAND", "TYRELL CORP", "OSCORP"].map(l => (
                <span key={l} className="text-2xl font-black tracking-tighter text-white">{l}</span>
             ))}
          </div>
       </div>
    </section>
  );
}
