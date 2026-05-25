"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { ChevronsUpDown, Check, Loader2, Building2, PlusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Workspace {
  id: string;
  name: string;
  logoUrl: string | null;
  plan: string;
  role: string;
  isActive: boolean;
}

export function WorkspaceSwitcher({ collapsed, inNavbar }: { collapsed?: boolean; inNavbar?: boolean }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const { data, isLoading, mutate } = useSWR<{ workspaces: Workspace[] }>("/api/user/workspaces", fetcher);

  const workspaces = data?.workspaces || [];
  const activeWorkspace = workspaces.find(w => w.isActive);

  // Fallback styling if no workspaces loaded yet or error
  if (isLoading || !activeWorkspace) {
    return (
      <div className={cn(
        "flex items-center px-4",
        inNavbar ? "h-10 rounded-lg bg-muted/50" : "h-20 border-b border-sidebar-border/50",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="h-8 w-8 animate-pulse rounded-lg bg-sidebar-accent/50" />
        {!collapsed && (
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 w-24 animate-pulse rounded bg-sidebar-accent/50" />
            <div className="h-2 w-16 animate-pulse rounded bg-sidebar-accent/50" />
          </div>
        )}
      </div>
    );
  }

  const handleSwitch = async (workspace: Workspace) => {
    if (workspace.isActive) return;
    
    setIsSwitching(true);
    setOpen(false);

    try {
      const res = await fetch("/api/user/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: workspace.id })
      });

      const result = await res.json();
      if (result.success) {
        // Update NextAuth session
        await update({
          organizationId: result.organizationId,
          orgRole: result.role
        });
        
        // Refresh workspaces SWR to update active state
        await mutate();
        
        // Hard refresh the current page to ensure all data scoped to the new org is loaded
        window.location.href = result.role === "client" ? "/payments" : result.role === "member" ? "/tasks" : "/dashboard";
      }
    } catch (err) {
      console.error("Failed to switch workspace", err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center transition-all focus:outline-none",
            inNavbar 
              ? "h-10 rounded-xl bg-white/5 border border-border/40 px-3 hover:bg-white/10"
              : "h-20 border-b border-sidebar-border/50 px-5 hover:bg-sidebar-accent/50",
            collapsed ? "justify-center" : "justify-between gap-3"
          )}
          disabled={isSwitching}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-border/10">
              {activeWorkspace.logoUrl ? (
                <AvatarImage src={activeWorkspace.logoUrl} alt={activeWorkspace.name} className="object-contain bg-white/5" />
              ) : (
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                  {activeWorkspace.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col items-start min-w-0">
                <span className="truncate text-sm font-semibold text-sidebar-foreground w-[130px] text-left">
                  {activeWorkspace.name}
                </span>
                <span className="truncate text-[10px] uppercase font-medium tracking-wider text-muted-foreground/70">
                  {activeWorkspace.plan} plan
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            isSwitching ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            )
          )}
        </button>
      </PopoverTrigger>
      
      {!collapsed && workspaces.length > 0 && (
        <PopoverContent className="w-[240px] p-2" align="start" sideOffset={8}>
          <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
            Switch Workspace
          </div>
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => handleSwitch(workspace)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted focus:outline-none",
                  workspace.isActive && "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-7 w-7 shrink-0 rounded-md ring-1 ring-border/10">
                    {workspace.logoUrl ? (
                      <AvatarImage src={workspace.logoUrl} alt={workspace.name} className="object-contain bg-white/5" />
                    ) : (
                      <AvatarFallback className="rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                        {workspace.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0">
                    <span className={cn("truncate w-[120px] text-left", workspace.isActive ? "font-semibold" : "font-medium")}>
                      {workspace.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {workspace.role}
                    </span>
                  </div>
                </div>
                {workspace.isActive && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>
          
          {/* Create Workspace Button for Members */}
          {!workspaces.some(w => w.role === "owner") && (
            <div className="mt-2 pt-2 border-t border-sidebar-border/50">
              <button
                onClick={() => { setOpen(false); router.push("/create-workspace"); }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted focus:outline-none text-sidebar-foreground/80 hover:text-primary"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="font-semibold">Create Workspace</span>
              </button>
            </div>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
