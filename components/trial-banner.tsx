"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export function TrialBanner() {
  const [data, setData] = useState<{ status: string, daysLeft: number } | null>(null);

  useEffect(() => {
    fetch("/api/subscription/status")
      .then(res => res.json())
      .then(d => {
        if (!d.error && d.status === "trial") {
          setData(d);
        }
      })
      .catch(console.error);
  }, []);

  if (!data || data.status !== "trial" || data.daysLeft <= 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-orange-600 to-indigo-600 px-4 py-2 text-center text-white text-xs font-bold flex items-center justify-center gap-4 z-50 relative">
      <span>
        <Zap className="inline-block h-4 w-4 mr-2 mb-1" />
        You have {data.daysLeft} days left in your Pro Trial.
      </span>
      <Link href="/#pricing" className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all text-[10px] uppercase tracking-wider">
        Upgrade Now
      </Link>
    </div>
  );
}
