"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Bell,
  BellRing,
  RefreshCw,
  Calendar,
  Building2,
  Users,
  Globe,
  Briefcase,
  Target,
  Palette,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpDown,
  Bot,
  Phone,
  Mail,
  DollarSign,
  Layers,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface Client {
  id: string;
  organizationId: string | null;
  name: string;
  email: string;
  phone: string | null;
  plan: string;
  status: string;
  autoRenew: boolean;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  daysUntilExpiry: number | null;
  daysLeftTrial: number | null;
  lastReminderSent: string | null;
  // Step 1
  designation: string | null;
  recoveryEmail: string | null;
  website: string | null;
  preferredCommunicationChannel: string[];
  // Step 2
  entityType: string | null;
  industry: string | null;
  companySize: string | null;
  operatingRegion: string[];
  foundingYear: string | null;
  primaryBusinessModel: string[];
  // Step 3
  toolsUsed: string[];
  crmUsersCount: string | null;
  leadSources: string[];
  averageMonthlyLeads: string | null;
  hasExistingLeads: boolean | null;
  // Step 4
  revenueRange: string | null;
  gstRegistered: boolean | null;
  gstNumber: string | null;
  targetAudience: string[];
  businessPriority: string[];
  // Step 5
  themePreference: string | null;
  defaultCurrency: string | null;
  botName: string | null;
  welcomeMessage: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
}

const PLAN_COLORS: Record<string, string> = {
  pro: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  growth: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  starter: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  enterprise: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  trial: "bg-blue-500/10 text-blue-400",
  past_due: "bg-red-500/10 text-red-400",
  expired: "bg-red-500/10 text-red-400",
  cancelled: "bg-zinc-500/10 text-zinc-400",
};

function ExpiryBadge({ daysUntilExpiry, status }: { daysUntilExpiry: number | null; status: string }) {
  if (status === "trial") return null;
  if (status === "past_due" || status === "expired") {
    return (
      <span className="text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
        EXPIRED
      </span>
    );
  }
  if (daysUntilExpiry === null) return null;
  const color =
    daysUntilExpiry <= 5
      ? "text-red-400 bg-red-500/10 border-red-500/20"
      : daysUntilExpiry <= 15
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  return (
    <span className={cn("text-[10px] font-black border px-2 py-0.5 rounded-full", color)}>
      {daysUntilExpiry <= 0 ? "Expired" : `${daysUntilExpiry}d left`}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | boolean | string[] | undefined }) {
  let display: string;
  if (value === null || value === undefined) {
    display = "—";
  } else if (Array.isArray(value)) {
    display = value.length === 0 ? "—" : value.join(", ");
  } else if (typeof value === "boolean") {
    display = value ? "Yes" : "No";
  } else {
    display = value || "—";
  }

  const isEmpty = display === "—";

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-black tracking-widest text-muted-foreground/40 uppercase">{label}</span>
      <span className={cn("text-xs font-medium", isEmpty ? "text-muted-foreground/25 italic" : "text-foreground/80")}>
        {display}
      </span>
    </div>
  );
}

