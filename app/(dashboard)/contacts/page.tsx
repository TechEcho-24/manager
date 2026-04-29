"use client";

import { useState, useEffect, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { 
  Contact as ContactIcon, 
  Search, 
  Phone, 
  Mail, 
  UserPlus,
  Eye,
  Building2,
  Loader2,
  Shield,
  Lock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { LeadFormPanel } from "@/components/lead-form-panel";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const PAGE_SIZE = 20;

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>();
  
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.leads.length) return null;
    return `/api/leads?page=${pageIndex + 1}&limit=${PAGE_SIZE}&search=${searchQuery}`;
  };

  const { data, size, setSize, isLoading, mutate } = useSWRInfinite(getKey, fetcher);
  
  const allLeads = data ? data.flatMap((page) => page.leads) : [];
  const isEmpty = data?.[0]?.leads.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.leads.length < PAGE_SIZE);

  // Infinite Scroll Trigger
  const loaderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isReachingEnd && !isLoading) {
          setSize(size + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [size, isReachingEnd, isLoading]);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const activeLetters = new Set(allLeads.map(c => c.fullName.charAt(0).toUpperCase()));

  // Simulate user plan
  const userPlan = "starter"; // This would come from auth/session
  const leadCount = allLeads.length;
  const leadLimit = userPlan === "starter" ? 50 : Infinity;
  const usagePercentage = Math.min((leadCount / leadLimit) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Neural Resource Usage Bar */}
      {userPlan === "starter" && (
        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <h2 className="text-[10px] font-black tracking-[0.4em] text-purple-400">Resource Allocation: Starter Node</h2>
              <p className="text-sm font-bold text-white">Synchronization Quota: <span className="text-purple-500">{leadCount}</span> / {leadLimit} Leads</p>
            </div>
            <div className="flex-1 max-w-md h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
               <div 
                 className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-1000" 
                 style={{ width: `${usagePercentage}%` }}
               />
            </div>
            <Button className="rounded-xl px-8 bg-purple-600/10 border border-purple-500/20 text-purple-400 text-[10px] font-black tracking-widest hover:bg-purple-600 hover:text-white transition-all">
              Upgrade to Pro Core
            </Button>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-purple-600/5 to-transparent pointer-none" />
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground lg:text-3xl">
            Contacts List
          </h1>
          <p className="mt-1 text-xs font-bold text-muted-foreground tracking-widest opacity-50">
            Neural Directory Sync: Total Record Count ({allLeads.length})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="gap-2 border-white/5 bg-white/[0.01] text-white/40 hover:text-purple-400 hover:border-purple-500/30 font-black rounded-xl h-12 tracking-widest text-[9px] relative group overflow-hidden"
          >
            <Shield className="h-4 w-4" />
            Neural Bulk Sync
            <Lock className="h-3 w-3 absolute top-1 right-1 opacity-40" />
            <div className="absolute inset-0 bg-purple-600/5 translate-y-full group-hover:translate-y-0 transition-transform" />
          </Button>
          <Button 
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 font-black rounded-xl h-12 tracking-widest text-xs"
            onClick={() => {
              setSelectedContactId(undefined);
              setIsFormOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            Initialize New Contact
          </Button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 space-y-4 min-w-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
            <Input 
              placeholder="Query database (Name, Email, Company)..." 
              className="pl-12 h-14 bg-card border-border/40 rounded-2xl shadow-sm focus:ring-[6px] focus:ring-primary/5 font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30 border-b border-border/40">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-16 text-center font-black text-[10px] tracking-widest px-6 opacity-30">#</TableHead>
                    <TableHead className="font-black text-[10px] tracking-widest px-4">Full Identity</TableHead>
                    <TableHead className="font-black text-[10px] tracking-widest px-4">Communication Line</TableHead>
                    <TableHead className="font-black text-[10px] tracking-widest px-4">Status Flag</TableHead>
                    <TableHead className="w-20 text-right px-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allLeads.map((contact, index) => {
                     const firstLetter = contact.fullName.charAt(0).toUpperCase();
                     const isFirstOfLetter = index === 0 || allLeads[index-1].fullName.charAt(0).toUpperCase() !== firstLetter;

                     return (
                      <TableRow 
                        key={contact.id} 
                        id={isFirstOfLetter ? `letter-${firstLetter}` : undefined}
                        className="group border-border/20 hover:bg-primary/[0.03] transition-colors"
                      >
                        <TableCell className="text-center font-black text-muted-foreground/20 text-[10px]">
                          {(index + 1).toString().padStart(3, '0')}
                        </TableCell>
                        <TableCell className="px-4 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-[14px] text-foreground group-hover:text-primary transition-colors">
                              {contact.fullName}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground/50 flex items-center gap-1.5 mt-1">
                              <Building2 className="h-3 w-3" />
                              {contact.company || "Independent Unit"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/70">
                              <Mail className="h-3 w-3 text-primary/30" />
                              {contact.email || "NO_SIGNAL"}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-black text-foreground">
                              <Phone className="h-3 w-3 text-primary/60" />
                              {contact.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-black tracking-widest text-primary">
                             {contact.status}
                           </div>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-2xl bg-white/[0.02] border border-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                            onClick={() => {
                              setSelectedContactId(contact.id);
                              setIsFormOpen(true);
                            }}
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {/* Infinite Scroll Loader */}
            {!isReachingEnd && (
              <div ref={loaderRef} className="flex items-center justify-center p-12 border-t border-border/20">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  <span className="text-[9px] font-black tracking-[0.4em] text-primary/40 animate-pulse">Synchronizing Records...</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="hidden lg:flex flex-col sticky top-24 h-fit gap-0.5 bg-card/40 backdrop-blur-xl border border-border/40 p-2 rounded-2xl shadow-2xl">
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className={cn(
                "h-6 w-6 flex items-center justify-center text-[10px] font-black rounded-lg transition-all",
                activeLetters.has(letter) 
                  ? "text-primary hover:bg-primary hover:text-white shadow-lg" 
                  : "text-muted-foreground/10 pointer-events-none"
              )}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <LeadFormPanel 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        leadId={selectedContactId} 
        onSuccess={mutate} 
      />
    </div>
  );
}
