"use client";

import { useState } from "react";
import useSWR from "swr";
import { Handshake, Plus, TrendingUp, Wallet, Clock, Mail, Eye, Edit2, Search, Filter, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LeadFormPanel } from "@/components/lead-form-panel";
import { AnimatedNumber } from "@/components/animated-number";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Deal = {
  id: string;
  fullName: string;
  company?: string;
  phone: string;
  status: string;
  dealDetails?: {
    totalValue: number;
    receivedAmount: number;
    paymentPlan: string;
    installments: {
      amount: number;
      dueDate: string;
      status: string;
    }[];
  };
  createdAt: string;
};

export default function DealsPage() {
  const { data, isLoading, mutate } = useSWR("/api/leads?status=Converted (Won)", fetcher);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | undefined>();

  const deals: Deal[] = data?.leads || [];
  
  const filteredDeals = deals.filter(d => 
    d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = deals.reduce((acc, curr) => acc + (curr.dealDetails?.totalValue || 0), 0);
  const totalReceived = deals.reduce((acc, curr) => acc + (curr.dealDetails?.receivedAmount || 0), 0);
  const totalPending = totalValue - totalReceived;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Deals Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your conversions, revenue, and pending payments
          </p>
        </div>
        <Button 
          className="gap-2 bg-primary text-white shadow-lg shadow-primary/20 font-bold rounded-xl h-11"
          onClick={() => {
            setEditingDealId(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Create New Deal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground tracking-widest">Total Pipeline</p>
                <h3 className="text-2xl font-black text-foreground mt-0.5">
                  ₹<AnimatedNumber value={totalValue} />
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground tracking-widest">Received Amount</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-0.5">
                  ₹<AnimatedNumber value={totalReceived} />
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm overflow-hidden border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground tracking-widest">Total Pending</p>
                <h3 className="text-2xl font-black text-amber-600 mt-0.5">
                  ₹<AnimatedNumber value={totalPending} />
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input 
            placeholder="Search deals by customer or company..." 
            className="pl-10 h-12 bg-card border-border rounded-xl shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-muted/20 border border-border" />
          ))
        ) : filteredDeals.length === 0 ? (
          <Card className="border-2 border-dashed border-border bg-card/50">
            <CardContent className="py-20 flex flex-col items-center justify-center text-muted-foreground">
              <Handshake className="h-12 w-12 opacity-20 mb-4" />
              <p className="font-bold tracking-widest text-xs">No Active Deals Found</p>
              <p className="text-sm mt-1">Convert leads to Won status to see them here.</p>
            </CardContent>
          </Card>
        ) : (
          filteredDeals.map((deal) => {
            const progress = deal.dealDetails?.totalValue 
              ? Math.round((deal.dealDetails.receivedAmount / deal.dealDetails.totalValue) * 100) 
              : 0;
            
            const nextPending = deal.dealDetails?.installments?.find(ins => ins.status === 'pending');

            return (
              <Card key={deal.id} className="border-border bg-card hover:shadow-xl hover:shadow-primary/5 transition-all group overflow-hidden">
                <CardContent className="p-0 flex flex-col md:flex-row md:items-center">
                  <div className="flex-1 p-5 md:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                          {deal.fullName} 
                          <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0" />
                        </h3>
                        <p className="text-sm font-bold text-muted-foreground tracking-wider">{deal.company || "Direct Client"}</p>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-xs font-bold text-muted-foreground mb-1">Deal Progression</div>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                              style={{ width: `${progress}%` }} 
                            />
                          </div>
                          <span className="text-sm font-black text-foreground">{progress}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div className="bg-muted/30 p-2.5 rounded-xl border border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground">Total Proposal</p>
                        <p className="text-sm font-black text-foreground">₹{deal.dealDetails?.totalValue?.toLocaleString()}</p>
                      </div>
                      <div className="bg-emerald-50/50 dark:bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                        <p className="text-[10px] font-bold text-emerald-600">Total Received</p>
                        <p className="text-sm font-black text-emerald-600">₹{deal.dealDetails?.receivedAmount?.toLocaleString()}</p>
                      </div>
                      <div className="bg-amber-50/50 dark:bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                        <p className="text-[10px] font-bold text-amber-600">Outstanding</p>
                        <p className="text-sm font-black text-amber-600">₹{((deal.dealDetails?.totalValue || 0) - (deal.dealDetails?.receivedAmount || 0)).toLocaleString()}</p>
                      </div>
                      <div className="bg-primary/5 p-2.5 rounded-xl border border-primary/10">
                        <p className="text-[10px] font-bold text-primary">Next Due</p>
                        <p className="text-sm font-black text-primary">
                          {nextPending ? format(new Date(nextPending.dueDate), "MMM d, yyyy") : "Completed"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/20 border-t md:border-t-0 md:border-l border-border p-4 flex md:flex-col gap-2 shrink-0 h-full">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl h-10 border-border bg-background hover:bg-muted text-xs font-bold tracking-widest"
                      onClick={() => {
                        setEditingDealId(deal.id);
                        setIsFormOpen(true);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-2" /> View & Add Info
                    </Button>
                    <Button 
                      className="flex-1 rounded-xl h-10 bg-primary text-white hover:bg-primary/90 text-xs font-bold tracking-widest shadow-lg shadow-primary/10"
                      onClick={() => {
                         setEditingDealId(deal.id);
                         setIsFormOpen(true);
                      }}
                    >
                      <Mail className="h-3.5 w-3.5 mr-2" /> Send Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <LeadFormPanel 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        leadId={editingDealId} 
        onSuccess={mutate} 
      />
    </div>
  );
}
