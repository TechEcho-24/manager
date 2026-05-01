"use client";

import React from "react";
import Link from "next/link";
import { Check, X, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { plans, comparisonData } from "./constants";

export function Pricing({ selectedPlan, setSelectedPlan }: { selectedPlan: string, setSelectedPlan: (val: string) => void }) {
  const [isYearly, setIsYearly] = React.useState(false);
  const [currency, setCurrency] = React.useState<"USD" | "INR">("USD");

  const getPrice = (basePrice: number) => {
    let price = basePrice;
    if (isYearly) price = price * 12 * 0.9;
    if (currency === "INR") {
      price = price * 83;
      return Math.round(price).toLocaleString("en-IN");
    }
    return parseFloat(price.toFixed(2)).toString();
  };

  const getCurrencySymbol = () => currency === "USD" ? "$" : "₹";

  const renderCellValue = (val: string | boolean) => {
    if (val === false) return <X className="h-4 w-4 text-red-500 mx-auto" />;
    if (val === true) return <Check className="h-4 w-4 text-emerald-400 mx-auto" />;
    return <span className="text-xs font-semibold text-white/70">{val}</span>;
  };

  return (
    <section id="pricing" className="py-20 md:py-32 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
          <div className="max-w-2xl">
            <p className="text-[10px] font-black tracking-[0.4em] text-orange-400/70 mb-4">PRICING PLANS</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-white italic">Simple, Transparent<br />Pricing.</h2>
            <p className="text-sm text-white/40 font-medium">Click a plan to select it, then buy. Upgrade or downgrade anytime.</p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 items-start md:items-end shrink-0">
            <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-full">
              <button onClick={() => setCurrency("USD")} className={cn("px-5 py-2 rounded-full text-[10px] font-black tracking-widest transition-all", currency === "USD" ? "bg-white/15 text-white" : "text-white/40 hover:text-white")}>USD</button>
              <button onClick={() => setCurrency("INR")} className={cn("px-5 py-2 rounded-full text-[10px] font-black tracking-widest transition-all", currency === "INR" ? "bg-white/15 text-white" : "text-white/40 hover:text-white")}>INR</button>
            </div>
            <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-full">
              <button onClick={() => setIsYearly(false)} className={cn("px-5 py-2 rounded-full text-[10px] font-black tracking-widest transition-all", !isYearly ? "bg-orange-600 text-white" : "text-white/40 hover:text-white")}>Monthly</button>
              <button onClick={() => setIsYearly(true)} className={cn("px-5 py-2 rounded-full text-[10px] font-black tracking-widest transition-all flex items-center gap-2", isYearly ? "bg-orange-600 text-white" : "text-white/40 hover:text-white")}>
                Yearly <span className={cn("px-2 py-0.5 rounded-full text-[8px]", isYearly ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-400")}>-10%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-start">
          {plans.map((p, i) => {
            const isActive = selectedPlan === p.name;
            return (
              <div
                key={i}
                onClick={() => setSelectedPlan(p.name)}
                className={cn(
                  "reveal group relative rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col",
                  isActive
                    ? "border-orange-500 bg-linear-to-b from-orange-500/15 to-transparent shadow-[0_0_50px_-8px_rgba(255,107,53,0.4)] scale-[1.02] z-10"
                    : "border-white/8 bg-white/2 hover:border-white/20 opacity-60 hover:opacity-80"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Most Popular Badge */}
                {p.badge && (
                  <div className={cn(
                    "text-[9px] font-black tracking-[0.3em] text-center py-2 transition-all",
                    isActive
                      ? "bg-linear-to-r from-orange-600 to-orange-400 text-white"
                      : "bg-white/5 text-white/30"
                  )}>
                    {p.badge}
                  </div>
                )}

                <div className="p-7 sm:p-8 flex flex-col flex-1">
                  {/* Plan Name */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn(
                        "text-[10px] font-black tracking-[0.4em]",
                        isActive ? "text-orange-400" : "text-white/40"
                      )}>{p.name.toUpperCase()}</h4>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                      )}
                    </div>
                    <p className={cn("text-xs font-semibold tracking-widest", isActive ? "text-white/50" : "text-white/20")}>{p.trial}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-7 pb-7 border-b border-white/8">
                    <div className="flex items-baseline gap-1">
                      <span className={cn("text-xl font-black", isActive ? "text-orange-400/70" : "text-white/30")}>{getCurrencySymbol()}</span>
                      <span className={cn("text-5xl font-black italic tracking-tighter", isActive ? "text-white" : "text-white/40")}>
                        {getPrice(p.price as number)}
                      </span>
                      <span className={cn("text-sm font-bold ml-1", isActive ? "text-white/40" : "text-white/20")}>/{isYearly ? "yr" : "mo"}</span>
                    </div>
                    {isYearly && isActive && (
                      <p className="text-[10px] text-emerald-400 font-bold tracking-widest mt-1">10% off vs monthly</p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5 flex-1 mb-7">
                    {p.features.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                          f.included
                            ? isActive ? "bg-orange-500/20" : "bg-white/5"
                            : "bg-red-500/10"
                        )}>
                          {f.included
                            ? <Check className={cn("h-3 w-3", isActive ? "text-orange-400" : "text-white/30")} />
                            : <X className="h-3 w-3 text-red-500" />
                          }
                        </div>
                        <span className={cn(
                          "text-[11px] font-semibold leading-tight",
                          f.included
                            ? isActive ? "text-white/80" : "text-white/35"
                            : "text-white/20 line-through"
                        )}>{f.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA — Buy Now when active, select when not */}
                  {isActive ? (
                    <Link
                      href={`/signup?plan=${encodeURIComponent(p.name)}&billing=${isYearly ? "yearly" : "monthly"}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.25em] text-center transition-all btn-cyber-filled text-white"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Buy {p.name} — {getCurrencySymbol()}{getPrice(p.price as number)}/{isYearly ? "yr" : "mo"}
                    </Link>
                  ) : (
                    <button
                      className="block w-full py-3.5 rounded-2xl font-black text-[10px] tracking-[0.25em] text-center transition-all bg-white/5 border border-white/8 text-white/30 hover:text-white/60 hover:border-white/15"
                    >
                      Select {p.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full Comparison Table — always visible */}
        <div className="mt-16 rounded-3xl border border-white/10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-white/3 border-b border-white/10">
            <div className="p-5 text-[9px] font-black tracking-[0.3em] text-white/30">FEATURE</div>
            {plans.map((p, i) => {
              const isActive = selectedPlan === p.name;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedPlan(p.name)}
                  className={cn(
                    "p-5 text-center text-[9px] font-black tracking-[0.3em] cursor-pointer transition-all",
                    isActive ? "text-orange-400 bg-orange-500/8" : "text-white/30 hover:text-white/50"
                  )}
                >
                  {p.name.toUpperCase()}
                  {p.badge && (
                    <div className={cn("text-[8px] mt-0.5", isActive ? "text-orange-400/70" : "text-white/20")}>POPULAR</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Table Rows */}
          {comparisonData.map((row, idx) => (
            <div
              key={idx}
              className={cn(
                "grid grid-cols-4 border-b border-white/5 transition-colors hover:bg-white/2",
                idx % 2 === 0 ? "bg-transparent" : "bg-white/1"
              )}
            >
              <div className="p-4 sm:p-5 text-[11px] font-semibold text-white/50">{row.feature}</div>
              <div className={cn("p-4 sm:p-5 flex items-center justify-center transition-all", selectedPlan === "Starter" ? "bg-orange-500/5" : "")}>{renderCellValue(row.starter)}</div>
              <div className={cn("p-4 sm:p-5 flex items-center justify-center transition-all", selectedPlan === "Growth" ? "bg-orange-500/5" : "")}>{renderCellValue(row.growth)}</div>
              <div className={cn("p-4 sm:p-5 flex items-center justify-center transition-all", selectedPlan === "Pro" ? "bg-orange-500/5" : "")}>{renderCellValue(row.pro)}</div>
            </div>
          ))}

          {/* Table Footer — Buy button for active plan */}
          <div className="grid grid-cols-4 bg-white/2 p-4 sm:p-5 gap-3">
            <div className="flex items-center">
              <span className="text-[9px] font-black tracking-widest text-white/20">GET STARTED</span>
            </div>
            {plans.map((p, i) => {
              const isActive = selectedPlan === p.name;
              return (
                <div key={i} className="flex justify-center">
                  <Link
                    href={`/signup?plan=${encodeURIComponent(p.name)}&billing=${isYearly ? "yearly" : "monthly"}`}
                    className={cn(
                      "px-4 py-2.5 rounded-xl font-black text-[9px] tracking-[0.15em] transition-all text-center whitespace-nowrap",
                      isActive
                        ? "bg-linear-to-r from-orange-600 to-orange-400 text-white shadow-[0_0_20px_rgba(255,107,53,0.3)] scale-105"
                        : "bg-white/5 border border-white/8 text-white/30 hover:text-white/60"
                    )}
                  >
                    {isActive ? `Buy ${p.name}` : p.buttonText}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Plan CTA */}
        <div className="mt-12 md:mt-16 reveal relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-white/4 to-transparent p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-3 text-white italic">Need a Custom Plan?</h3>
              <p className="text-sm text-white/40 font-medium">Unique requirements? Let us build a tailored solution specifically for your enterprise.</p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 inline-flex items-center justify-center px-10 py-4 rounded-2xl font-black text-xs tracking-[0.3em] transition-all bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Contact Us
            </Link>
          </div>
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-orange-500/8 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/8 blur-[80px] pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
