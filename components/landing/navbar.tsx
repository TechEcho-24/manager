"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function Navbar() {
  return (
    <header className='fixed top-4 md:top-6 left-0 right-0 z-50 px-4 md:px-6 flex justify-center'>
      <div className='flex items-center justify-between w-full max-w-5xl px-5 md:px-8 py-2.5 md:py-3 rounded-full bg-orange-500/3 border border-orange-500/20 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group overflow-hidden'>
        {/* Subtle Glow inside capsule */}
        <div className='absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-orange-500/30 to-transparent' />

        <Link href="/" className='flex flex-col items-start cursor-pointer'>
          <img src='/assets/logo.png' alt='Pinglly Logo' className='h-8 object-contain' />
          <span className='text-[8px] font-medium text-white/30 tracking-widest ml-1'>by TechEcho</span>
        </Link>

        <nav className='hidden md:flex items-center gap-8 text-[13px] font-medium'>
          <Link href="/#process" className='text-gray-400 hover:text-white flex items-center gap-1 transition-colors'>
            Use cases <ChevronDown className='h-3 w-3 opacity-40' />
          </Link>
          <Link href="/#why-pinglly" className='text-gray-400 hover:text-white flex items-center gap-1 transition-colors'>
            Features <ChevronDown className='h-3 w-3 opacity-40' />
          </Link>
          <Link href="/#pricing" className='text-gray-400 hover:text-white transition-colors'>
            Pricing
          </Link>
          <Link href="/contact" className='text-gray-400 hover:text-white transition-colors'>
            Contact
          </Link>
        </nav>

        <Link
          href='/login'
          className='px-5 py-2 bg-linear-to-r from-orange-500 to-orange-600 rounded-full text-[13px] font-bold hover:shadow-lg hover:shadow-orange-500/50 transition-all text-white'
        >
          Get started
        </Link>
      </div>
    </header>
  );
}
