"use client";

import { useState } from "react";
import useSWR from "swr";
import { 
  Contact as ContactIcon, 
  Search, 
  Phone, 
  Mail, 
  UserPlus,
  Eye,
  Building2,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

type Contact = {
  id: string;
  fullName: string;
  company?: string;
  phone: string;
  email?: string;
  status: string;
};

export default function ContactsPage() {
  const { data, isLoading, mutate } = useSWR("/api/leads?limit=200", fetcher);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>();

  const contacts: Contact[] = data?.leads || [];
  
  const filteredContacts = contacts.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  ).sort((a, b) => a.fullName.localeCompare(b.fullName));

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const activeLetters = new Set(contacts.map(c => c.fullName.charAt(0).toUpperCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Contacts List
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your entire business directory in a clean sheet view
          </p>
        </div>
        <Button 
          className="gap-2 bg-primary text-white shadow-lg shadow-primary/20 font-bold rounded-xl h-11"
          onClick={() => {
            setSelectedContactId(undefined);
            setIsFormOpen(true);
          }}
        >
          <UserPlus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="flex gap-6 items-start">
        {/* Main Content Area */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <Input 
              placeholder="Search by name, email or company..." 
              className="pl-10 h-12 bg-card border-border rounded-xl shadow-sm focus:ring-4 focus:ring-primary/5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Table Sheet */}
          <Card className="border-border bg-card shadow-xl rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-16 text-center font-bold text-xs uppercase tracking-widest px-4">#</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest px-4">Full Name</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest px-4">Email Address</TableHead>
                    <TableHead className="font-bold text-xs uppercase tracking-widest px-4">Phone Number</TableHead>
                    <TableHead className="w-20 text-right px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse border-border/30">
                        <TableCell colSpan={5} className="h-16 bg-muted/5"></TableCell>
                      </TableRow>
                    ))
                  ) : filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                         <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <ContactIcon className="h-10 w-10 opacity-20 mb-3" />
                            <p className="text-sm font-bold uppercase tracking-widest">No matching contacts</p>
                         </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact, index) => {
                       const firstLetter = contact.fullName.charAt(0).toUpperCase();
                       const isFirstOfLetter = index === 0 || filteredContacts[index-1].fullName.charAt(0).toUpperCase() !== firstLetter;

                       return (
                        <TableRow 
                          key={contact.id} 
                          id={isFirstOfLetter ? `letter-${firstLetter}` : undefined}
                          className="group border-border/40 hover:bg-primary/[0.02] transition-colors"
                        >
                          <TableCell className="text-center font-bold text-muted-foreground/40 text-xs">
                            {(index + 1).toString().padStart(2, '0')}
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                {contact.fullName}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                <Building2 className="h-2.5 w-2.5" />
                                {contact.company || "Individual"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex items-center gap-2 text-sm text-foreground/80">
                              <Mail className="h-3.5 w-3.5 text-primary/40" />
                              {contact.email || "—"}
                            </div>
                          </TableCell>
                          <TableCell className="px-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                              <Phone className="h-3.5 w-3.5 text-primary/40" />
                              {contact.phone}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary"
                              onClick={() => {
                                setSelectedContactId(contact.id);
                                setIsFormOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Alphabet Sidebar (Fixed Right) */}
        <div className="hidden lg:flex flex-col sticky top-24 h-fit gap-0.5 bg-card border border-border p-2 rounded-2xl shadow-xl">
           <div className="text-[10px] font-black text-center text-primary/40 mb-2 uppercase tracking-tighter">Index</div>
          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className={cn(
                "h-6 w-6 flex items-center justify-center text-[10px] font-black rounded-lg transition-all",
                activeLetters.has(letter) 
                  ? "text-primary hover:bg-primary hover:text-white shadow-sm" 
                  : "text-muted-foreground/20 pointer-events-none"
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
