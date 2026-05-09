"use client";

import React from "react";
import Link from "next/link";
import { MousePointer2, ChevronDown } from "lucide-react";
import { Navbar } from "./navbar";

  const logos = [
    {
      name: "FeatherDev",
      icon: <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />,
    },
    {
      name: "Boltshift",
      icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    },
    {
      name: "GlobalBank",
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </>
      ),
    },
    {
      name: "Lightbox",
      icon: (
        <>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </>
      ),
    },
  ];

  // Items ko duplicate karo seamless loop ke liye
  const doubled = [...logos, ...logos];

export function Hero() {
  return (
    <div className='min-h-screen bg-black text-white overflow-hidden'>
      {/* Header (Vetra Floating Capsule) */}
    <Navbar/>

      {/* Hero Section */}
      <section className='relative min-h-[100svh] flex flex-col items-center justify-center px-4 md:px-6 -pt-20 md:pt-32 pb-20 md:pb-24'>
        {/* Background Layer */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          {/* 
            Ensure you have the image saved in public directory and update the path here if needed.
            bg-bottom ensures the planet remains at the bottom of the section on mobile.
          */}
          <div
            className='absolute inset-0 w-full h-full sm:h-[110%] md:h-[114%] lg:h-[115%] xl:h-[120%] 2xl:h-[125%] bg-cover bg-bottom bg-no-repeat'
            style={{
              backgroundImage: "url('/assets/hero-bg.png')",
            }}
          />
          {/* Gradient overlay to ensure text readability and blend with the background color */}
          <div className='absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80' />
        </div>

        {/* Content */}
        <div
          className='relative z-10 max-w-5xl mx-auto text-center space-y-7'
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {/* Badge */}
          <div
            className='reveal inline-flex items-center gap-3 px-1 pl-4 py-1 rounded-full bg-[#1a1a1a]/60 backdrop-blur-md border border-white/10 hover:bg-[#1a1a1a]/80 transition-all cursor-pointer group'
            style={{ animationDelay: "200ms" }}
          >
            <span className='text-[13px] font-medium text-white/80'>
              New version is out! Read more
            </span>
            <div className='w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-400 transition-colors'>
              <svg
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='white'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M5 12h14' />
                <path d='m12 5 7 7-7 7' />
              </svg>
            </div>
          </div>

          {/* Main Heading */}
          <h1
            className='reveal text-4xl md:text-6xl lg:text-[76px] font-semibold tracking-tight text-white'
            style={{ animationDelay: "400ms" }}
          >
            Accelerate Your Sales With AI
          </h1>

          {/* Subheading */}
          <p
            className='reveal max-w-2xl mx-auto text-base md:text-[19px] text-gray-400 font-medium '
            style={{ animationDelay: "600ms" }}
          >
            AI-driven sales automation & insights. Empower your team, close more
            deals, and maximize revenue effortlessly.
          </p>

          {/* CTA Buttons */}
          <div
            className='reveal flex flex-wrap  justify-center gap-4 pt-4'
            style={{ animationDelay: "800ms" }}
          >
            <button className='flex items-center gap-3 md:px-4 px-4 md:py-2.5 py-2 rounded-full border border-white/20 bg-transparent hover:bg-white/5 backdrop-blur-sm transition-all group'>
              <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0'>
                <svg width='10' height='12' viewBox='0 0 10 12' fill='none'>
                  <path
                    d='M1 1L9 6L1 11V1Z'
                    fill='black'
                    stroke='black'
                    strokeWidth='1.2'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
              <span className='font-semibold text-[15px] text-white'>
                Watch Demo
              </span>
            </button>

            <Link
              href='/login'
              className='px-4 py-2.5 rounded-full bg-[#f96e38] font-semibold text-[15px] text-white hover:bg-[#ff7b47] hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center'
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Trusted By Section */}
<div
  className='absolute md:bottom-8 bottom-16 left-0 right-0 z-10'
  style={{ fontFamily: "Manrope, sans-serif" }}
>
  <p className='text-[13px] font-medium text-gray-500 mb-5 text-center'>
    Trusted by 200+ companies
  </p>

  {/* Desktop: Static layout */}
  <div className='hidden md:flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-14 opacity-50 px-4'>
    {logos.map((logo, i) => (
      <div key={i} className='flex items-center gap-2'>
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='text-gray-400'
        >
          {logo.icon}
        </svg>
        <span className='text-[15px] font-semibold text-gray-400'>
          {logo.name}
        </span>
      </div>
    ))}
  </div>

  {/* Mobile: Infinite marquee */}
  <div className='md:hidden overflow-hidden w-full py-4 [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]'>
    <div className='flex w-max animate-marquee'>
      {doubled.map((logo, i) => (
        <div key={i} className='flex items-center gap-2 px-7 opacity-50'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='text-gray-400'
          >
            {logo.icon}
          </svg>
          <span className='text-[15px] font-semibold text-gray-400 whitespace-nowrap'>
            {logo.name}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>
      </section>
    </div>
  );
}
