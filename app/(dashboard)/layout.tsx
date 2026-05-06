"use client";

import { useState, Suspense, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopNavbar } from "@/components/top-navbar";
import { TrialBanner } from "@/components/trial-banner";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data } = useSWR("/api/organization/branding", fetcher);

  useEffect(() => {
    if (data?.primaryColor) {
      document.documentElement.style.setProperty("--primary", data.primaryColor);
      // also optionally set primary-foreground to a contrasting color or white
      // document.documentElement.style.setProperty("--primary-foreground", "#ffffff");
    } else {
      document.documentElement.style.removeProperty("--primary");
    }
  }, [data?.primaryColor]);

  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <div className="min-h-dvh bg-background">
        {/* Desktop sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main content area */}
        <div
          className={cn(
            "flex min-h-dvh flex-col transition-all duration-300",
            sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-[240px]"
          )}
        >
          <TrialBanner />
          <TopNavbar />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </Suspense>
  );
}
