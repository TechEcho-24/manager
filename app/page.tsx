"use client";

import React from "react";
import { styles } from "@/components/landing/constants";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { LogoStrip } from "@/components/landing/logo-strip";
import { Pathway } from "@/components/landing/pathway";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Comparison } from "@/components/landing/comparison";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { Stats } from "@/components/landing/stats";
import { FinalCTA, Footer } from "@/components/landing/footer";

export default function LandingPage() {
  const [selectedPlan, setSelectedPlan] = React.useState("Pro Core");
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="bg-[#000] selection:bg-orange-500/30 relative overflow-x-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      {/* GLOBAL BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
         {/* Sharp Inner Core */}
         <div 
           className="absolute inset-0 transition-opacity duration-150 opacity-100"
           style={{
             background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 107, 53, 0.15), transparent 80%)`,
           }}
         />
         {/* Massive Outer Bloom */}
         <div 
           className="absolute inset-0 transition-opacity duration-300 opacity-100"
           style={{
             background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 107, 53, 0.08), transparent 80%)`,
           }}
         />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <div className="relative z-10">
        <Hero />
        <LogoStrip />
        <Pathway />
        <Features />
        <Pricing selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
        <Comparison />
        <Testimonials />
        <FAQ />
        <Stats />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
