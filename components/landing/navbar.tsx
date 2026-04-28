"use client";

import React from "react";
import Link from "next/link";
import { MousePointer2 } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-10 py-4 md:py-6 flex items-center justify-between bg-black/20 backdrop-blur-md border-b border-white/[0.05]">
        <Link href="/" className="flex flex-col items-start group/logo cursor-pointer">
          <img src="/assets/logo.png" alt="Pinglly Logo" className="h-8 object-contain" />
          <span className="text-[8px] font-medium text-white/30 tracking-widest uppercase ml-1">by TechEcho</span>
        </Link>

        <div className="hidden lg:flex items-center gap-10 text-[13px] font-medium text-white/60">
          <Link href="#use-cases" className="hover:text-white transition-all flex items-center gap-1">Use cases <span className="text-[10px] opacity-40">▼</span></Link>
          <Link href="#features" className="hover:text-white transition-all flex items-center gap-1">Features <span className="text-[10px] opacity-40">▼</span></Link>
          <Link href="#pricing" className="hover:text-white transition-all">Pricing</Link>
          <Link href="#contact" className="hover:text-white transition-all">Contact</Link>
        </div>

        <Link href="/signup" className="px-6 py-2.5 rounded-full btn-cyber-filled text-[13px] font-bold text-white shadow-[0_5px_15px_rgba(255,107,53,0.3)]">
          Get started
        </Link>
    </nav>
  );
}
