"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { Bell, Search, Zap, Loader2, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TopNavbar() {
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

  const { data, isLoading } = useSWR(
    debouncedQuery ? `/api/leads?search=${encodeURIComponent(debouncedQuery)}&limit=5` : null,
    fetcher
  );

  // Close dropdown when clicking outside
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
        <img src="/assets/logo.png" alt="Pinglly Logo" className="h-8 object-contain" />
        <span className="text-[7px] font-bold tracking-[0.2em] text-[oklch(0.60_0.22_260)]/60">
          by TechEcho
        </span>
      </div>

      {/* Search bar */}
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

      {/* Right side: search icon (mobile), notifications, avatar */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Mobile search button */}
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground sm:hidden"
          aria-label="Search"
          onClick={() => {
            router.push('/leads');
          }}
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[oklch(0.65_0.25_30)] ring-2 ring-[oklch(0.11_0.01_260)]" />
        </button>

        <div className="h-8 w-[1px] bg-border/40 mx-1 hidden sm:block" />

        {/* User avatar & Logout */}
        <button 
          onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
          className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all hover:bg-destructive/10"
          title="Sign Out"
        >
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-primary/20 group-hover:ring-destructive/30 transition-all">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-[10px] font-bold text-primary-foreground">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100 shadow-sm">
              <LogOut className="h-2 w-2" />
            </div>
          </div>
          <div className="hidden flex-col items-start md:flex">
            <span className="text-[11px] font-bold tracking-wider text-muted-foreground transition-colors group-hover:text-destructive">
              {userName}
            </span>
            <span className="text-[9px] font-medium text-muted-foreground/50">
              Sign Out
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
