"use client";

import React from 'react';
import Link from 'next/link';
import { MousePointer2, ChevronDown } from 'lucide-react';

export function Hero() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header (Vetra Floating Capsule) */}
      <header className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 md:px-6 flex justify-center">
        <div className="flex items-center justify-between w-full max-w-5xl px-5 md:px-8 py-2.5 md:py-3 rounded-full bg-orange-500/[0.03] border border-orange-500/20 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group overflow-hidden">
          {/* Subtle Glow inside capsule */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
          
          <div className="flex flex-col items-start">
            <img src="/assets/logo.png" alt="Pinglly Logo" className="h-8 object-contain" />
            <span className="text-[8px] font-medium text-white/30 tracking-widest uppercase ml-1">by TechEcho</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium">
            <button className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
              Use cases <ChevronDown className="h-3 w-3 opacity-40" />
            </button>
            <button className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
              Features <ChevronDown className="h-3 w-3 opacity-40" />
            </button>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </nav>

          <Link href="/signup" className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-[13px] font-bold hover:shadow-lg hover:shadow-orange-500/50 transition-all text-white">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 md:px-6 pt-28 md:pt-32 pb-20 md:pb-24"
      >
        {/* Animated Background with Noise */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Stars/Particles */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                             radial-gradient(2px 2px at 60% 70%, white, transparent),
                             radial-gradient(1px 1px at 50% 50%, white, transparent),
                             radial-gradient(1px 1px at 80% 10%, white, transparent),
                             radial-gradient(2px 2px at 90% 60%, white, transparent),
                             radial-gradient(1px 1px at 33% 80%, white, transparent)`,
            backgroundSize: '200px 200px, 300px 300px, 250px 250px, 400px 400px, 350px 350px, 300px 300px',
            backgroundRepeat: 'repeat',
            opacity: 0.3
          }}></div>

          {/* The Glowing Orange Horizon - Key Feature */}
          <div className="absolute bottom-0 left-0 right-0 h-[60%]" style={{
            background: `
              radial-gradient(ellipse 120% 80% at 50% 120%, 
                rgba(255, 87, 34, 0.45) 0%,
                rgba(255, 107, 53, 0.3) 20%,
                rgba(230, 74, 25, 0.2) 35%,
                rgba(139, 44, 15, 0.1) 50%,
                transparent 70%
              )
            `,
            filter: 'blur(60px)',
          }}></div>

          {/* Additional Glow Layer */}
          <div className="absolute bottom-0 left-0 right-0 h-[50%]" style={{
            background: `
              radial-gradient(ellipse 100% 60% at 50% 130%, 
                rgba(255, 107, 53, 0.3) 0%,
                rgba(230, 74, 25, 0.15) 30%,
                transparent 60%
              )
            `,
            filter: 'blur(40px)',
          }}></div>

          {/* Noise Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all cursor-pointer group" style={{ animationDelay: '200ms' }}>
            <span className="text-xs font-medium text-white/90">New version is out! Read more</span>
            <span className="text-orange-500 group-hover:translate-x-1 transition-transform">→</span>
          </div>

          {/* Main Heading */}
          <h1 className="reveal text-5xl md:text-8xl lg:text-[120px] font-medium tracking-tighter leading-[1.05] md:leading-[0.95]" style={{fontFamily: 'Manrope, sans-serif', animationDelay: '400ms'}}>
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/90">
              Accelerate Your <br className="hidden sm:block" /> Sales With AI
            </span>
          </h1>

          {/* Subheading */}
          <p className="reveal max-w-2xl mx-auto text-lg md:text-2xl text-gray-400  font-medium" style={{fontFamily: 'Inter, sans-serif', animationDelay: '600ms' }}>
            AI-driven sales automation & insights. Empower your team, close more deals, and maximize revenue effortlessly.
          </p>

          {/* CTA Buttons */}
          <div className="reveal flex flex-wrap justify-center gap-4 pt-6" style={{ animationDelay: '800ms' }}>
            <button className="flex items-center gap-3 px-7 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                  <path d="M1 1.5L11 7L1 12.5V1.5Z" fill="black" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-bold">Watch Demo</span>
            </button>

            <Link href="#" className="px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 font-bold hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-105 transition-all shadow-[0_10px_40px_-5px_rgba(255,87,34,0.4)] flex items-center justify-center">
              Schedule a call
            </Link>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="absolute bottom-12 left-0 right-0 z-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-6 text-center">
            Trusted by 200+ companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-12 opacity-40 px-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-500 rounded"></div>
              <span className="text-sm font-semibold text-gray-400">FeatherDev</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-400">Boltshift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-500 rounded"></div>
              <span className="text-sm font-semibold text-gray-400">GlobalBank</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-500 rounded"></div>
              <span className="text-sm font-semibold text-gray-400">Lightbox</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}