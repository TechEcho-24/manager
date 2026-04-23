"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LeadFormPanel } from "@/components/lead-form-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LEAD_STATUSES } from "@/lib/constants";

// Types
type Lead = {
  id: string;
  leadId: string;
  fullName: string;
  company?: string;
  phone: string;
  email?: string;
  status: string;
  priority: string;
  leadSource?: string;
  nextFollowupDate?: string;
  createdAt: string;
};

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Status Color Mapping
const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    New: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
    Contacted: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20",
    Interested: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    "Not Interested": "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20",
    "Follow-up Required": "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
    Qualified: "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/20",
    "Proposal Sent": "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    Negotiation: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    "Converted (Won)": "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20",
    Lost: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
  };
  return map[status] || "bg-muted text-muted-foreground border-border";
};

const getPriorityColor = (priority: string) => {
  const map: Record<string, string> = {
    High: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
    Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    Low: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  };
  return map[priority] || "bg-muted text-muted-foreground";
};

function LeadsPageContent() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") || "";
  const editParam = searchParams.get("edit");

  // Filters state
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [debouncedSearch] = useDebounce(searchTerm, 300);

  // Form Panel State
  const [isFormOpen, setIsFormOpen] = useState(!!editParam);
  const [editingLeadId, setEditingLeadId] = useState<string | undefined>(editParam || undefined);

  // Sync state if URL changes
  useEffect(() => {
    if (searchParam) setSearchTerm(searchParam);
    if (editParam) {
      setEditingLeadId(editParam);
      setIsFormOpen(true);
    }
  }, [searchParam, editParam]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [dateRangeFilter, setDateRangeFilter] = useState("All");

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Delete Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  // Build query string
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    sortField,
    sortOrder,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter !== "All" && { status: statusFilter }),
    ...(priorityFilter !== "All" && { priority: priorityFilter }),
    ...(sourceFilter !== "All" && { leadSource: sourceFilter }),
    ...(dateRangeFilter !== "All" && { dateRange: dateRangeFilter }),
  }).toString();

  const { data, error, isLoading, mutate } = useSWR(
    `/api/leads?${queryParams}`,
    fetcher,
  );

  const leads: Lead[] = data?.leads || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalLeads = data?.pagination?.total || 0;

  // Handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length && leads.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleDelete = async (ids: string[]) => {
    try {
      const res = await fetch("/api/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        setDeleteDialogOpen(false);
        setLeadToDelete(null);
        mutate();
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleStatusUpdate = async (ids: string[], newStatus: string) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status: newStatus }),
      });
      if (res.ok) {
        if (selectedIds.size > 0) setSelectedIds(new Set()); // Clear selection if it was a bulk update
        mutate(); // Re-fetch
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground lg:text-3xl'>
            Leads
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Manage and track your sales leads.
          </p>
        </div>
        <Button 
          className='w-full bg-primary text-white hover:bg-primary/95 sm:w-auto shadow-lg shadow-primary/20 font-semibold'
          onClick={() => {
            setEditingLeadId(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          Add Lead
        </Button>
      </div>

      {/* Toolbar */}
      <div className='flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50' />
          <Input
            placeholder='Search leads...'
            className='pl-9 border-border bg-muted/20 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all rounded-lg'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:w-auto'>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className='w-full lg:w-[140px]'
          >
            <option value='All'>All Statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className='w-full lg:w-[130px]'
          >
            <option value='All'>All Priorities</option>
            <option value='High'>High</option>
            <option value='Medium'>Medium</option>
            <option value='Low'>Low</option>
          </Select>
          <Select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className='w-full lg:w-[140px]'
          >
            <option value='All'>All Sources</option>
            <option value='Website Form'>Website Form</option>
            <option value='Cold Call'>Cold Call</option>
            <option value='LinkedIn'>LinkedIn</option>
            <option value='Referral'>Referral</option>
            <option value='Trade Show'>Trade Show</option>
          </Select>
          <Select
            value={dateRangeFilter}
            onChange={(e) => {
              setDateRangeFilter(e.target.value);
              setPage(1);
            }}
            className='w-full lg:w-[140px]'
          >
            <option value='All'>All Time</option>
            <option value='This Week'>This Week</option>
            <option value='This Month'>This Month</option>
            <option value='Last 3 Months'>Last 3 Months</option>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className='flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2 animate-in slide-in-from-top-2'>
          <span className='text-sm font-medium text-foreground'>
            {selectedIds.size} selected
          </span>
          <div className='h-4 w-px bg-white/20' />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-8 border-border text-foreground bg-background hover:bg-muted font-medium'
              >
                Change Status
              </Button>
            </PopoverTrigger>
            <PopoverContent align='start' className='w-[200px] p-2'>
              <div className='space-y-1'>
                {LEAD_STATUSES.map((status) => (
                  <button
                    key={status}
                    className='w-full rounded-md px-2 py-1.5 text-left text-sm text-foreground/80 hover:bg-white/10 hover:text-foreground'
                    onClick={() =>
                      handleStatusUpdate(Array.from(selectedIds), status)
                    }
                  >
                    {status}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant='destructive'
            size='sm'
            className='h-8 bg-red-500/20 text-red-400 hover:bg-red-500/30 border-transparent'
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className='mr-2 h-3.5 w-3.5' />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      <div className='hidden rounded-xl border border-border bg-card shadow-sm md:block overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox
                  checked={
                    selectedIds.size === leads.length && leads.length > 0
                  }
                  onChange={toggleSelectAll}
                  aria-label='Select all'
                />
              </TableHead>
              <TableHead
                className='cursor-pointer hover:text-foreground'
                onClick={() => handleSort("fullName")}
              >
                <div className='flex items-center gap-1'>
                  Name <ArrowUpDown className='h-3 w-3' />
                </div>
              </TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Source</TableHead>
              <TableHead
                className='cursor-pointer hover:text-foreground'
                onClick={() => handleSort("status")}
              >
                <div className='flex items-center gap-1'>
                  Status <ArrowUpDown className='h-3 w-3' />
                </div>
              </TableHead>
              <TableHead>Priority</TableHead>
              <TableHead
                className='cursor-pointer hover:text-foreground'
                onClick={() => handleSort("nextFollowupDate")}
              >
                <div className='flex items-center gap-1'>
                  Next Follow-up <ArrowUpDown className='h-3 w-3' />
                </div>
              </TableHead>
              <TableHead
                className='cursor-pointer hover:text-foreground'
                onClick={() => handleSort("createdAt")}
              >
                <div className='flex items-center gap-1'>
                  Created <ArrowUpDown className='h-3 w-3' />
                </div>
              </TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className='h-24 text-center'>
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className='h-24 text-center text-muted-foreground'
                >
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  data-state={selectedIds.has(lead.id) ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      aria-label={`Select ${lead.fullName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className='font-medium text-foreground'>
                      {lead.fullName}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {lead.company || "No Company"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-sm text-foreground/80'>{lead.phone}</div>
                    <div className='text-xs text-muted-foreground'>
                      {lead.email || "No Email"}
                    </div>
                  </TableCell>
                  <TableCell className='text-sm text-foreground/70'>
                    {lead.leadSource || "-"}
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className='focus:outline-none focus:ring-2 focus:ring-[oklch(0.60_0.22_260)] focus:ring-offset-2 rounded-full ring-offset-background'>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status}
                          </Badge>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align='center' className='w-[200px] p-2'>
                        <div className='space-y-1'>
                          <div className='px-2 pb-2 text-xs font-semibold text-muted-foreground'>
                            Change Status
                          </div>
                          {LEAD_STATUSES.map((status) => (
                            <button
                              key={status}
                              className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/80 hover:bg-white/10 hover:text-foreground'
                              onClick={() =>
                                handleStatusUpdate([lead.id], status)
                              }
                            >
                              <div
                                className={`h-2 w-2 rounded-full ${getStatusColor(status).split(" ")[0]}`}
                              />
                              {status}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={`border-transparent ${getPriorityColor(lead.priority)}`}
                    >
                      {lead.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-sm text-foreground/70'>
                    {lead.nextFollowupDate
                      ? format(new Date(lead.nextFollowupDate), "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className='text-sm text-foreground/80'>
                    {format(new Date(lead.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-2'>
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-8 w-8 border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-8 w-8 border-white/10 bg-transparent hover:bg-white/10'
                        onClick={() => {
                          setEditingLeadId(lead.id);
                          setIsFormOpen(true);
                        }}
                      >
                        <Edit2 className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-8 w-8 border-white/10 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300'
                        onClick={() => {
                          setLeadToDelete(lead.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards View */}
      <div className='grid grid-cols-1 gap-4 md:hidden'>
        {isLoading ? (
          <div className='py-8 text-center text-muted-foreground'>Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className='py-8 text-center text-muted-foreground'>No leads found.</div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className='rounded-xl border border-border bg-card p-5 relative shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='absolute right-4 top-4'>
                <Checkbox
                  checked={selectedIds.has(lead.id)}
                  onChange={() => toggleSelect(lead.id)}
                  aria-label={`Select ${lead.fullName}`}
                />
              </div>
              <div className='mb-3 pr-8'>
                <h3 className='font-semibold text-foreground'>{lead.fullName}</h3>
                <p className='text-sm text-foreground/60'>
                  {lead.company || "No Company"}
                </p>
              </div>

              <div className='mb-4 grid grid-cols-2 gap-y-2 text-sm'>
                <div>
                  <span className='text-muted-foreground/80'>Phone:</span>
                  <div className='text-foreground/80'>{lead.phone}</div>
                </div>
                <div>
                  <span className='text-muted-foreground/80'>Status:</span>
                  <div>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className='text-muted-foreground/80'>Priority:</span>
                  <div>
                    <Badge
                      variant='outline'
                      className={`border-transparent ${getPriorityColor(lead.priority)}`}
                    >
                      {lead.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className='text-muted-foreground/80'>Follow-up:</span>
                  <div className='text-foreground/80'>
                    {lead.nextFollowupDate
                      ? format(new Date(lead.nextFollowupDate), "MMM d")
                      : "-"}
                  </div>
                </div>
              </div>

              <div className='flex items-center gap-2 pt-3 border-t border-border'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 border-white/10 bg-transparent hover:bg-white/10'
                >
                  <Eye className='mr-2 h-3 w-3' /> View
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 border-white/10 bg-transparent hover:bg-white/10'
                  onClick={() => {
                    setEditingLeadId(lead.id);
                    setIsFormOpen(true);
                  }}
                >
                  <Edit2 className='mr-2 h-3 w-3' /> Edit
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='shrink-0 border-white/10 bg-transparent hover:bg-white/10'
                    >
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align='end' className='w-[160px] p-2'>
                    <button
                      className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10'
                      onClick={() => {
                        setLeadToDelete(lead.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className='h-4 w-4' /> Delete Lead
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalLeads > 0 && (
        <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
          <p className='text-sm text-muted-foreground'>
            Showing{" "}
            <span className='font-medium text-foreground'>
              {(page - 1) * 20 + 1}
            </span>{" "}
            to{" "}
            <span className='font-medium text-foreground'>
              {Math.min(page * 20, totalLeads)}
            </span>{" "}
            of <span className='font-medium text-foreground'>{totalLeads}</span>{" "}
            leads
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className='border-white/10 bg-white/5 text-foreground hover:bg-white/10 disabled:opacity-50'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <div className='flex items-center px-3 py-1 rounded-md border border-white/10 bg-white/5 text-sm font-medium text-foreground'>
              Page {page} of {totalPages}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className='border-white/10 bg-white/5 text-foreground hover:bg-white/10 disabled:opacity-50'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            {leadToDelete ? "this lead" : `${selectedIds.size} leads`}? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setDeleteDialogOpen(false)}
            className='border-border bg-background text-foreground hover:bg-muted'
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={() => {
              if (leadToDelete) {
                handleDelete([leadToDelete]);
              } else {
                handleDelete(Array.from(selectedIds));
              }
            }}
            className='bg-red-500 hover:bg-red-600 text-foreground'
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>

      <LeadFormPanel
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        leadId={editingLeadId}
        onSuccess={() => mutate()}
      />
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading leads...</div>}>
      <LeadsPageContent />
    </Suspense>
  );
}
