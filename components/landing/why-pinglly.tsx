"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Mic,
  BellRing,
  GitBranch,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WHY_ITEMS = [
  {
    icon: Bot,
    title: "AI-Powered Lead Capture",
    desc: "Our chatbot captures leads 24/7 via voice and text — no human needed. Every inquiry becomes a tracked lead instantly.",
    accent: "from-orange-500/20 to-orange-500/0",
    glow: "rgba(255,107,53,0.35)",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-400",
    tag: "AUTOMATION",
  },
  {
    icon: Mic,
    title: "Voice + Image Task Assignment",
    desc: "Record a voice note or attach an image while assigning a task. Your team gets full context — not just plain text.",
    accent: "from-violet-500/20 to-violet-500/0",
    glow: "rgba(139,92,246,0.35)",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
    tag: "PRODUCTIVITY",
  },
  {
    icon: BellRing,
    title: "Smart Payment Reminders",
    desc: "Send automated, branded reminders before due dates. Reduce late payments without a single manual follow-up call.",
    accent: "from-emerald-500/20 to-emerald-500/0",
    glow: "rgba(16,185,129,0.35)",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    tag: "COLLECTIONS",
  },
  {
    icon: GitBranch,
    title: "No-Code Multi-Step Automation",
    desc: "Build powerful workflows — auto-assign leads, trigger follow-ups, send reminders — without writing a single line of code.",
    accent: "from-sky-500/20 to-sky-500/0",
    glow: "rgba(14,165,233,0.35)",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-400",
    tag: "WORKFLOWS",
  },
  {
    icon: BarChart3,
    title: "Real-time Reports & Insights",
    desc: "Know exactly where every lead stands. AI-powered reports surface the deals most likely to close — before your competitor does.",
    accent: "from-yellow-500/20 to-yellow-500/0",
    glow: "rgba(234,179,8,0.35)",
    iconBg: "bg-yellow-500/15",
    iconColor: "text-yellow-400",
    tag: "ANALYTICS",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access & Security",
    desc: "Control what every team member sees and does. Enterprise-grade permissions so sensitive data stays with the right people.",
    accent: "from-rose-500/20 to-rose-500/0",
    glow: "rgba(244,63,94,0.35)",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-400",
    tag: "SECURITY",
  },
];

export function WhyPinglly() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-pinglly"
      className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden"
    >
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-orange-500/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Heading */}
        <div
          className={cn(
            "mb-16 md:mb-24 transition-all duration-700",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p className="text-[10px] font-black tracking-[0.5em] text-orange-400/70 mb-4">
            WHY PINGLLY
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white italic mb-5">
            What Sets Us <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">Apart.</span>
          </h2>
          <p className="text-sm text-white/40 font-medium max-w-xl">
            Every CRM claims to be powerful. Here's what makes Pinglly the one your sales team will actually use — and love.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {WHY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={cn(
                  "group relative rounded-3xl border border-white/8 bg-white/2 p-7 sm:p-8",
                  "cursor-default transition-all duration-500",
                  "hover:border-white/20 hover:bg-white/4 hover:scale-[1.03]",
                  "overflow-hidden",
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}
                style={{
                  transitionDelay: visible ? `${i * 90}ms` : "0ms",
                  transitionProperty: "opacity, transform, background, border-color, box-shadow",
                  transitionDuration: "600ms",
                }}
              >
                {/* Hover glow bg */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                  style={{
                    background: `radial-gradient(ellipse at 30% 30%, ${item.glow}, transparent 70%)`,
                  }}
                />

                {/* Shimmer sweep on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-3xl">
                  <div
                    className="absolute -inset-x-full top-0 h-full bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-12"
                    style={{ animation: "shimmerSweep 1.2s ease forwards" }}
                  />
                </div>

                {/* Corner tag */}
                <div className="absolute top-5 right-5">
                  <span className="text-[8px] font-black tracking-[0.3em] text-white/15 group-hover:text-white/30 transition-colors">
                    {item.tag}
                  </span>
                </div>

                {/* Icon with 360° flip */}
                <div
                  className="mb-7"
                  style={{ perspective: "800px" }}
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center",
                      item.iconBg,
                      "transition-all duration-700 ease-in-out",
                      "group-hover:[transform:rotateY(360deg)] group-hover:shadow-[0_0_25px_var(--glow)]"
                    )}
                    style={{ "--glow": item.glow } as React.CSSProperties}
                  >
                    <Icon className={cn("h-6 w-6 transition-all duration-700", item.iconColor)} />
                  </div>
                </div>

                {/* Text */}
                <div className="relative z-10">
                  <h3 className="text-lg font-black text-white mb-3 tracking-tight group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-white/45 font-medium leading-relaxed group-hover:text-white/65 transition-colors">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom gradient accent line */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    `bg-linear-to-r ${item.accent.replace("/0", "/80")}`
                  )}
                />
              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        @keyframes shimmerSweep {
          0%   { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(300%) skewX(-12deg); }
        }
      `}</style>
    </section>
  );
}
