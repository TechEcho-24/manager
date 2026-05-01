"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  UserPlus, LayoutGrid, Users, Zap, TrendingUp,
  Mic, Bot, BellRing, BarChart3, CheckCircle2,
  Phone, MessageSquare, Tag, Clock, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "01",
    label: "Capture",
    title: "Add leads your way.",
    desc: "Manually enter leads or use voice commands to create them instantly. Every inquiry is tracked from the first second.",
    icon: UserPlus,
    image: 0,
  },
  {
    step: "02",
    label: "Structure",
    title: "Turn raw input into organized data.",
    desc: "Your leads are automatically structured, categorized, and ready for action — no spreadsheet chaos.",
    icon: LayoutGrid,
    image: 0,
  },
  {
    step: "03",
    label: "Assign",
    title: "Delegate with precision.",
    desc: "Assign tasks to your team using text, voice notes, or images with role-based control over who sees what.",
    icon: Users,
    image: 1,
  },
  {
    step: "04",
    label: "Automate",
    title: "Let workflows run themselves.",
    desc: "Set up follow-ups, reminders, and payment alerts that trigger automatically — no manual intervention needed.",
    icon: Zap,
    image: 2,
  },
  {
    step: "05",
    label: "Close & Track",
    title: "Convert faster with full visibility.",
    desc: "Track progress, monitor team performance, and close deals with smart AI-powered insights and real-time reports.",
    icon: TrendingUp,
    image: 2,
  },
];

// ─── Mock Screen 1: Lead Capture ──────────────────────────────────────────────
function Screen1({ active }: { active: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-500",
      active ? "border-orange-500/40 shadow-[0_0_30px_rgba(255,107,53,0.2)]" : "border-white/8"
    )}>
      {/* Title bar */}
      <div className={cn(
        "px-4 py-3 flex items-center justify-between border-b transition-colors duration-500",
        active ? "bg-orange-500/15 border-orange-500/20" : "bg-white/3 border-white/5"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", active ? "bg-orange-400" : "bg-white/20")} />
          <span className={cn("text-[10px] font-black tracking-widest", active ? "text-orange-300" : "text-white/30")}>LEAD CAPTURE</span>
        </div>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/10" />)}
        </div>
      </div>
      <div className="bg-[#0a0a12] p-4 space-y-3">
        {/* Voice button */}
        <div className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500",
          active ? "border-orange-500/30 bg-orange-500/10" : "border-white/5 bg-white/2"
        )}>
          <Mic className={cn("h-4 w-4 shrink-0", active ? "text-orange-400" : "text-white/20")} />
          <span className={cn("text-[11px] font-semibold", active ? "text-white/80" : "text-white/25")}>Voice command active…</span>
          {active && <div className="ml-auto flex gap-0.5">{[4, 7, 5, 8, 3].map((h, i) => <div key={i} className="w-0.5 rounded-full bg-orange-400 animate-pulse" style={{ height: `${h * 2}px`, animationDelay: `${i * 80}ms` }} />)}</div>}
        </div>
        {/* Lead cards */}
        {[
          { name: "Rahul Sharma", src: "WhatsApp", tag: "Hot" },
          { name: "Priya Mehta", src: "Website", tag: "Warm" },
        ].map((l, i) => (
          <div key={i} className={cn(
            "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-500",
            active ? "border-white/10 bg-white/4" : "border-white/4 bg-white/1"
          )}>
            <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black", active ? "bg-orange-500/20 text-orange-300" : "bg-white/5 text-white/20")}>
              {l.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-[11px] font-bold truncate", active ? "text-white/80" : "text-white/25")}>{l.name}</p>
              <p className={cn("text-[9px]", active ? "text-white/40" : "text-white/15")}>{l.src}</p>
            </div>
            <span className={cn(
              "text-[8px] font-black px-2 py-0.5 rounded-full",
              active
                ? l.tag === "Hot" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                : "bg-white/5 text-white/20"
            )}>{l.tag}</span>
          </div>
        ))}
        <div className={cn("text-center text-[9px] font-bold tracking-widest transition-colors", active ? "text-orange-400/60" : "text-white/15")}>
          + 3 more leads today
        </div>
      </div>
    </div>
  );
}

