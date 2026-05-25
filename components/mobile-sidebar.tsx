"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  Calendar,
  Contact,
  Building2,
  Handshake,
  CheckSquare,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { WorkspaceSwitcher } from "./workspace-switcher";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", href: "/leads", icon: Users },
  { title: "Follow-ups", href: "/follow-ups", icon: PhoneCall },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Contacts", href: "/contacts", icon: Contact },
  { title: "Clients", href: "/lead-clients", icon: Building2 },
  { title: "Deals", href: "/deals", icon: Handshake },
  { title: "Payments", href: "/payments", icon: CreditCard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Team", href: "/team", icon: UserCheck },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

type NavigationSessionUser = {
  role?: string;
  orgRole?: string;
};

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const user = session?.user as NavigationSessionUser | undefined;
  const orgRole = user?.orgRole || "owner";
  const role = user?.role || "client";

  const visibleNavItems = navItems.filter(item => {
    if (orgRole === "member" && item.href !== "/tasks") return false;
    if (orgRole === "client" && item.href !== "/payments" && item.href !== "/tasks") return false;
    if (item.href === "/payments" && orgRole !== "client") return false;
    if (item.href === "/lead-clients" && role === "admin") return false;
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
        <SheetHeader className="border-b border-sidebar-border p-0">
          <WorkspaceSwitcher collapsed={false} />
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
