"use client";

import { useMemo } from "react";
import useSWR from "swr";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  PieChart,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ─── Donut Chart (Pure CSS) ─────────────────────────────────────────────
function DonutChart({ segments, size = 140 }: { segments: { label: string; value: number; color: string }[], size?: number }) {
  const total = segments.reduce((a, b) => a + b.value, 0);
  if (total === 0) return <div className="flex items-center justify-center" style={{ width: size, height: size }}><span className="text-xs text-muted-foreground">No data</span></div>;
  
  let cumulative = 0;
  const gradientParts = segments.map((seg) => {
    const start = (cumulative / total) * 360;
    cumulative += seg.value;
    const end = (cumulative / total) * 360;
    return `${seg.color} ${start}deg ${end}deg`;
  });
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradientParts.join(", ")})`,
        }}
      />
      <div className="absolute rounded-full bg-card flex items-center justify-center" style={{ width: size * 0.6, height: size * 0.6 }}>
        <span className="text-lg font-black text-foreground">{total}</span>
      </div>
    </div>
  );
}

// ─── Bar (Pure CSS) ─────────────────────────────────────────────────────
function ProgressBar({ value, max, color, label, count }: { value: number; max: number; color: string; label: string; count: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-foreground">{label}</span>
        <span className="text-xs font-black text-muted-foreground">{count}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted/30 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data, isLoading } = useSWR("/api/leads?limit=500", fetcher);

  const leads = data?.leads || [];

  const stats = useMemo(() => {
    const total = leads.length;

    // ── Status Breakdown ─────────────────────────────
    const statusMap: Record<string, number> = {};
    leads.forEach((l: any) => {
      statusMap[l.status] = (statusMap[l.status] || 0) + 1;
    });

    // ── Source Breakdown ─────────────────────────────
    const sourceMap: Record<string, number> = {};
    leads.forEach((l: any) => {
      const src = l.leadSource || "Unknown";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    // ── Product Breakdown ────────────────────────────
    const productMap: Record<string, number> = {};
    leads.forEach((l: any) => {
      const prod = l.product || "Unknown";
      productMap[prod] = (productMap[prod] || 0) + 1;
    });

    // ── Priority Breakdown ───────────────────────────
    const priorityMap: Record<string, number> = {};
    leads.forEach((l: any) => {
      priorityMap[l.priority] = (priorityMap[l.priority] || 0) + 1;
    });

    // ── Financial ────────────────────────────────────
    const convertedLeads = leads.filter((l: any) => l.status === "Converted (Won)");
    const totalRevenue = convertedLeads.reduce((acc: number, l: any) => acc + (l.dealDetails?.totalValue || 0), 0);
    const totalReceived = convertedLeads.reduce((acc: number, l: any) => acc + (l.dealDetails?.receivedAmount || 0), 0);

    // ── Conversion Rate ──────────────────────────────
    const conversionRate = total > 0 ? ((convertedLeads.length / total) * 100).toFixed(1) : "0";

    // ── This Month vs Last Month ─────────────────────
    const now = new Date();
    const thisMonth = leads.filter((l: any) => new Date(l.createdAt).getMonth() === now.getMonth() && new Date(l.createdAt).getFullYear() === now.getFullYear()).length;
    const lastMonth = leads.filter((l: any) => {
      const d = new Date(l.createdAt);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    }).length;
    const monthGrowth = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(0) : thisMonth > 0 ? "+100" : "0";

    return {
      total,
      statusMap,
      sourceMap,
      productMap,
      priorityMap,
      convertedLeads: convertedLeads.length,
      totalRevenue,
      totalReceived,
      conversionRate,
      thisMonth,
      lastMonth,
      monthGrowth,
    };
  }, [leads]);

  const statusColors: Record<string, string> = {
    "New": "#6366f1",
    "Contacted": "#3b82f6",
    "Interested": "#8b5cf6",
    "Qualified": "#06b6d4",
    "Follow-up Required": "#f59e0b",
    "Converted (Won)": "#10b981",
    "Not Interested": "#ef4444",
    "Lost": "#78716c",
  };



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Reports & Analytics</h1></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 animate-pulse bg-muted/20 rounded-2xl border border-border" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-64 animate-pulse bg-muted/20 rounded-2xl border border-border" />)}
        </div>
      </div>
    );
  }

  const maxStatusCount = Math.max(...Object.values(stats.statusMap), 1);
  const maxSourceCount = Math.max(...Object.values(stats.sourceMap), 1);
  const maxProductCount = Math.max(...Object.values(stats.productMap), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Reports & Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time insights powered by your CRM data
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Leads</p>
                <h3 className="text-3xl font-black text-foreground mt-1">{stats.total}</h3>
                <div className={cn("flex items-center gap-1 mt-2 text-xs font-bold", Number(stats.monthGrowth) >= 0 ? "text-emerald-600" : "text-red-500")}>
                  {Number(stats.monthGrowth) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stats.monthGrowth}% vs last month
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Conversion Rate</p>
                <h3 className="text-3xl font-black text-foreground mt-1">{stats.conversionRate}%</h3>
                <p className="text-xs font-bold text-muted-foreground mt-2">{stats.convertedLeads} converted</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Target className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">₹{stats.totalRevenue.toLocaleString()}</h3>
                <p className="text-xs font-bold text-muted-foreground mt-2">₹{stats.totalReceived.toLocaleString()} received</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">This Month</p>
                <h3 className="text-3xl font-black text-foreground mt-1">{stats.thisMonth}</h3>
                <p className="text-xs font-bold text-muted-foreground mt-2">vs {stats.lastMonth} last month</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Status Distribution (Donut + Legend) */}
        <Card className="border-border bg-card shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Lead Status Distribution</h3>
            </div>
            <div className="flex items-center gap-8">
              <DonutChart
                segments={Object.entries(stats.statusMap).map(([label, value]) => ({
                  label,
                  value,
                  color: statusColors[label] || "#94a3b8",
                }))}
              />
              <div className="flex-1 space-y-2.5">
                {Object.entries(stats.statusMap).sort((a, b) => b[1] - a[1]).map(([label, count]) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[label] || "#94a3b8" }} />
                      <span className="text-xs font-semibold text-foreground">{label}</span>
                    </div>
                    <span className="text-xs font-black text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Source Breakdown (Horizontal Bars) */}
        <Card className="border-border bg-card shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Leads by Source</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.sourceMap).sort((a, b) => b[1] - a[1]).map(([source, count], i) => {
                const colors = ["#6366f1", "#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"];
                return (
                  <ProgressBar
                    key={source}
                    label={source}
                    count={count}
                    value={count}
                    max={maxSourceCount}
                    color={colors[i % colors.length]}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Product/Service Breakdown */}
        <Card className="border-border bg-card shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Interest by Product/Service</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.productMap).sort((a, b) => b[1] - a[1]).map(([product, count], i) => {
                const colors = ["#10b981", "#6366f1", "#f59e0b", "#3b82f6", "#ef4444"];
                return (
                  <ProgressBar
                    key={product}
                    label={product}
                    count={count}
                    value={count}
                    max={maxProductCount}
                    color={colors[i % colors.length]}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority Split */}
        <Card className="border-border bg-card shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Priority Distribution</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "High", color: "bg-red-500", textColor: "text-red-600", bgColor: "bg-red-500/10" },
                { label: "Medium", color: "bg-amber-500", textColor: "text-amber-600", bgColor: "bg-amber-500/10" },
                { label: "Low", color: "bg-emerald-500", textColor: "text-emerald-600", bgColor: "bg-emerald-500/10" },
              ].map(({ label, color, textColor, bgColor }) => {
                const count = stats.priorityMap[label] || 0;
                const pct = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
                return (
                  <div key={label} className={cn("rounded-2xl p-5 text-center border border-border/50", bgColor)}>
                    <div className={cn("text-3xl font-black", textColor)}>{count}</div>
                    <div className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>
                    <div className={cn("text-lg font-black mt-2", textColor)}>{pct}%</div>
                  </div>
                );
              })}
            </div>

            {/* Quick Insights */}
            <div className="mt-6 pt-5 border-t border-border space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Insights</h4>
              <div className="flex items-start gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/80">
                  <b className="text-emerald-600">{stats.convertedLeads}</b> out of <b>{stats.total}</b> leads have been successfully converted, giving you a <b className="text-emerald-600">{stats.conversionRate}%</b> conversion rate.
                </p>
              </div>
              {stats.statusMap["Follow-up Required"] > 0 && (
                <div className="flex items-start gap-3 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                  <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground/80">
                    <b className="text-amber-600">{stats.statusMap["Follow-up Required"]}</b> leads are waiting for follow-up. Don&apos;t let them go cold!
                  </p>
                </div>
              )}
              {stats.statusMap["Not Interested"] > 0 && (
                <div className="flex items-start gap-3 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground/80">
                    <b className="text-red-500">{stats.statusMap["Not Interested"]}</b> leads marked as not interested. Consider re-engaging after 30 days.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
