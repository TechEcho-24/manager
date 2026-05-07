"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  Calendar,
  Contact,
  Handshake,
  CheckSquare,
  BarChart3,
  Settings,
  Menu,
  Zap,
} from "lucide-react";
import { useState } from "react";

import useSWR from "swr";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", href: "/leads", icon: Users },
  { title: "Follow-ups", href: "/follow-ups", icon: PhoneCall },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Contacts", href: "/contacts", icon: Contact },
  { title: "Deals", href: "/deals", icon: Handshake },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const { data: branding } = useSWR("/api/organization/branding", fetcher);
  
  const orgRole = (session?.user as any)?.orgRole || "owner";
  
  const visibleNavItems = navItems.filter(item => {
    if (orgRole === "member" && item.href !== "/tasks") return false;
    return true;
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground/60 transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] border-sidebar-border bg-sidebar p-0"
      >
        <SheetHeader className="border-b border-sidebar-border px-5 py-4">
          <SheetTitle className="flex flex-col items-start">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Organization Logo" className="h-8 object-contain object-left max-w-[140px]" />
            ) : (
              <img src="/assets/logo.png" alt="Pinglly Logo" className="h-8 object-contain" />
            )}
            <span className="text-[7px] font-bold tracking-[0.2em] text-[oklch(0.60_0.22_260)]/60">by TechEcho</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-1 p-3">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-sidebar-foreground/50 active:bg-sidebar-accent hover:text-sidebar-foreground/80"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive
                      ? "text-primary"
                      : "text-sidebar-foreground/40"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
