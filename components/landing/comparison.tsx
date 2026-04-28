"use client";

import React from "react";
import { comparisonData } from "./constants";

export function Comparison() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-6">
       <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20 space-y-4">
             <h2 className="text-3xl md:text-6xl font-black uppercase tracking-tighter text-white italic">Protocol Matchup.</h2>
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em]">System Transparency Check</p>
          </div>
          <div className="reveal rounded-[2.5rem] border border-white/5 bg-white/[0.01] overflow-x-auto backdrop-blur-xl custom-scrollbar">
             <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-white/5 font-black uppercase text-[10px] tracking-[0.3em] text-white/50 border-b border-white/10">
                   <tr>
                      <th className="p-4 md:p-8 text-left">Neural Feature</th>
                      <th className="p-4 md:p-8">Starter Node</th>
                      <th className="p-4 md:p-8 text-orange-400 text-glow">Pro Core</th>
                      <th className="p-4 md:p-8">Enterprise</th>
                   </tr>
                </thead>
                <tbody className="text-center text-white">
                   {comparisonData.map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-orange-500/5 transition-colors group">
                         <td className="p-4 md:p-8 text-[11px] font-black uppercase tracking-widest leading-loose text-white group-hover:text-orange-400">{row.feature}</td>
                         <td className="p-4 md:p-8 text-sm font-bold text-white/40">{row.lite}</td>
                         <td className="p-4 md:p-8 text-sm font-bold text-orange-400 group-hover:brightness-125">{row.pro}</td>
                         <td className="p-4 md:p-8 text-sm font-bold text-white/40">{row.enterprise}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </section>
  );
}
