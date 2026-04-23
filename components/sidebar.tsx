"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", href: "/leads", icon: Users },
  { title: "Follow-ups", href: "/follow-ups", icon: PhoneCall },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Contacts", href: "/contacts", icon: Contact },
  { title: "Deals", href: "/deals", icon: Handshake },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Reports", href: "/reports", icon: BarChart3 },
];

const bottomNavItems = [
  { title: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function NavLink({
  href,
  icon: Icon,
  title,
  isActive,
  collapsed,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  isActive: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/15 text-primary shadow-sm"
          : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground/80",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          isActive
            ? "text-primary"
            : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70"
        )}
      />
      {!collapsed && (
        <span className="animate-in fade-in duration-200">{title}</span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={link}
        />
        <TooltipContent side="right" className="font-medium">
          {title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-dvh flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:flex",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.65_0.25_260)] to-[oklch(0.55_0.28_290)] shadow-md shadow-[oklch(0.50_0.20_270)]/20">
            <Zap className="h-4 w-4 text-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-[oklch(0.60_0.22_260)] animate-in fade-in duration-200">
              LeadPro
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              isActive={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-3">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              isActive={pathname === item.href}
              collapsed={collapsed}
            />
          ))}

          {/* Collapse toggle */}
          <button
            onClick={onToggle}
            className={cn(
              "mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/40 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground/70",
              collapsed && "justify-center px-2"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-[18px] w-[18px]" />
            ) : (
              <>
                <ChevronLeft className="h-[18px] w-[18px]" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
