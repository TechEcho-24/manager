"use client";

import { useState, Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { TopNavbar } from "@/components/top-navbar";
import { TrialBanner } from "@/components/trial-banner";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type DashboardSessionUser = {
  orgRole?: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data } = useSWR("/api/organization/branding", fetcher);
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const orgRole = (session?.user as DashboardSessionUser | undefined)?.orgRole || "owner";
  const isMember = orgRole === "member";
  const isClient = orgRole === "client";
  const isRestrictedUser = isMember || isClient;

  // Keep limited-role users inside the pages intended for their role.
  useEffect(() => {
    if (isMember && !pathname.startsWith("/tasks")) {
      router.replace("/tasks");
    }
    if (isClient && !pathname.startsWith("/tasks") && !pathname.startsWith("/payments")) {
      router.replace("/payments");
    }
  }, [session, pathname, router, isMember, isClient]);

  // Apply branding color
  useEffect(() => {
    if (data?.primaryColor) {
      document.documentElement.style.setProperty("--primary", data.primaryColor);
    } else {
      document.documentElement.style.removeProperty("--primary");
    }
  }, [data?.primaryColor]);

  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <div className="min-h-dvh bg-background">
        {/* Desktop sidebar — hidden for members */}
        {!isRestrictedUser && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Main content area */}
        <div
          className={cn(
            "flex min-h-dvh flex-col transition-all duration-300",
            !isRestrictedUser && (sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-[240px]")
          )}
        >
          {/* Hide trial banner for members */}
          {!isRestrictedUser && <TrialBanner />}
          <TopNavbar isMember={isRestrictedUser} />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </Suspense>
  );
}