function ClientCard({ client }: { client: Client }) {
  const [expanded, setExpanded] = useState(false);
  const [reminderSent, setReminderSent] = useState(!!client.lastReminderSent);
  const [sending, setSending] = useState(false);

  const sendReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!client.organizationId) {
      toast.error("Client has no organization linked.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: client.organizationId,
          clientName: client.name,
          clientEmail: client.email,
          plan: client.plan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReminderSent(true);
        toast.success(`Reminder sent to ${client.name}!`);
      } else {
        toast.error(data.error || "Failed to send reminder.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSending(false);
    }
  };

  const isExpiringSoon =
    client.status === "active" && !client.autoRenew && client.daysUntilExpiry !== null && client.daysUntilExpiry <= 7;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        isExpiringSoon
          ? "border-amber-500/30 bg-amber-500/[0.03]"
          : "border-border/50 bg-card/50",
        expanded && "border-indigo-500/30"
      )}
    >
      {/* Collapsed Row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 overflow-hidden">
          {client.logoUrl ? (
            <img src={client.logoUrl} alt="" className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-sm font-black text-indigo-400">
              {client.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-sm text-foreground truncate">{client.name}</span>
            <span className={cn("text-[9px] font-black border px-2 py-0.5 rounded-full uppercase tracking-widest", PLAN_COLORS[client.plan] || PLAN_COLORS.starter)}>
              {client.plan}
            </span>
            <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase", STATUS_COLORS[client.status] || "")}>
              {client.status.replace("_", " ")}
            </span>
            <ExpiryBadge daysUntilExpiry={client.daysUntilExpiry} status={client.status} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-muted-foreground/60">{client.email}</span>
            {client.currentPeriodEnd && (
              <span className="text-[10px] text-muted-foreground/40 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(client.currentPeriodEnd), "dd MMM yyyy")}
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Billing mode */}
          <span className={cn(
            "hidden sm:flex items-center gap-1 text-[9px] font-black border px-2 py-0.5 rounded-full",
            client.autoRenew
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
          )}>
            {client.autoRenew ? <RefreshCw className="h-2.5 w-2.5" /> : <Calendar className="h-2.5 w-2.5" />}
            {client.autoRenew ? "AutoPay" : "Manual"}
          </span>

          {/* Reminder button */}
          {!client.autoRenew && (
            <button
              onClick={sendReminder}
              disabled={sending}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all",
                reminderSent
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                  : "bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20"
              )}
            >
              {sending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : reminderSent ? (
                <BellRing className="h-3 w-3" />
              ) : (
                <Bell className="h-3 w-3" />
              )}
              {reminderSent ? "Sent ✓" : "Remind"}
            </button>
          )}

          {/* Expand toggle */}
          <div className="text-muted-foreground/40">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Profile */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-2 border-t border-border/30">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* Account */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Account & Contact</span>
                  </div>
                  <InfoRow label="Email" value={client.email} />
                  <InfoRow label="Phone" value={client.phone} />
                  <InfoRow label="Designation" value={client.designation} />
                  <InfoRow label="Recovery Email" value={client.recoveryEmail} />
                  <InfoRow label="Website" value={client.website} />
                  <InfoRow label="Communication" value={client.preferredCommunicationChannel} />
                </div>

                {/* Business Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Business Identity</span>
                  </div>
                  <InfoRow label="Entity Type" value={client.entityType} />
                  <InfoRow label="Industry" value={client.industry} />
                  <InfoRow label="Company Size" value={client.companySize} />
                  <InfoRow label="Operating Region" value={client.operatingRegion} />
                  <InfoRow label="Founded Year" value={client.foundingYear} />
                  <InfoRow label="Business Model" value={client.primaryBusinessModel} />
                </div>

                {/* CRM & Leads */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Layers className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">CRM & Leads</span>
                  </div>
                  <InfoRow label="Tools Used" value={client.toolsUsed} />
                  <InfoRow label="Lead Sources" value={client.leadSources} />
                  <InfoRow label="CRM Users" value={client.crmUsersCount} />
                  <InfoRow label="Monthly Leads" value={client.averageMonthlyLeads} />
                  <InfoRow label="Has Existing Leads" value={client.hasExistingLeads} />
                </div>

                {/* Operations */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Briefcase className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Business Operations</span>
                  </div>
                  <InfoRow label="Revenue Range" value={client.revenueRange} />
                  <InfoRow label="GST Registered" value={client.gstRegistered} />
                  {client.gstRegistered && <InfoRow label="GST Number" value={client.gstNumber} />}
                  <InfoRow label="Target Audience" value={client.targetAudience} />
                  <InfoRow label="Business Priority" value={client.businessPriority} />
                </div>

                {/* Branding & Bot */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Palette className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Branding & Bot</span>
                  </div>
                  <InfoRow label="Theme" value={client.themePreference} />
                  <InfoRow label="Currency" value={client.defaultCurrency} />
                  <InfoRow label="Bot Name" value={client.botName} />
                  <InfoRow label="Welcome Message" value={client.welcomeMessage} />
                  {client.primaryColor && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black tracking-widest text-white/30 uppercase">Brand Color</span>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: client.primaryColor }} />
                        <span className="text-xs text-white/70">{client.primaryColor}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subscription Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                      <DollarSign className="h-3.5 w-3.5 text-rose-400" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Subscription</span>
                  </div>
                  <InfoRow label="Plan" value={client.plan.toUpperCase()} />
                  <InfoRow label="Billing" value={client.autoRenew ? "AutoPay (Recurring)" : "Manual Renewal"} />
                  {client.currentPeriodEnd && (
                    <InfoRow label="Expires On" value={format(new Date(client.currentPeriodEnd), "dd MMM yyyy, h:mm a")} />
                  )}
                  {client.lastReminderSent && (
                    <InfoRow
                      label="Last Reminder"
                      value={formatDistanceToNow(new Date(client.lastReminderSent), { addSuffix: true })}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billingFilter, setBillingFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"expiry_asc" | "expiry_desc" | "name_asc">("expiry_asc");

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((d) => {
        if (d.clients) setClients(d.clients);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...clients];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
      );
    }
    if (planFilter !== "all") list = list.filter((c) => c.plan === planFilter);
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter);
    if (billingFilter === "auto") list = list.filter((c) => c.autoRenew);
    if (billingFilter === "manual") list = list.filter((c) => !c.autoRenew);

    if (sortOrder === "expiry_asc") {
      list.sort((a, b) => {
        if (a.daysUntilExpiry !== null && b.daysUntilExpiry !== null) return a.daysUntilExpiry - b.daysUntilExpiry;
        if (a.daysUntilExpiry !== null) return -1;
        if (b.daysUntilExpiry !== null) return 1;
        return 0;
      });
    } else if (sortOrder === "expiry_desc") {
      list.sort((a, b) => {
        if (a.daysUntilExpiry !== null && b.daysUntilExpiry !== null) return b.daysUntilExpiry - a.daysUntilExpiry;
        if (a.daysUntilExpiry !== null) return 1;
        if (b.daysUntilExpiry !== null) return -1;
        return 0;
      });
    } else if (sortOrder === "name_asc") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [clients, search, planFilter, statusFilter, billingFilter, sortOrder]);

  const expiringSoon = filtered.filter(
    (c) => c.status === "active" && !c.autoRenew && c.daysUntilExpiry !== null && c.daysUntilExpiry <= 7
  );

  const expired = filtered.filter(
    (c) => c.status === "past_due" || c.status === "expired"
  );

  const rest = filtered.filter(
    (c) =>
      !(c.status === "active" && !c.autoRenew && c.daysUntilExpiry !== null && c.daysUntilExpiry <= 7) &&
      c.status !== "past_due" &&
      c.status !== "expired"
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SelectFilter = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none pl-4 pr-8 rounded-xl border border-border/50 bg-muted/30 text-sm text-foreground focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground italic">
            Client Intelligence
          </h1>
          <p className="text-[10px] font-black text-muted-foreground/40 tracking-[0.4em] uppercase mt-1">
            {clients.length} clients · {expiringSoon.length + expired.length} need attention
          </p>
        </div>

        <div className="flex items-center gap-2">
          {expiringSoon.length + expired.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black tracking-widest">
                {expiringSoon.length + expired.length} URGENT
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card/50 backdrop-blur-xl p-4 rounded-2xl">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/50 bg-muted/30 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          <SelectFilter
            value={planFilter}
            onChange={setPlanFilter}
            options={[
              { label: "All Plans", value: "all" },
              { label: "Starter", value: "starter" },
              { label: "Growth", value: "growth" },
              { label: "Pro", value: "pro" },
            ]}
          />

          <SelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Trial", value: "trial" },
              { label: "Past Due", value: "past_due" },
              { label: "Expired", value: "expired" },
            ]}
          />

          <SelectFilter
            value={billingFilter}
            onChange={setBillingFilter}
            options={[
              { label: "All Billing", value: "all" },
              { label: "AutoPay", value: "auto" },
              { label: "Manual", value: "manual" },
            ]}
          />

          <SelectFilter
            value={sortOrder}
            onChange={(v) => setSortOrder(v as typeof sortOrder)}
            options={[
              { label: "Expiry: Nearest First", value: "expiry_asc" },
              { label: "Expiry: Latest First", value: "expiry_desc" },
              { label: "Name A–Z", value: "name_asc" },
            ]}
          />
        </div>
      </Card>

      {/* Expiring / Expired Section */}
      {(expiringSoon.length > 0 || expired.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-red-500/20" />
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[10px] font-black tracking-widest uppercase">
                Needs Attention — {expiringSoon.length + expired.length} clients
              </span>
            </div>
            <div className="h-px flex-1 bg-red-500/20" />
          </div>
          <div className="space-y-2">
            {expired.map((c) => <ClientCard key={c.id} client={c} />)}
            {expiringSoon.map((c) => <ClientCard key={c.id} client={c} />)}
          </div>
        </div>
      )}

      {/* All Clients */}
      <div className="space-y-3">
        {(expiringSoon.length > 0 || expired.length > 0) && (
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/30" />
            <span className="text-[10px] font-black tracking-widest text-muted-foreground/30 uppercase">
              All Clients — {rest.length}
            </span>
            <div className="h-px flex-1 bg-border/30" />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
            <Users className="h-12 w-12" />
            <p className="font-black tracking-widest text-xs uppercase">No clients found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rest.map((c) => <ClientCard key={c.id} client={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
