"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Bell, Search, Zap, Loader2, LogOut, PhoneCall, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  leadId?: string;
  leadName?: string;
  isRead: boolean;
  displayAfter: string;
  createdAt: string;
}

// ─── Notification Bell ───────────────────────────────────────────────────────
function NotificationBell({ isMember }: { isMember: boolean }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const orgRole = (session?.user as any)?.orgRole || "owner";

  // Fetch visible notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch { /* silent */ }
  }, []);

  // 8 AM trigger: generate today's follow-up notifications once per day
  useEffect(() => {
    if (isMember || orgRole === "member") return;
    const now = new Date();
    const todayKey = now.toISOString().slice(0, 10); // "2024-05-18"
    const storedDate = localStorage.getItem("followup_notif_date");
    const hour = now.getHours();

    // Trigger after 8 AM if not already generated today
    if (hour >= 8 && storedDate !== todayKey) {
      fetch("/api/notifications/generate", { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          if (d.created > 0 || d.message?.includes("Already")) {
            localStorage.setItem("followup_notif_date", todayKey);
            fetchNotifications();
          }
        })
        .catch(() => {});
      localStorage.setItem("followup_notif_date", todayKey);
    }
  }, [isMember, orgRole, fetchNotifications]);

  // Poll every 15 seconds to pick up new notifications (tasks, follow-ups, etc.)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markSingleRead = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications([]);
    setMarkingAll(false);
    setOpen(false);
  };

  const handleNotifClick = async (notif: Notification) => {
    await markSingleRead(notif._id);
    setOpen(false);
    if (notif.leadId) router.push(`/leads?edit=${notif.leadId}`);
  };

  const unreadCount = notifications.length;

  return (
    <div className="sm:relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className={cn("h-5 w-5", unreadCount > 0 && "text-foreground")} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-white ring-2 ring-background"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-0 left-0 w-full h-[100dvh] flex flex-col sm:top-full sm:left-1/2 sm:-translate-x-1/2 sm:mt-2 sm:w-[360px] sm:h-auto sm:rounded-3xl sm:border border-border/60 bg-background sm:bg-card/95 backdrop-blur-xl sm:shadow-2xl overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 sm:py-3 border-b border-border/40 bg-background sm:bg-transparent">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setOpen(false)} 
                  className="sm:hidden mr-1 h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <Bell className="h-5 w-5 sm:h-4 sm:w-4 text-primary" />
                <span className="text-base sm:text-sm font-black text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={markingAll}
                  className="text-[10px] font-black text-primary hover:text-primary/80 transition-all flex items-center gap-1"
                >
                  {markingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto sm:max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex h-full min-h-[50vh] flex-col items-center justify-center py-10 gap-2 text-muted-foreground/40">
                  <Bell className="h-8 w-8" />
                  <p className="text-xs font-bold">All caught up!</p>
                  <p className="text-[10px]">No new notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="group flex items-start gap-3 px-4 py-3 border-b border-border/20 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleNotifClick(notif)}
                  >
                    {/* Icon */}
                    <div className="h-8 w-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <PhoneCall className="h-4 w-4 text-orange-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-foreground truncate">{notif.title}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[9px] text-muted-foreground/40 mt-1 font-medium">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={(e) => { e.stopPropagation(); markSingleRead(notif._id); }}
                      className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-all shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border/30 bg-muted/20">
                <p className="text-[9px] text-center text-muted-foreground/40 font-medium">
                  Follow-ups show every 5 minutes · Click to open lead
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main TopNavbar ───────────────────────────────────────────────────────────
export function TopNavbar({ isMember = false }: { isMember?: boolean }) {
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const [plan, setPlan] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plan/config").then(r => r.json()).then(data => {
      setPlan(data.plan);
      setLogoUrl(data.logoUrl);
    });
  }, []);

  const { data, isLoading } = useSWR(
    debouncedQuery ? `/api/leads?search=${encodeURIComponent(debouncedQuery)}&limit=5` : null,
    fetcher
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (leadId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/leads?edit=${leadId}`);
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl transition-all duration-300 lg:px-6">
      {/* Mobile menu button */}
      <MobileSidebar />

      <div className="flex flex-col items-start lg:hidden">
        <img src="/assets/logo.png" alt="Pinglly Logo" className="hidden dark:block h-8 object-contain" />
        <img src="/assets/lightlogo.png" alt="Pinglly Logo" className="block dark:hidden h-[35px] object-contain" />
        <span className="text-[7px] font-bold tracking-[0.2em] text-[oklch(0.60_0.22_260)]/60">
          by TechEcho
        </span>
      </div>

      {/* Search bar — hidden for members */}
      {!isMember && (
      <div className="ml-auto flex-1 lg:ml-0 lg:max-w-md" ref={searchRef}>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 transition-colors group-hover:text-primary/50" />
          <input
            type="text"
            placeholder="Search leads, contacts, or tasks..."
            className="h-10 w-full rounded-xl border border-border/40 bg-muted/20 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:bg-background focus:ring-2 focus:ring-primary/10 focus:outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleSearchSubmit}
          />
          
          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-popover shadow-2xl overflow-hidden z-50">
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {!isLoading && data?.leads?.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No leads found for "{debouncedQuery}"
                </div>
              )}

              {!isLoading && data?.leads?.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground/80 tracking-wider">
                    Leads
                  </div>
                  {data.leads.map((lead: any) => (
                    <button
                      key={lead._id}
                      className="w-full px-4 py-2 text-left hover:bg-white/5 flex flex-col items-start gap-1 transition-colors"
                      onClick={() => handleResultClick(lead._id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{lead.fullName}</span>
                        {lead.company && (
                          <span className="text-xs text-muted-foreground/80">· {lead.company}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{lead.phone}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[oklch(0.65_0.25_260)]">{lead.status}</span>
                      </div>
                    </button>
                  ))}
                  
                  <div className="border-t border-white/5 mt-1 pt-1">
                    <button 
                      className="w-full px-4 py-2 text-xs text-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                      onClick={() => {
                        setIsSearchOpen(false);
                        router.push(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
                        setSearchQuery("");
                      }}
                    >
                      View all results
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Mobile search button */}
        {!isMember && (
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground sm:hidden"
          aria-label="Search"
          onClick={() => { router.push('/leads'); }}
        >
          <Search className="h-5 w-5" />
        </button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <NotificationBell isMember={isMember} />

        <div className="h-8 w-[1px] bg-border/40 mx-1 hidden sm:block" />

        {/* User avatar & Logout */}
        <button 
          onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
          className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all hover:bg-destructive/10"
          title="Sign Out"
        >
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-primary/20 group-hover:ring-destructive/30 transition-all">
              {logoUrl ? (
                <AvatarImage src={logoUrl} alt={userName} className="bg-white/5 p-1 object-contain" />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-[10px] font-bold text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-sm">
              <LogOut className="h-2 w-2" />
            </div>
          </div>
          <div className="hidden flex-col items-start md:flex">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground transition-colors group-hover:text-destructive">
                {userName}
              </span>
              {!isMember && plan && (
                <span className={cn(
                  "text-[8px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-tighter",
                  plan === 'pro' ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                  plan === 'growth' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                  "bg-blue-500/10 text-blue-500 border-blue-500/20"
                )}>
                  {plan}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium text-muted-foreground/50">
              Sign Out
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
