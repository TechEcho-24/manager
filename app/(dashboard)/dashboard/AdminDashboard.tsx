"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Users, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight, 
  Plus,
  Zap,
  TrendingUp,
  LayoutDashboard,
  Loader2,
  MoreVertical,
  Mail,
  Building
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/animated-number";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function AdminDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") || "dashboard";
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "revenue">(tabParam as any);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setActiveTab(tabParam as any);
  }, [tabParam]);
  
  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Admin Stats API Error:", errorText);
        throw new Error(`Server returned ${res.status}`);
      }

      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      console.error("Dashboard Fetch Failed:", err);
      toast.error("Signal failure: " + err.message);
      // Fallback data to prevent infinite loader
      setData((prev: any) => prev || { 
        stats: { totalUsers: 0, totalLeads: 0, totalRevenue: 0, dailyRevenue: 0, monthlyRevenue: 0 }, 
        planDistribution: { starter: 0, growth: 0, pro: 0 },
        userUsage: [], 
        recentActivity: [],
        recentPurchases: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl italic">
            Command Center
          </h1>
          <p className="text-[10px] font-black text-muted-foreground/50 tracking-[0.4em] uppercase mt-2">
            Super Admin Protocol • Access Level: Maximum
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border/10 backdrop-blur-xl">
           {[
             { id: 'dashboard', label: 'Dashboard', icon: Activity },
             { id: 'users', label: 'Subscribers', icon: Users },
             { id: 'revenue', label: 'Revenue', icon: DollarSign }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => {
                 setActiveTab(tab.id as any);
                 router.push(`/dashboard?tab=${tab.id}`, { scroll: false });
               }}
               className={cn(
                 "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                 activeTab === tab.id 
                  ? "bg-white text-black shadow-[0_10px_20px_rgba(0,0,0,0.2)] scale-[1.02]" 
                  : "text-muted-foreground/50 hover:text-foreground hover:bg-white/5"
               )}
             >
               <tab.icon className="h-3 w-3" />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-12">
          {/* Admin Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Total Users", value: data.stats.totalUsers, icon: Users, color: "blue", trend: "Sync OK" },
              { title: "Platform Revenue", value: data.stats.totalRevenue, icon: DollarSign, color: "emerald", trend: "Lifetime", prefix: "₹" },
              { title: "Daily Revenue", value: data.stats.dailyRevenue, icon: Activity, color: "orange", trend: "Today", prefix: "₹" },
              { title: "Total Leads", value: data.stats.totalLeads, icon: Zap, color: "indigo", trend: "Across Orgs" },
            ].map((stat: any) => (
              <Card key={stat.title} className="border-border bg-card/50 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-xl rounded-3xl overflow-hidden group hover:border-indigo-500/40 transition-all border-t border-t-white/5 dark:border-t-white/5">
                <CardContent className="p-7">
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "p-3 rounded-2xl",
                      stat.color === "blue" && "bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]",
                      stat.color === "emerald" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
                      stat.color === "orange" && "bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.1)]",
                      stat.color === "indigo" && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[0_0_20_rgba(99,102,241,0.1)]",
                    )}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground/30 tracking-widest">{stat.trend}</span>
                  </div>
                  <div className="mt-5">
                    <div className="text-3xl font-black flex items-baseline gap-1 text-foreground">
                      {stat.prefix}<AnimatedNumber value={stat.value} />{stat.suffix}
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground/50 tracking-[0.2em] mt-1.5 uppercase">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-border bg-card/50 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-xl rounded-[2.5rem] p-8 border-t border-t-white/5 dark:border-t-white/5">
              <h3 className="text-[10px] font-black tracking-[0.3em] opacity-40 text-foreground mb-6 uppercase">Live Signal Feed</h3>
              <div className="space-y-4">
                  {data.recentActivity.map((act: any, i: number) => (
                    <div key={i} className="flex gap-4 items-start border-l-2 border-indigo-500/20 pl-4 py-1">
                        <div className={cn(
                          "h-2 w-2 rounded-full mt-1.5 shrink-0",
                          act.type === 'lead' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        )} />
                        <div>
                          <p className="text-[11px] font-bold text-foreground/80 leading-tight">{act.message}</p>
                          <p className="text-[9px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-widest">
                            {formatDistanceToNow(new Date(act.date))} ago
                          </p>
                        </div>
                    </div>
                  ))}
              </div>
            </Card>

            <Card className="border-border bg-indigo-600/5 dark:bg-indigo-600/10 backdrop-blur-3xl shadow-xl rounded-[3rem] p-10 flex flex-col items-center justify-center text-center gap-8 group overflow-hidden relative border-t border-t-white/10">
              <div className="h-24 w-24 rounded-full bg-indigo-600/20 border border-indigo-600/40 flex items-center justify-center shadow-2xl shadow-indigo-600/20">
                <TrendingUp className="h-12 w-12 text-indigo-500 animate-pulse" />
              </div>
              <div className="text-foreground">
                <h3 className="font-black text-2xl tracking-tighter italic">Growth Metrics</h3>
                <p className="text-[10px] font-bold text-muted-foreground/60 tracking-widest mt-3 ">Performance Pulse Active</p>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="w-[99%] h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,1)]" />
              </div>
              <span className="text-[9px] font-black text-indigo-500 tracking-[0.5em] animate-pulse uppercase">System Active</span>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <Card className="border-border bg-card/50 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-xl rounded-[2.5rem] overflow-hidden border-t border-t-white/5 dark:border-t-white/5">
          <div className="p-8 border-b border-border/10 flex items-center justify-between">
            <h3 className="font-black text-sm tracking-[0.3em] opacity-80 text-foreground uppercase">Subscriber Clusters</h3>
            <div className="flex gap-4">
               {Object.entries(data?.planDistribution || {}).map(([plan, count]: any) => (
                 <span key={plan} className="text-[10px] font-black tracking-widest text-foreground/30 uppercase">
                   {plan}: <span className="text-indigo-400">{count}</span>
                 </span>
               ))}
            </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-[13px] text-left">
                <thead className="bg-muted text-[10px] font-black tracking-widest text-foreground/40 uppercase">
                   <tr>
                      <th className="px-8 py-5">Node Identity</th>
                      <th className="px-6 py-5">Protocol Plan</th>
                      <th className="px-6 py-5">Lead Usage</th>
                      <th className="px-6 py-5">Team Usage</th>
                      <th className="px-6 py-5">Reminders</th>
                      <th className="px-6 py-5 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/5 text-foreground">
                   {data.userUsage.length === 0 ? (
                     <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                           <div className="flex flex-col items-center gap-3 opacity-20">
                              <Users className="h-12 w-12" />
                              <p className="font-black tracking-[0.2em] uppercase text-xs">No Nodes Detected</p>
                           </div>
                        </td>
                     </tr>
                   ) : data.userUsage.map((user: any) => (
                      <tr key={user.id} className="hover:bg-primary/[0.02] transition-colors group">
                         <td className="px-8 py-6">
                            <div className="flex flex-col">
                               <div className="font-black text-foreground text-sm tracking-tight">{user.name}</div>
                               <div className="text-[10px] font-bold text-muted-foreground/50 lowercase flex items-center gap-2 mt-1">
                                  <Building className="h-3 w-3" /> {user.email}
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <span className={cn(
                               "px-3 py-1 rounded-full text-[9px] font-black tracking-widest border uppercase",
                               user.plan === "pro" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 border-indigo-500/20" : 
                               user.plan === "growth" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20" :
                               "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20"
                            )}>
                               {user.plan}
                            </span>
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex flex-col gap-1.5">
                               <div className="flex items-center justify-between text-[10px] font-black">
                                 <span>{user.usage.leads} / {user.usage.leadsLimit === Infinity ? "∞" : user.usage.leadsLimit}</span>
                                 <span className="opacity-40">{Math.round((user.usage.leads / (user.usage.leadsLimit || 1)) * 100)}%</span>
                               </div>
                               <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full transition-all duration-500",
                                      (user.usage.leads / user.usage.leadsLimit) >= 0.8 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-indigo-500"
                                    )} 
                                    style={{ width: `${Math.min((user.usage.leads / (user.usage.leadsLimit || 1)) * 100, 100)}%` }} 
                                  />
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex items-center gap-2 font-black text-[11px]">
                               <Users className="h-3 w-3 text-muted-foreground/40" />
                               <span>{user.usage.team} / {user.usage.teamLimit === Infinity ? "∞" : user.usage.teamLimit}</span>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex items-center gap-2 font-black text-[11px]">
                               <Activity className="h-3 w-3 text-muted-foreground/40" />
                               <span>{user.usage.reminders} / {user.usage.remindersLimit === Infinity ? "∞" : user.usage.remindersLimit}</span>
                            </div>
                         </td>
                         <td className="px-6 py-6 text-right font-black uppercase text-[9px]">
                            <span className={cn(
                              "px-2 py-0.5 rounded-md",
                              user.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                            )}>
                              {user.status}
                            </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </Card>
      )}

      {activeTab === "revenue" && (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="border-border bg-card/50 dark:bg-zinc-900/40 backdrop-blur-3xl shadow-xl rounded-[2.5rem] p-8 border-t border-t-white/5 dark:border-t-white/5">
               <h3 className="text-[10px] font-black tracking-[0.3em] opacity-40 text-foreground mb-6 uppercase">Financial Pulse</h3>
               <div className="space-y-4">
                  {(data?.recentPurchases || []).map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl border border-border/50">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground">{p.name || 'Unknown'}</span>
                        <span className="text-[10px] font-medium text-muted-foreground/60 mt-0.5">{p.email}</span>
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1.5">{p.plan}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{p.amount}</span>
                         <p className="text-[8px] font-bold text-muted-foreground/30 mt-1 uppercase">Paid</p>
                      </div>
                    </div>
                  ))}
               </div>
             </Card>

             <Card className="border-border bg-emerald-500/5 dark:bg-emerald-500/10 backdrop-blur-3xl shadow-xl rounded-[3rem] p-10 flex flex-col items-center justify-center text-center gap-6 border-t border-t-white/5 dark:border-t-white/5">
                <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                   <DollarSign className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
                </div>
                <div>
                   <h4 className="text-3xl font-black text-foreground">₹{data.stats.totalRevenue}</h4>
                   <p className="text-[10px] font-black text-muted-foreground/50 tracking-[0.3em] uppercase mt-2">Gross Platform Volume</p>
                </div>
             </Card>
           </div>
        </div>
      )}

      {/* Admin Actions Placeholder */}
      {isAdding && (
         <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-md border-border/40 bg-card shadow-2xl rounded-[2.5rem] overflow-hidden p-8 animate-in zoom-in-95 duration-300">
               <div className="flex items-center justify-between mb-8 text-white">
                  <h3 className="text-xl font-black tracking-tight">Admin Action</h3>
                  <button onClick={() => setIsAdding(false)} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                     <XIcon className="h-5 w-5" />
                  </button>
               </div>
               <p className="text-sm text-muted-foreground font-bold text-center py-10">
                 User management and manual plan overrides are coming soon in the next update.
               </p>
            </Card>
         </div>
      )}
    </div>
  );
}

function XIcon({ className }: any) {
   return <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
}