// ─── Mock Screen 2: Task Assignment ───────────────────────────────────────────
function Screen2({ active }: { active: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-500",
      active ? "border-violet-500/40 shadow-[0_0_30px_rgba(139,92,246,0.2)]" : "border-white/8"
    )}>
      <div className={cn(
        "px-4 py-3 flex items-center justify-between border-b transition-colors duration-500",
        active ? "bg-violet-500/15 border-violet-500/20" : "bg-white/3 border-white/5"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", active ? "bg-violet-400" : "bg-white/20")} />
          <span className={cn("text-[10px] font-black tracking-widest", active ? "text-violet-300" : "text-white/30")}>TASK ASSIGNMENT</span>
        </div>
        <Users className={cn("h-3 w-3", active ? "text-violet-400" : "text-white/20")} />
      </div>
      <div className="bg-[#0a0a12] p-4 space-y-3">
        {/* Task card */}
        <div className={cn(
          "rounded-xl border px-4 py-3 space-y-3 transition-all duration-500",
          active ? "border-violet-500/20 bg-violet-500/8" : "border-white/5 bg-white/2"
        )}>
          <div className="flex items-start justify-between">
            <div>
              <p className={cn("text-[11px] font-black", active ? "text-white/90" : "text-white/25")}>Follow-up: Rahul Sharma</p>
              <p className={cn("text-[9px] mt-0.5", active ? "text-white/40" : "text-white/15")}><Clock className="h-2.5 w-2.5 inline mr-1" />Due tomorrow, 11am</p>
            </div>
            <Tag className={cn("h-3.5 w-3.5 shrink-0", active ? "text-violet-400" : "text-white/15")} />
          </div>
          {/* Voice note */}
          <div className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 border transition-colors",
            active ? "border-violet-500/20 bg-violet-500/10" : "border-white/5 bg-white/2"
          )}>
            <Mic className={cn("h-3 w-3 shrink-0", active ? "text-violet-400" : "text-white/20")} />
            <div className="flex-1 flex gap-0.5 items-center h-4">
              {[3, 6, 4, 7, 5, 8, 4, 6, 3, 5].map((h, i) => (
                <div key={i} className={cn("w-0.5 rounded-full transition-colors", active ? "bg-violet-400/60" : "bg-white/10")} style={{ height: `${h * 1.5}px` }} />
              ))}
            </div>
            <span className={cn("text-[9px] font-bold", active ? "text-violet-300" : "text-white/20")}>0:14</span>
          </div>
          {/* Assignee */}
          <div className="flex items-center gap-2">
            <span className={cn("text-[9px] font-bold", active ? "text-white/40" : "text-white/15")}>Assigned to</span>
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black", active ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-white/20")}>
              <div className="h-3 w-3 rounded-full bg-violet-500/50" />
              Sarah K.
            </div>
          </div>
        </div>
        {/* Role badge */}
        <div className={cn("flex items-center gap-2 text-[9px] font-bold transition-colors", active ? "text-white/40" : "text-white/15")}>
          <CheckCircle2 className={cn("h-3 w-3", active ? "text-emerald-400" : "text-white/15")} />
          Role-based access applied
        </div>
      </div>
    </div>
  );
}

