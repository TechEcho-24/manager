"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import useSWR from "swr";
import { toast } from "sonner";
import {
  X,
  Loader2,
  CalendarIcon,
  Tag as TagIcon,
  Paperclip,
  Check,
  Zap,
  Mail,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LEAD_STATUSES, LEAD_PRIORITIES } from "@/lib/constants";

const leadFormSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  alternatePhone: z.string().optional(),
  email: z
    .union([z.string().email("Invalid email format"), z.literal("")])
    .optional(),
  company: z.string().optional(),
  designation: z.string().optional(),
  leadSource: z.string().min(1, "Lead Source is required"),
  campaignName: z.string().optional(),
  referredBy: z.string().optional(),
  product: z.string().min(1, "Product/Service is required"),
  requirementDescription: z.string().optional(),
  budget: z.string().optional(),
  quantity: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  nextFollowupDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.string(),
  dealDetails: z.object({
    totalValue: z.number(),
    receivedAmount: z.number(),
    paymentPlan: z.enum(['one-time', 'monthly', 'milestones']),
    installments: z.array(z.object({
      amount: z.number(),
      dueDate: z.string(),
      status: z.enum(['pending', 'paid']),
    })),
  }),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: string; // If provided, it's edit mode
  onSuccess?: () => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function LeadFormPanel({
  open,
  onOpenChange,
  leadId,
  onSuccess,
}: LeadFormPanelProps) {
  const isEditMode = !!leadId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema) as any,
    defaultValues: {
      fullName: "",
      phone: "",
      alternatePhone: "",
      email: "",
      company: "",
      designation: "",
      leadSource: "Website Form",
      campaignName: "",
      referredBy: "",
      product: "Product A",
      requirementDescription: "",
      budget: "Under ₹10K",
      quantity: "",
      city: "",
      state: "",
      address: "",
      assignedTo: "Admin User",
      priority: "Medium",
      nextFollowupDate: "",
      tags: [],
      status: "New",
      dealDetails: {
        totalValue: 0,
        receivedAmount: 0,
        paymentPlan: 'one-time',
        installments: [],
      },
    },
  });

  // Fetch lead data if in edit mode
  const {
    data: leadData,
    isLoading,
    mutate,
  } = useSWR(open && isEditMode ? `/api/leads/${leadId}` : null, fetcher);

  useEffect(() => {
    if (leadData && !isLoading) {
      form.reset({
        fullName: leadData.fullName || "",
        phone: leadData.phone || "",
        alternatePhone: leadData.alternatePhone || "",
        email: leadData.email || "",
        company: leadData.company || "",
        designation: leadData.designation || "",
        leadSource: leadData.leadSource || "Website Form",
        campaignName: leadData.campaignName || "",
        referredBy: leadData.referredBy || "",
        product: leadData.product || "Product A",
        requirementDescription: leadData.requirementDescription || "",
        budget: leadData.budget || "Under ₹10K",
        quantity: leadData.quantity || "",
        city: leadData.city || "",
        state: leadData.state || "",
        address: leadData.address || "",
        assignedTo: leadData.assignedTo || "Admin User",
        priority: leadData.priority || "Medium",
        nextFollowupDate: leadData.nextFollowupDate
          ? new Date(leadData.nextFollowupDate).toISOString().split("T")[0]
          : "",
        tags: leadData.tags || [],
        status: leadData.status || "New",
        dealDetails: leadData.dealDetails || {
          totalValue: 0,
          receivedAmount: 0,
          paymentPlan: 'one-time',
          installments: [],
        },
      });
    } else if (!isEditMode) {
      form.reset();
    }
  }, [leadData, isLoading, isEditMode, form]);

  const watchLeadSource = form.watch("leadSource");
  const tags = form.watch("tags") || [];

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        form.setValue("tags", [...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleAddNote = async () => {
    if (!noteInput.trim() || !isEditMode) return;
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          $push: {
            notes: { text: noteInput, createdAt: new Date() },
            activityTimeline: {
              action: "Note added",
              description: "A new note was added to this lead",
              createdAt: new Date(),
              createdBy: "Admin User",
            },
          },
        }),
      });
      if (res.ok) {
        setNoteInput("");
        toast.success("Note added successfully");
        mutate(); // refetch lead data to show note
      }
    } catch (err) {
      toast.error("Failed to add note");
    }
  };

  const onSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditMode ? `/api/leads/${leadId}` : "/api/leads";
      const method = isEditMode ? "PATCH" : "POST";

      // Ensure financial fields are numbers before sending
      const payload = {
        ...values,
        dealDetails: {
          ...values.dealDetails,
          totalValue: Number(values.dealDetails.totalValue) || 0,
          receivedAmount: Number(values.dealDetails.receivedAmount) || 0,
          installments: (values.dealDetails.installments || []).map((inst) => ({
            ...inst,
            amount: Number(inst.amount) || 0,
          })),
        },
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save lead");
      }

      toast.success(
        isEditMode ? "Lead updated successfully" : "Lead created successfully",
      );
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to save lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      contentClassName="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl p-0 flex flex-col bg-card sm:border border-border sm:rounded-2xl shadow-2xl overflow-hidden"
      showCloseButton={false}
    >
        <div className='flex shrink-0 items-center justify-between border-b border-border px-6 py-5 bg-muted/20'>
          <h2 className='text-xl font-bold tracking-tight text-foreground'>
            {isEditMode ? "Edit Lead" : "Add New Lead"}
          </h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onOpenChange(false)}
            className='h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors'
          >
            <X className='h-4 w-4' />
          </Button>
        </div>

        {isLoading && isEditMode ? (
          <div className='flex-1 flex items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <Form {...form}>
            <form
              id='lead-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex-1 overflow-y-auto overflow-x-hidden flex flex-col md:flex-row'
            >
              {/* Left Column - Main Form */}
              <div className='flex-2 p-6 border-r border-border space-y-8'>
                {/* Basic Information */}
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-[oklch(0.60_0.22_260)] uppercase tracking-wider'>
                    Basic Information
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='fullName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</FormLabel>
                          <FormControl>
                            <Input className="h-10 rounded-xl bg-muted/10 border-border focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all" placeholder='John Doe' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='company'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company Name</FormLabel>
                          <FormControl>
                            <Input className="h-10 rounded-xl bg-muted/10 border-border focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all" placeholder='Acme Inc' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='phone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number *</FormLabel>
                          <FormControl>
                            <Input className="h-10 rounded-xl bg-muted/10 border-border focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all" placeholder='9876543210' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='alternatePhone'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alternate Phone</FormLabel>
                          <FormControl>
                            <Input placeholder='9876543211' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder='john@example.com' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='designation'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation</FormLabel>
                          <FormControl>
                            <Input placeholder='CEO' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Lead Source */}
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-[oklch(0.60_0.22_260)] uppercase tracking-wider'>
                    Lead Source
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='leadSource'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source *</FormLabel>
                          <FormControl>
                            <Select {...field}>
                              <option value='Website Form'>Website Form</option>
                              <option value='Cold Call'>Cold Call</option>
                              <option value='Referral'>Referral</option>
                              <option value='Social Media'>Social Media</option>
                              <option value='Email Campaign'>
                                Email Campaign
                              </option>
                              <option value='Walk-in'>Walk-in</option>
                              <option value='Exhibition'>Exhibition</option>
                              <option value='Partner'>Partner</option>
                              <option value='Other'>Other</option>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='campaignName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Name</FormLabel>
                          <FormControl>
                            <Input placeholder='Summer Sale 2026' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {watchLeadSource === "Referral" && (
                      <FormField
                        control={form.control}
                        name='referredBy'
                        render={({ field }) => (
                          <FormItem className='md:col-span-2'>
                            <FormLabel>Referred By</FormLabel>
                            <FormControl>
                              <Input placeholder='Partner Name' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Requirement Details */}
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-[oklch(0.60_0.22_260)] uppercase tracking-wider'>
                    Requirement Details
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='product'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interested Product/Service *</FormLabel>
                          <FormControl>
                            <Select {...field}>
                              <option value='Product A'>Product A</option>
                              <option value='Product B'>Product B</option>
                              <option value='Service X'>Service X</option>
                              <option value='Service Y'>Service Y</option>
                              <option value='Custom'>Custom</option>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='budget'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget</FormLabel>
                          <FormControl>
                            <Select {...field}>
                              <option value='Under ₹10K'>Under ₹10K</option>
                              <option value='₹10K–₹50K'>₹10K–₹50K</option>
                              <option value='₹50K–₹1L'>₹50K–₹1L</option>
                              <option value='₹1L–₹5L'>₹1L–₹5L</option>
                              <option value='Above ₹5L'>Above ₹5L</option>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='requirementDescription'
                      render={({ field }) => (
                        <FormItem className='md:col-span-2'>
                          <FormLabel>Requirement Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='Details about what they are looking for...'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='quantity'
                      render={({ field }) => (
                        <FormItem className='md:col-span-2'>
                          <FormLabel>Quantity/Scope</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g. 50 licenses' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Location Details */}
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-[oklch(0.60_0.22_260)] uppercase tracking-wider'>
                    Location Details
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='city'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder='Mumbai' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='state'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder='Maharashtra' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='address'
                      render={({ field }) => (
                        <FormItem className='md:col-span-2'>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder='Full address' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-[oklch(0.60_0.22_260)] uppercase tracking-wider'>
                    Additional Information
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='assignedTo'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To</FormLabel>
                          <FormControl>
                            <Input placeholder='Admin User' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='priority'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <FormControl>
                            <Select {...field}>
                              {LEAD_PRIORITIES.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='nextFollowupDate'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Follow-up Date</FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <Input
                                type='date'
                                className='[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer'
                                {...field}
                              />
                              <CalendarIcon className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80 pointer-events-none' />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='md:col-span-2 space-y-2'>
                      <FormLabel>Tags</FormLabel>
                      <div className='flex flex-wrap gap-2 mb-2'>
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant='secondary'
                            className='flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 border-none'
                          >
                            {tag}
                            <button
                              type='button'
                              onClick={() => handleRemoveTag(tag)}
                              className='ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors'
                            >
                              <X className='h-3 w-3' />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className='relative'>
                        <TagIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80' />
                        <Input
                          placeholder='Type a tag and press Enter'
                          className='pl-9'
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                        />
                      </div>
                    </div>
                    <div className='md:col-span-2 pt-2'>
                        <Button
                          type='button'
                          variant='outline'
                          className='w-full border-dashed border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all'
                        >
                        <Paperclip className='mr-2 h-4 w-4' />
                        Attach Files (Visual Mockup)
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Deal Details - Only for Converted Leads */}
                {form.watch("status") === "Converted (Won)" && (
                  <div className='space-y-6 pt-4 border-t border-border mt-4'>
                    <div className="flex items-center gap-2">
                       <Zap className="h-4 w-4 text-primary" />
                       <h3 className='text-sm font-bold text-foreground uppercase tracking-wider'>
                        Deal & Payment Tracking
                      </h3>
                    </div>
                    
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <FormField
                        control={form.control}
                        name='dealDetails.totalValue'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deal Value (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" className="h-10 rounded-xl bg-primary/5 font-bold text-primary" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='dealDetails.receivedAmount'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Received (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" className="h-10 rounded-xl bg-emerald-500/5 font-bold text-emerald-600" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='dealDetails.paymentPlan'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Plan</FormLabel>
                            <FormControl>
                              <Select {...field} className="rounded-xl">
                                <option value='one-time'>One-time</option>
                                <option value='monthly'>Monthly</option>
                                <option value='milestones'>Milestones</option>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Milestones / Installments</FormLabel>
                          {form.watch("dealDetails.installments") && form.watch("dealDetails.installments").length > 0 && (
                            <div className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                              (form.watch("dealDetails.installments").reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)) === Number(form.watch("dealDetails.totalValue"))
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            )}>
                              Milestone Total: ₹{form.watch("dealDetails.installments").reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString()} 
                              {form.watch("dealDetails.installments").reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) !== Number(form.watch("dealDetails.totalValue")) && 
                                ` (Mismatch: Total Deal Value is ₹${Number(form.watch("dealDetails.totalValue")).toLocaleString()})`}
                            </div>
                          )}
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[10px] uppercase font-bold border-primary/20 text-primary hover:bg-primary/5"
                          onClick={() => {
                            const current = form.getValues("dealDetails.installments") || [];
                            form.setValue("dealDetails.installments", [
                              ...current, 
                              { amount: 0, dueDate: new Date().toISOString().split('T')[0], status: 'pending' }
                            ]);
                          }}
                        >
                          + Add Milestone
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {form.watch("dealDetails.installments")?.map((_, index) => (
                          <div key={index} className="flex gap-3 items-end bg-muted/20 p-3 rounded-xl border border-border">
                            <FormField
                              control={form.control}
                              name={`dealDetails.installments.${index}.dueDate`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-[10px] uppercase text-muted-foreground">Due Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" className="h-8 text-xs rounded-lg" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`dealDetails.installments.${index}.amount`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-[10px] uppercase text-muted-foreground">Amount (₹)</FormLabel>
                                  <FormControl>
                                    <Input type="number" className="h-8 text-xs rounded-lg font-bold" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`dealDetails.installments.${index}.status`}
                              render={({ field }) => (
                                <FormItem className="w-[100px]">
                                  <FormLabel className="text-[10px] uppercase text-muted-foreground">Status</FormLabel>
                                  <FormControl>
                                    <Select {...field} className="h-8 text-xs rounded-lg">
                                      <option value="pending">Pending</option>
                                      <option value="paid">Paid</option>
                                    </Select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <div className="flex gap-1 mb-[2px]">
                               <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg"
                                title="Send Reminder"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                                onClick={() => {
                                  const current = form.getValues("dealDetails.installments");
                                  form.setValue("dealDetails.installments", current.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {(!form.watch("dealDetails.installments") || form.watch("dealDetails.installments").length === 0) && (
                          <div className="text-center py-6 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                            <p className="text-xs italic">No payment milestones added yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Metadata & Actions */}
              <div className='w-full md:w-[280px] bg-muted/10 p-6 flex flex-col gap-6'>
                {/* Status Selector */}
                <div className='space-y-2'>
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lead Status</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            className='bg-white/5 border-white/10 focus:ring-[oklch(0.60_0.22_260)]'
                          >
                            {LEAD_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Read Only Meta */}
                {isEditMode && leadData && (
                  <div className='space-y-3 rounded-xl border border-border bg-muted/20 p-4 text-xs'>
                    <div>
                      <div className='text-muted-foreground/80 mb-1'>Lead ID</div>
                      <div className='font-medium text-foreground'>
                        {leadData.leadId}
                      </div>
                    </div>
                    <div>
                      <div className='text-muted-foreground/80 mb-1'>Created On</div>
                      <div className='text-foreground/80'>
                        {format(new Date(leadData.createdAt), "PPP p")}
                      </div>
                    </div>
                    <div>
                      <div className='text-muted-foreground/80 mb-1'>Last Updated</div>
                      <div className='text-foreground/80'>
                        {format(new Date(leadData.updatedAt), "PPP p")}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {isEditMode && (
                  <div className='space-y-3 flex-1 flex flex-col'>
                    <h3 className='text-sm font-semibold text-foreground'>Notes</h3>
                    <div className='space-y-2 flex-1 overflow-y-auto pr-1'>
                      {leadData?.notes && leadData.notes.length > 0 ? (
                        leadData.notes.map((note: any, idx: number) => (
                          <div
                            key={idx}
                            className='rounded-xl border border-border bg-card p-3 text-sm shadow-sm'
                          >
                            <p className='text-foreground/80 whitespace-pre-wrap'>
                              {note.text}
                            </p>
                            <div className='mt-2 text-[10px] text-muted-foreground/80'>
                              {format(
                                new Date(note.createdAt),
                                "MMM d, h:mm a",
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className='text-xs text-muted-foreground/80 italic'>
                          No notes added yet.
                        </div>
                      )}
                    </div>
                    <div className='pt-2'>
                      <Textarea
                        placeholder='Add a new note...'
                        className='min-h-[80px] text-xs resize-none'
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                      />
                      <Button
                        type='button'
                        size='sm'
                        className='w-full mt-2 bg-muted hover:bg-muted/80 text-foreground'
                        onClick={handleAddNote}
                        disabled={!noteInput.trim()}
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>
                )}

                {/* Activity Timeline */}
                {isEditMode && leadData?.activityTimeline && (
                  <div className='space-y-3 pt-4 border-t border-white/10'>
                    <h3 className='text-sm font-semibold text-foreground'>
                      Timeline
                    </h3>
                    <div className='space-y-4 max-h-[200px] overflow-y-auto pr-1 relative before:absolute before:inset-0 before:ml-[9px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent'>
                      {leadData.activityTimeline
                        .slice()
                        .reverse()
                        .map((activity: any, idx: number) => (
                          <div
                            key={idx}
                            className='relative flex items-start justify-between gap-3'
                          >
                            <div className='relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-card border border-border ring-4 ring-card z-10'>
                              <Check className='h-3 w-3 text-primary' />
                            </div>
                            <div className='flex-1 space-y-1'>
                              <p className='text-xs font-medium text-foreground'>
                                {activity.action}
                              </p>
                              <p className='text-[10px] text-muted-foreground'>
                                {activity.description}
                              </p>
                              <p className='text-[10px] text-foreground/30'>
                                {format(
                                  new Date(activity.createdAt),
                                  "MMM d, h:mm a",
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </Form>
        )}

        <div className='flex items-center justify-end gap-3 border-t border-border p-5 bg-muted/20'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='border-border text-foreground hover:bg-muted bg-background h-10 px-6 rounded-xl'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form='lead-form'
            disabled={isSubmitting || (isEditMode && isLoading)}
            className='bg-primary text-white hover:bg-primary/90 h-10 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all font-bold'
          >
            {isSubmitting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            Save Lead
          </Button>
        </div>
    </Dialog>
  );
}
