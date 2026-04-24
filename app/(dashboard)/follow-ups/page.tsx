"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { format, isPast, isToday, isFuture } from "date-fns";
import { 
  PhoneCall, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  User,
  Building2,
  Phone,
  Mail,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LeadFormPanel } from "@/components/lead-form-panel";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Lead = {
  id: string;
  fullName: string;
  company?: string;
  phone: string;
  email?: string;
  status: string;
  priority: string;
  nextFollowupDate?: string;
};

export default function FollowUpsPage() {
  const [activeTab, setActiveTab] = useState<"overdue" | "today" | "upcoming" | "attention">("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLeadId, setEditingLeadId] = useState<string | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Build query for active tab
  const getQuery = () => {
    if (activeTab === "attention") {
      return "/api/leads?hasFollowup=false&status=New,Contacted,Interested,Follow-up Required";
    }
    const rangeMap = {
      overdue: "Overdue",
      today: "Today",
      upcoming: "Upcoming"
    };
    return `/api/leads?hasFollowup=true&followUpRange=${rangeMap[activeTab]}`;
  };

  const { data, error, isLoading, mutate } = useSWR(getQuery(), fetcher);
  const leads: Lead[] = data?.leads || [];

  const filteredLeads = leads.filter(l => 
    l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phone.includes(searchQuery)
  );

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      High: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
      Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
      Low: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
    };
    return map[priority] || "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Follow-ups
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === "attention" 
              ? "Leads that need a follow-up date scheduled"
              : "Track and manage your scheduled customer touchpoints"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Stats in Header */}
          <div className="hidden items-center gap-4 rounded-xl border border-border bg-card p-1 px-3 sm:flex">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-semibold text-muted-foreground">Overdue Task</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-1">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {[
              { id: "overdue", label: "Overdue", icon: AlertCircle, color: "text-rose-500" },
              { id: "today", label: "Today", icon: Clock, color: "text-amber-500" },
              { id: "upcoming", label: "Upcoming", icon: Calendar, color: "text-blue-500" },
              { id: "attention", label: "Attention Needed", icon: Zap, color: "text-primary" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-semibold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? tab.color : "text-muted-foreground/40")} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input 
            placeholder="Search by name, company, or phone..." 
            className="pl-10 h-11 bg-card border-border rounded-xl shadow-sm focus:ring-4 focus:ring-primary/5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Leads List */}
      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-muted/20 border border-border" />
          ))
        ) : filteredLeads.length === 0 ? (
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">
                All caught up!
              </h3>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                No leads found in this category.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => (
            <Card 
              key={lead.id} 
              className="group relative overflow-hidden border-border bg-card transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Status Indicator Bar */}
                  <div className={cn(
                    "h-1.5 w-full md:h-full md:w-1.5 shrink-0",
                    activeTab === "overdue" ? "bg-rose-500" : 
                    activeTab === "today" ? "bg-amber-500" : 
                    activeTab === "upcoming" ? "bg-blue-500" : "bg-primary"
                  )} />
                  
                  <div className="flex-1 p-5 md:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground leading-tight">{lead.fullName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">{lead.company || "Individual"}</span>
                              <Badge variant="outline" className={cn("ml-2", getPriorityColor(lead.priority))}>
                                {lead.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-1">
                          <div className="flex items-center gap-2 text-sm text-foreground/80">
                            <Phone className="h-3.5 w-3.5 text-primary/50" />
                            {lead.phone}
                          </div>
                          {lead.email && (
                            <div className="flex items-center gap-2 text-sm text-foreground/80">
                              <Mail className="h-3.5 w-3.5 text-primary/50" />
                              {lead.email}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary/80 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                            <Zap className="h-3 w-3" />
                            {lead.status}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4 border-t border-border pt-4 sm:border-0 sm:pt-0">
                        {lead.nextFollowupDate ? (
                          <div className={cn(
                            "flex flex-col items-end px-4 py-2 rounded-xl border",
                            isPast(new Date(lead.nextFollowupDate)) && !isToday(new Date(lead.nextFollowupDate))
                              ? "bg-rose-500/5 border-rose-500/20 text-rose-600"
                              : isToday(new Date(lead.nextFollowupDate))
                                ? "bg-amber-500/5 border-amber-500/20 text-amber-600"
                                : "bg-muted/50 border-border text-foreground"
                          )}>
                            <div className="text-[10px] uppercase tracking-wider font-bold opacity-60">Follow-up Date</div>
                            <div className="text-sm font-bold">
                              {format(new Date(lead.nextFollowupDate), "PPP")}
                            </div>
                            <div className="text-xs font-semibold opacity-80">
                              {format(new Date(lead.nextFollowupDate), "p")}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-primary/5 border border-primary/20 text-primary px-4 py-2 rounded-xl text-center">
                            <div className="text-[10px] uppercase tracking-wider font-bold">Schedule Needed</div>
                            <div className="text-xs font-bold leading-tight mt-1">No date assigned</div>
                          </div>
                        )}

                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 h-9 border-border hover:bg-muted text-xs font-bold sm:flex-none uppercase tracking-wide px-4 rounded-xl"
                            onClick={() => {
                              setEditingLeadId(lead.id);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5 mr-2" /> Detail
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 h-9 bg-primary text-white hover:bg-primary/90 text-xs font-bold sm:flex-none uppercase tracking-wide px-4 rounded-xl shadow-lg shadow-primary/20"
                            onClick={() => {
                              // Fast mark as done or update logic
                              setEditingLeadId(lead.id);
                              setIsFormOpen(true);
                            }}
                          >
                            Action <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <LeadFormPanel
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        leadId={editingLeadId}
        onSuccess={() => {
          mutate();
        }}
      />
    </div>
  );
}