// ─── Mock Screen 3: Automate & Track ──────────────────────────────────────────
function Screen3({ active }: { active: boolean }) {
  const bars = [40, 65, 50, 80, 60, 90, 75];
  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-500",
      active ? "border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : "border-white/8"
    )}>
      <div className={cn(
        "px-4 py-3 flex items-center justify-between border-b transition-colors duration-500",
        active ? "bg-emerald-500/12 border-emerald-500/20" : "bg-white/3 border-white/5"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", active ? "bg-emerald-400" : "bg-white/20")} />
          <span className={cn("text-[10px] font-black tracking-widest", active ? "text-emerald-300" : "text-white/30")}>LIVE DASHBOARD</span>
        </div>
        <BarChart3 className={cn("h-3 w-3", active ? "text-emerald-400" : "text-white/20")} />
      </div>
      <div className="bg-[#0a0a12] p-4 space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Leads", val: "142", delta: "+12%" },
            { label: "Closed", val: "38", delta: "+8%" },
            { label: "Revenue", val: "₹2.4L", delta: "+22%" },
          ].map((s, i) => (
            <div key={i} className={cn(
              "rounded-xl border p-2.5 text-center transition-all duration-500",
              active ? "border-emerald-500/15 bg-emerald-500/5" : "border-white/5 bg-white/2"
            )}>
              <p className={cn("text-base font-black", active ? "text-white/90" : "text-white/25")}>{s.val}</p>
              <p className={cn("text-[8px]", active ? "text-white/40" : "text-white/15")}>{s.label}</p>
              <p className={cn("text-[8px] font-bold", active ? "text-emerald-400" : "text-white/15")}>{s.delta}</p>
            </div>
          ))}
        </div>
        {/* Mini bar chart */}
        <div className={cn("rounded-xl border p-3 transition-all duration-500", active ? "border-white/8 bg-white/2" : "border-white/4 bg-white/1")}>
          <p className={cn("text-[9px] font-bold mb-2", active ? "text-white/40" : "text-white/15")}>Weekly Conversions</p>
          <div className="flex items-end gap-1 h-10">
            {bars.map((h, i) => (
              <div
                key={i}
                className={cn("flex-1 rounded-sm transition-all duration-700", active ? "bg-emerald-500/60" : "bg-white/8")}
                style={{ height: active ? `${h}%` : "20%", transitionDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        </div>
        {/* Automation status */}
        <div className={cn("flex items-center justify-between text-[9px] font-bold transition-colors", active ? "text-white/40" : "text-white/15")}>
          <div className="flex items-center gap-1.5">
            <Zap className={cn("h-3 w-3", active ? "text-emerald-400" : "text-white/15")} />
            Auto-reminders running
          </div>
          <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black", active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/20")}>
            LIVE
          </div>
        </div>
      </div>
    </div>
  );
}

const SCREENS = [Screen1, Screen2, Screen3];

export function Pathway() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveStep(i); },
        { threshold: 0.55, rootMargin: "-20% 0px -20% 0px" }
      );
      obs.observe(ref);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const activeImage = STEPS[activeStep].image;

  return (
    <section id="process" className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden">
      {/* Subtle bg */}
      <div className="absolute inset-0 bg-[#080810]/50 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section heading */}
        <div className="mb-10 md:mb-14 reveal">

          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white italic mb-3">
            Advanced Voice Automation
          </h2>
          <p className="text-sm text-white/50 font-medium max-w-md">
            Manage your CRM, Just by speaking. <br />  <span className="mt-2  block text-white text-md w-[600px]">Create leads, assign tasks, and update your workflow using simple voice commands. No typing needed — just speak and let AI handle the rest.</span>
          </p>


        </div>

        {/* Two-col layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">

          {/* LEFT — Steps */}

          <div className="flex-1 space-y-1">
            <p className="text-[11px] font-black tracking-[0.5em] text-orange-400/70 mb-2">HOW IT WORKS</p>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = activeStep === i;
              return (
                <div
                  key={i}
                  ref={el => { stepRefs.current[i] = el; }}
                  onClick={() => setActiveStep(i)}
                  className={cn(
                    "group flex items-start gap-3 sm:gap-5 p-3.5 sm:p-5 rounded-2xl transition-all duration-400 cursor-pointer",
                    isActive
                      ? "bg-white/4 border border-white/12"
                      : "border border-transparent hover:bg-white/2"
                  )}
                >
                  {/* Step number + icon */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0 w-12">
                    <span className={cn(
                      "text-2xl sm:text-3xl font-black italic leading-none transition-all duration-300",
                      isActive ? "text-orange-500" : "text-white/15 group-hover:text-white/30"
                    )}>{s.step}</span>
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300",
                      isActive ? "bg-orange-500/20" : "bg-white/4 group-hover:bg-white/8"
                    )}>
                      <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-orange-400" : "text-white/25")} />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="pt-0.5 flex-1 min-w-0">
                    <p className={cn(
                      "text-[12px] font-black tracking-[0.35em] mb-0.5 transition-colors",
                      isActive ? "text-orange-400/80" : "text-white/20"
                    )}>{s.label.toUpperCase()}</p>
                    <h3 className={cn(
                      "text-base font-black mb-1.5 tracking-tight transition-colors",
                      isActive ? "text-white" : "text-white/40"
                    )}>{s.title}</h3>
                    <p className={cn(
                      "text-sm leading-relaxed transition-all duration-300 overflow-hidden",
                      isActive ? "text-white/55 max-h-20 opacity-100" : "max-h-0 opacity-0"
                    )}>{s.desc}</p>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="shrink-0 h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse mt-1.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT — 3 stacked mock screens (sticky) */}
          <div className="w-full lg:w-85 xl:w-95 shrink-0 lg:sticky lg:top-28">
            {/* Stack container — fixed height so all 3 cards are visible simultaneously */}
            <div className="relative" style={{ height: "340px" }}>
              {SCREENS.map((Screen, idx) => {
                const pos = (idx - activeImage + 3) % 3; // 0=front, 1=mid, 2=back
                const zIndex = pos === 0 ? 30 : pos === 1 ? 20 : 10;
                const scale = pos === 0 ? 1 : pos === 1 ? 0.95 : 0.90;
                const tx = pos === 0 ? 0 : pos === 1 ? 14 : 28;
                const ty = pos === 0 ? 0 : pos === 1 ? 20 : 40;
                const opacity = pos === 0 ? 1 : pos === 1 ? 0.55 : 0.30;

                return (
                  <div
                    key={idx}
                    className="absolute top-0 left-0 right-0 transition-all duration-500 ease-in-out origin-top-left"
                    style={{ zIndex, transform: `translate(${tx}px,${ty}px) scale(${scale})`, opacity }}
                  >
                    <Screen active={pos === 0} />
                  </div>
                );
              })}
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {SCREENS.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    activeImage === idx ? "w-6 bg-orange-500" : "w-1.5 bg-white/20"
                  )}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
