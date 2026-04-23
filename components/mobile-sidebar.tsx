"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
          <SheetTitle className="flex items-center gap-3 text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.65_0.25_260)] to-[oklch(0.55_0.28_290)] shadow-md shadow-[oklch(0.50_0.20_270)]/20">
              <Zap className="h-4 w-4 text-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[oklch(0.60_0.22_260)]">LeadPro</span>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
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
