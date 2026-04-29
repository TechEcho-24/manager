"use client";

import React, { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  { name: "Rahul Sharma", content: "Pinglly's neural sync is an absolute game changer. We scaled from 200 to 5,000 leads organically with zero data corruption. The interface is purely efficient.", avatar: "RS" },
  { name: "Priya Patel", content: "The AI pipeline management feels almost intuitive. It has completely transformed how our enterprise tracks high-value deals and predicts revenue closures.", avatar: "PP" },
  { name: "Vikram Malhotra", content: "The automation features are brilliant. High-density information at your fingertips without the massive interface bloat of traditional B2B CRMs.", avatar: "VM" },
  { name: "Neha Gupta", content: "Unparalleled performance. The real-time predictive analytics allowed our outbound sales team to close deals 40% faster this quarter.", avatar: "NG" },
  { name: "Amit Desai", content: "Absolutely incredible architecture. The stringent security compliance and SOC2 enterprise features gave our board complete peace of mind.", avatar: "AD" }
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered]);

  // Get the 3 visible testimonials based on current index
  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length],
  ];

  return (
    <section className="py-20 md:py-32 px-4 md:px-6 bg-[#000]">
       <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 relative items-center">
          
          {/* Left Column: Heading and Text */}
          <div className="lg:w-1/3 lg:sticky lg:top-40 h-fit">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">What Our<br/>Clients Say</h2>
            <p className="text-white/40 font-medium leading-relaxed mb-8 text-sm md:text-base">
              Discover how elite sales teams and enterprise agencies are leveraging Pinglly's neural CRM architecture to dominate their markets, automate busywork, and accelerate revenue generation.
            </p>
            <button className="px-8 py-4 rounded-full btn-cyber-filled text-white text-[10px] font-black tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(255,107,53,0.2)] hover:shadow-[0_0_30px_rgba(255,107,53,0.4)] transition-all">
              View More
            </button>
          </div>

          {/* Right Column: Rotating Cards (Always 3) */}
          <div 
            className="lg:w-2/3 space-y-6"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {visibleTestimonials.map((t, i) => {
              const isActive = i === 1; // Middle card is always active
              return (
                <div 
                  key={`${currentIndex}-${i}`} // Force animation re-render when rotating
                  className={cn(
                    "relative p-6 md:p-8 rounded-2xl md:rounded-3xl border transition-all duration-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4",
                    isActive 
                      ? "bg-white/[0.04] border-[#ff6b35]/30 md:-translate-x-8 shadow-[0_20px_50px_rgba(255,107,53,0.1)] z-10 scale-[1.02]" 
                      : "bg-white/[0.01] border-white/50 opacity-80 md:translate-x-8 z-0 scale-95"
                  )}
                >
                  {/* Left Highlight Border */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5 md:w-2 transition-colors duration-500", 
                    isActive ? "bg-[#ff6b35]" : "bg-transparent"
                  )} />
                  
                  <div className="flex gap-4 md:gap-6 items-start relative z-10 pl-2">
                    <div className={cn(
                      "shrink-0 h-12 w-12 md:h-16 md:w-16 rounded-full flex items-center justify-center font-black text-lg transition-colors duration-500", 
                      isActive ? "bg-[#ff6b35]/20 text-[#ff6b35] shadow-[0_0_15px_rgba(255,107,53,0.3)]" : "bg-white/5 text-white/80"
                    )}>
                      {t.avatar}
                    </div>
                    
                    <div className="flex-grow pt-2">
                      <h4 className={cn("text-sm md:text-lg font-bold mb-2 transition-colors duration-500", isActive ? "text-white" : "text-white/60")}>
                        {t.name}
                      </h4>
                      <p className={cn("text-xs md:text-sm leading-relaxed transition-colors duration-500", isActive ? "text-white/80" : "text-white/40")}>
                        "{t.content}"
                      </p>
                    </div>

                    <Quote className={cn(
                      "shrink-0 h-8 w-8 md:h-12 md:w-12 transition-all duration-500", 
                      isActive ? "text-[#ff6b35] fill-[#ff6b35]/20 scale-110" : "text-white/10 fill-white/5"
                    )} />
                  </div>
                </div>
              );
            })}
          </div>
       </div>
    </section>
  );
}
