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

import { useSession } from "next-auth/react";

const allNavItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", href: "/leads", icon: Users, role: "client" },
  { title: "Follow-ups", href: "/follow-ups", icon: PhoneCall, role: "client" },
  { title: "Calendar", href: "/calendar", icon: Calendar, role: "client" },
  { title: "Contacts", href: "/contacts", icon: Contact, role: "client" },
  { title: "Deals", href: "/deals", icon: Handshake, role: "client" },
  { title: "Tasks", href: "/tasks", icon: CheckSquare, role: "client" },
  { title: "Insights", href: "/reports", icon: BarChart3 },
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
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground/80",
        collapsed && "justify-center px-2"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
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
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "client";

  const navItems = allNavItems.filter(item => {
    if (role === "admin" && item.role === "client") return false;
    return true;
  });

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-dvh flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:flex",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className={cn(
            "flex h-20 items-center border-b border-sidebar-border/50 px-5 relative overflow-hidden group hover:bg-white/[0.02] transition-all",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-sm group-hover:bg-primary/40 transition-all" />
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center group-hover:scale-110 transition-transform">
              <img src="/assets/logo.png" alt="Pinglly Logo" className="h-8 object-contain" />
            </div>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-primary ">
                Pinglly
              </span>
              <span className="text-[7px] font-black tracking-[0.2em] text-muted-foreground/40 mt-1">
                by TechEcho • {role === "admin" ? "SaaS Master" : "Enterprise Hub"}
              </span>
            </div>
          )}
        </Link>

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
