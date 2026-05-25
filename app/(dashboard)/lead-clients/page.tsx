"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import useSWR from "swr";
import {
  Building2,
  Eye,
  FileText,
  Mail,
  Phone,
  ReceiptText,
  Search,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadFormPanel } from "@/components/lead-form-panel";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type LeadClient = {
  id: string;
  fullName: string;
  company?: string;
  designation?: string;
  email?: string;
  phone: string;
  product?: string;
  city?: string;
  clientInviteToken?: string;
  clientUserId?: string;
  hasContract: boolean;
  createdAt: string;
  dealDetails?: {
    totalValue?: number;
    receivedAmount?: number;
  };
};

type ClientsResponse = {
  clients?: LeadClient[];
  error?: string;
};

function money(amount = 0) {
  return `INR ${Math.round(amount).toLocaleString("en-IN")}`;
}

export default function LeadClientsPage() {
  const { data, isLoading, mutate } = useSWR<ClientsResponse>("/api/lead-clients", fetcher);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const clients = useMemo(() => data?.clients || [], [data?.clients]);
  const normalizedSearch = searchQuery.toLowerCase().trim();
  const filteredClients = clients.filter((client) => (
    !normalizedSearch ||
    client.fullName.toLowerCase().includes(normalizedSearch) ||
    client.company?.toLowerCase().includes(normalizedSearch) ||
    client.email?.toLowerCase().includes(normalizedSearch) ||
    client.phone.includes(normalizedSearch)
  ));
  const portalCount = clients.filter((client) => client.clientUserId).length;
  const outstandingTotal = clients.reduce((total, client) => {
    const dealValue = client.dealDetails?.totalValue || 0;
    const received = client.dealDetails?.receivedAmount || 0;
    return total + Math.max(dealValue - received, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Clients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Clients created from leads converted to successful deals
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Converted Clients" value={String(clients.length)} icon={Users} />
        <SummaryCard label="Portal Activated" value={String(portalCount)} icon={UserCheck} />
        <SummaryCard label="Outstanding Value" value={money(outstandingTotal)} icon={Wallet} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search clients by name, company, email, or phone..."
          className="h-12 rounded-xl bg-card pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl border border-border bg-muted/20" />
          ))}
        </div>
      ) : data?.error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-10 text-center text-sm font-bold text-destructive">
            {data.error}
          </CardContent>
        </Card>
      ) : filteredClients.length === 0 ? (
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Building2 className="h-11 w-11 opacity-30" />
            <p className="font-bold">{clients.length ? "No clients match your search." : "No converted clients yet."}</p>
            {!clients.length && <p className="text-sm">Convert a lead to Won and it will appear here.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => {
            const totalValue = client.dealDetails?.totalValue || 0;
            const received = client.dealDetails?.receivedAmount || 0;
            const outstanding = Math.max(totalValue - received, 0);
            const accessLabel = client.clientUserId ? "Portal Active" : client.clientInviteToken ? "Invite Pending" : "Not Invited";

            return (
              <Card key={client.id} className="overflow-hidden border-border bg-card">
                <CardContent className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-black">{client.fullName}</h2>
                      <span className="rounded-full border border-primary/15 bg-primary/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {accessLabel}
                      </span>
                      {client.hasContract && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-2 py-1 text-[10px] font-bold uppercase text-emerald-600">
                          <FileText className="h-3 w-3" />
                          Contract
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {client.company || "Direct Client"}
                      {client.designation ? ` - ${client.designation}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {client.email || "No email"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {client.phone}
                      </span>
                      <span>Converted {format(new Date(client.createdAt), "dd MMM yyyy")}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 lg:w-[350px]">
                    <ValueBox label="Deal Value" value={money(totalValue)} />
                    <ValueBox label="Received" value={money(received)} accent="text-emerald-600" />
                    <ValueBox label="Due" value={money(outstanding)} accent="text-amber-600" />
                  </div>

                  <div className="flex gap-2 lg:flex-col">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={() => {
                        setSelectedClientId(client.id);
                        setIsFormOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl" render={<Link href={`/deals/${client.id}/payments`} />}>
                      <ReceiptText className="h-4 w-4" />
                      Ledger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <LeadFormPanel
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        leadId={selectedClientId}
        onSuccess={mutate}
      />
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Users }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-black">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ValueBox({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-2.5">
      <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xs font-black ${accent || ""}`}>{value}</p>
    </div>
  );
}
