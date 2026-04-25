"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";

export function AdminDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Stats
  const totalRevenue = clients.reduce((acc, c) => acc + (c.revenue || 0), 0);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (data.clients) setClients(data.clients);
    } catch (err) {
      toast.error("Signal failure: Could not reach client database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    companyName: "",
    subscriptionPlan: "Pro",
    revenue: 15000
  });

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });
      if (res.ok) {
        toast.success("Neural Node Linked: New client onboarded successfully.");
        setIsAdding(false);
        fetchClients();
        setNewClient({ name: "", email: "", companyName: "", subscriptionPlan: "Pro", revenue: 15000 });
      }
    } catch (err) {
      toast.error("Initialization failure");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Master Command Center</h1>
          <p className="text-sm font-bold text-muted-foreground uppercase opacity-40 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Administrative Access Verified
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Initialize New Client
        </button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Nodes", value: clients.length, icon: Users, color: "blue", trend: "Sync OK" },
          { title: "Platform Revenue", value: totalRevenue, icon: DollarSign, color: "emerald", trend: "Per Month", prefix: "₹" },
          { title: "Global Traffic", value: 432, icon: Activity, color: "orange", trend: "Normal" },
          { title: "Health Index", value: 99, icon: Zap, color: "indigo", trend: "Peak Performance", suffix: "%" },
        ].map((stat) => (
          <Card key={stat.title} className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden group hover:border-primary/40 transition-all">
            <CardContent className="p-7">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-3 rounded-2xl",
                  stat.color === "blue" && "bg-blue-500/10 text-blue-500",
                  stat.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                  stat.color === "orange" && "bg-orange-500/10 text-orange-500",
                  stat.color === "indigo" && "bg-indigo-500/10 text-indigo-500",
                )}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black uppercase text-muted-foreground/30 tracking-widest">{stat.trend}</span>
              </div>
              <div className="mt-5">
                <div className="text-3xl font-black flex items-baseline gap-1">
                  {stat.prefix}<AnimatedNumber value={stat.value} />{stat.suffix}
                </div>
                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Client Directory */}
        <Card className="lg:col-span-2 border-border/40 bg-card/40 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-border/10 flex items-center justify-between">
            <h3 className="font-black text-sm uppercase tracking-[0.3em] opacity-80">Subscriber Clusters</h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-[13px] text-left">
                <thead className="bg-muted/30 text-[10px] font-black uppercase tracking-widest opacity-30">
                   <tr>
                      <th className="px-8 py-5">Node Identity</th>
                      <th className="px-6 py-5">Protocol Plan</th>
                      <th className="px-6 py-5 text-right">Revenue</th>
                      <th className="px-8 py-5"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-border/5">
                   {clients.map((client) => (
                      <tr key={client._id} className="hover:bg-primary/[0.02] transition-colors group">
                         <td className="px-8 py-6">
                            <div className="flex flex-col">
                               <div className="font-black text-foreground text-sm uppercase tracking-tight">{client.name}</div>
                               <div className="text-[10px] font-bold text-muted-foreground/50 lowercase flex items-center gap-2 mt-1">
                                  <Building className="h-3 w-3" /> {client.companyName}
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <span className={cn(
                               "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                               client.subscriptionPlan === "Enterprise" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            )}>
                               {client.subscriptionPlan}
                            </span>
                         </td>
                         <td className="px-6 py-6 text-right font-black text-foreground">₹{client.revenue.toLocaleString()}</td>
                         <td className="px-8 py-6 text-right">
                            <button className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 hover:text-red-500">
                               <MoreVertical className="h-4 w-4" />
                            </button>
                         </td>
                      </tr>
                   ))}
                   {clients.length === 0 && (
                      <tr>
                         <td colSpan={4} className="p-20 text-center flex flex-col items-center gap-4">
                            <Loader2 className="h-10 w-10 text-muted-foreground/10" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">No Active Clusters Detected</p>
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
        </Card>

        {/* Global Analytics */}
        <div className="space-y-6">
           <Card className="border-border/40 bg-indigo-600/5 backdrop-blur-3xl shadow-2xl rounded-[3rem] p-10 flex flex-col items-center justify-center text-center gap-8 group overflow-hidden relative border-t border-t-white/10">
             <div className="h-24 w-24 rounded-full bg-indigo-600/20 border border-indigo-600/40 flex items-center justify-center shadow-2xl shadow-indigo-600/20">
               <TrendingUp className="h-12 w-12 text-indigo-500 animate-pulse" />
             </div>
             <div>
               <h3 className="font-black text-2xl uppercase tracking-tighter italic">Neural Pulse</h3>
               <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-3 leading-relaxed">Optimal signal strength detected across all client instances.</p>
             </div>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[99%] h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,1)]" />
             </div>
             <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.5em] animate-pulse">99.9% Up-Time</span>
           </Card>
        </div>
      </div>

      {/* Onboarding Modal Overlay */}
      {isAdding && (
         <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-md border-border/40 bg-card shadow-2xl rounded-[2.5rem] overflow-hidden p-8 animate-in zoom-in-95 duration-300">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black uppercase tracking-tight">Onboard New Node</h3>
                  <button onClick={() => setIsAdding(false)} className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                     <XIcon className="h-5 w-5" />
                  </button>
               </div>
               <form onSubmit={handleAddClient} className="space-y-6">
                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Client Name</label>
                        <input required className="w-full h-12 bg-muted/30 border border-border/40 rounded-xl px-4 text-sm font-bold mt-1.5 focus:border-indigo-500 focus:ring-0 outline-none" 
                           value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} placeholder="e.g. Anuj Sachan" />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Email Address</label>
                        <input required type="email" className="w-full h-12 bg-muted/30 border border-border/40 rounded-xl px-4 text-sm font-bold mt-1.5 focus:border-indigo-500 outline-none" 
                           value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder="client@example.com" />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Company Name</label>
                        <input required className="w-full h-12 bg-muted/30 border border-border/40 rounded-xl px-4 text-sm font-bold mt-1.5 focus:border-indigo-500 outline-none" 
                           value={newClient.companyName} onChange={e => setNewClient({...newClient, companyName: e.target.value})} placeholder="TechEcho Solutions" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Revenue (INR)</label>
                           <input type="number" className="w-full h-12 bg-muted/30 border border-border/40 rounded-xl px-4 text-sm font-bold mt-1.5 focus:border-indigo-500 outline-none" 
                              value={newClient.revenue} onChange={e => setNewClient({...newClient, revenue: parseInt(e.target.value)})} />
                        </div>
                        <div>
                           <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Tier</label>
                           <select className="w-full h-12 bg-muted/30 border border-border/40 rounded-xl px-4 text-sm font-bold mt-1.5 focus:border-indigo-500 outline-none appearance-none" 
                              value={newClient.subscriptionPlan} onChange={e => setNewClient({...newClient, subscriptionPlan: e.target.value})}>
                              <option value="Basic">Basic</option>
                              <option value="Pro">Pro</option>
                              <option value="Enterprise">Enterprise</option>
                           </select>
                        </div>
                     </div>
                  </div>
                  <button type="submit" className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3">
                     <Zap className="h-4 w-4" /> Link Neural Node
                  </button>
               </form>
            </Card>
         </div>
      )}
    </div>
  );
}

function XIcon({ className }: any) {
   return <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
}
