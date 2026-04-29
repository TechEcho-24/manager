"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Handshake,
  PhoneCall,
  CheckSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Briefcase,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/animated-number";
import { LeadFormPanel } from "@/components/lead-form-panel";
import { formatDistanceToNow, format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface DashboardData {
  stats: {
    totalLeads: number;
    newLeadsThisWeek: number;
    contacted: number;
    interested: number;
    followUpRequired: number;
    converted: number;
    lost: number;
    responseRate: number;
  };
  charts: {
    leadsByStatus: { status: string; count: number }[];
    leadsPerDay: { date: string; count: number }[];
  };
  lists: {
    recentActivity: {
      id: string;
      leadId: string;
      name: string;
      status: string;
      action: string;
      time: string;
    }[];
    upcomingFollowUps: {
      id: string;
      name: string;
      company?: string;
      status: string;
      date: string;
    }[];
  };
}

import { useSession } from "next-auth/react";
import { AdminDashboard } from "./AdminDashboard";

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === "admin";

  async function fetchData() {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) fetchData();
  }, [isAdmin]);

  if (sessionStatus === "loading" || (loading && !isAdmin)) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin) return <AdminDashboard />;

  if (error || !data) {
    return (
      <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircle className="h-10 w-10 text-red-500/50" />
        <p>{error || "Something went wrong"}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Leads",
      value: data.stats.totalLeads,
      icon: Users,
      color: "blue",
      trend: "+8%",
    },
    {
      title: "New This Week",
      value: data.stats.newLeadsThisWeek,
      icon: TrendingUp,
      color: "emerald",
      trend: "+12%",
    },
    {
      title: "Contacted",
      value: data.stats.contacted,
      icon: PhoneCall,
      color: "orange",
      trend: "-2%",
    },
    {
      title: "Interested",
      value: data.stats.interested,
      icon: CheckSquare,
      color: "indigo",
      trend: "+5%",
    },
    {
      title: "Follow-up",
      value: data.stats.followUpRequired,
      icon: Clock,
      color: "amber",
      trend: "6 pending",
    },
    {
      title: "Converted",
      value: data.stats.converted,
      icon: Handshake,
      color: "teal",
      trend: "+14%",
    },
    {
      title: "Lost Leads",
      value: data.stats.lost,
      icon: Briefcase,
      color: "rose",
      trend: "Low",
    },
    {
      title: "Response Rate",
      value: `${data.stats.responseRate}%`,
      icon: ArrowUpRight,
      color: "fuchsia",
      trend: "+3%",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session?.user?.name?.split(" ")[0] || "there"}! Here&apos;s your sales overview for today.
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
        >
          <TrendingUp className="h-4 w-4" />
          Create New Lead
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="group overflow-hidden border-border bg-card shadow-sm transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl hover:shadow-primary/5"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/50 transition-colors group-hover:bg-primary/10",
                  stat.color === "blue" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                  stat.color === "emerald" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  stat.color === "orange" && "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                  stat.color === "indigo" && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                  stat.color === "amber" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  stat.color === "teal" && "bg-teal-500/10 text-teal-600 dark:text-teal-400",
                  stat.color === "rose" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                  stat.color === "fuchsia" && "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
                )}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
                  stat.trend.startsWith('+') && "text-emerald-500",
                  stat.trend.startsWith('-') && "text-rose-500",
                )}>
                  {stat.trend}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  <AnimatedNumber value={stat.value} />
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Leads by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.leadsByStatus} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="status" stroke="var(--foreground)" opacity={0.6} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--foreground)" opacity={0.6} fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--muted)' }} 
                  contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--popover-foreground)' }}
                />
                <Bar dataKey="count" fill="oklch(0.60 0.22 260)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Leads Added (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.leadsPerDay} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--foreground)" opacity={0.6} fontSize={12} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis stroke="var(--foreground)" opacity={0.6} fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--popover-foreground)' }}
                />
                <Line type="monotone" dataKey="count" stroke="oklch(0.60 0.22 260)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4">
            {data.lists.recentActivity.length > 0 ? (
              data.lists.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground/90">
                      {activity.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action} • {activity.status}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground/80">No recent activity.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Upcoming Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4">
            {data.lists.upcomingFollowUps.length > 0 ? (
              data.lists.upcomingFollowUps.map((followup) => (
                <div key={followup.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.65_0.22_40)] to-[oklch(0.58_0.20_25)]">
                    <PhoneCall className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground/90">
                      {followup.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {followup.company || "No company"} • {followup.status}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="font-medium text-foreground/80">{format(new Date(followup.date), "MMM d")}</div>
                    <div>{format(new Date(followup.date), "h:mm a")}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground">No upcoming follow-ups.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <LeadFormPanel
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}
