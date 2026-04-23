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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.60_0.22_260)]" />
      </div>
    );
  }

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
      color: "from-[oklch(0.60_0.22_260)] to-[oklch(0.55_0.25_285)]",
    },
    {
      title: "New This Week",
      value: data.stats.newLeadsThisWeek,
      icon: TrendingUp,
      color: "from-[oklch(0.65_0.20_160)] to-[oklch(0.55_0.18_140)]",
    },
    {
      title: "Contacted",
      value: data.stats.contacted,
      icon: PhoneCall,
      color: "from-[oklch(0.65_0.22_40)] to-[oklch(0.58_0.20_25)]",
    },
    {
      title: "Interested",
      value: data.stats.interested,
      icon: CheckSquare,
      color: "from-[oklch(0.70_0.18_300)] to-[oklch(0.60_0.20_280)]",
    },
    {
      title: "Follow-up Required",
      value: data.stats.followUpRequired,
      icon: Clock,
      color: "from-[oklch(0.65_0.25_30)] to-[oklch(0.55_0.22_20)]",
    },
    {
      title: "Converted (Won)",
      value: data.stats.converted,
      icon: Handshake,
      color: "from-[oklch(0.65_0.20_140)] to-[oklch(0.55_0.18_130)]",
    },
    {
      title: "Lost",
      value: data.stats.lost,
      icon: Briefcase,
      color: "from-[oklch(0.55_0.15_20)] to-[oklch(0.45_0.10_15)]",
    },
    {
      title: "Response Rate",
      value: `${data.stats.responseRate}%`,
      icon: ArrowUpRight,
      color: "from-[oklch(0.60_0.18_330)] to-[oklch(0.52_0.20_300)]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back! Here&apos;s your sales overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="border-border bg-card shadow-sm transition-all hover:bg-card/80 hover:shadow-md"
          >
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-lg lg:h-10 lg:w-10`}
                >
                  <stat.icon className="h-4 w-4 text-foreground lg:h-5 lg:w-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-bold text-[oklch(0.60_0.22_260)] lg:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-foreground/60">{stat.title}</p>
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
    </div>
  );
}
