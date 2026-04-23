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
} from "lucide-react";

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

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
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

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
      contentClassName="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl p-0 flex flex-col bg-[oklch(0.15_0.02_260)] sm:border border-white/10 sm:rounded-lg overflow-hidden"
      showCloseButton={false}
    >
        <div className='flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4'>
          <h2 className='text-xl font-bold text-foreground'>
            {isEditMode ? "Edit Lead" : "Add New Lead"}
          </h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onOpenChange(false)}
            className='h-8 w-8 text-muted-foreground hover:bg-white/10 hover:text-foreground rounded-full'
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
              <div className='flex-2 p-6 border-r border-white/5 space-y-8'>
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
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder='John Doe' {...field} />
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
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder='Acme Inc' {...field} />
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
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder='9876543210' {...field} />
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
                            className='flex items-center gap-1 bg-white/10 hover:bg-white/10'
                          >
                            {tag}
                            <button
                              type='button'
                              onClick={() => handleRemoveTag(tag)}
                              className='ml-1 rounded-full p-0.5 hover:bg-white/20'
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
                        className='w-full border-dashed border-white/20 text-foreground/70 hover:bg-white/5 hover:text-foreground'
                      >
                        <Paperclip className='mr-2 h-4 w-4' />
                        Attach Files (Visual Mockup)
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Metadata & Actions */}
              <div className='w-full md:w-[280px] bg-white/[0.02] p-6 flex flex-col gap-6'>
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
                  <div className='space-y-3 rounded-lg border border-white/5 bg-white/5 p-4 text-xs'>
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
                            className='rounded border border-white/10 bg-white/5 p-3 text-sm'
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
                        className='w-full mt-2 bg-white/10 hover:bg-white/20 text-foreground'
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
                    <div className='space-y-4 max-h-[200px] overflow-y-auto pr-1 relative before:absolute before:inset-0 before:ml-[9px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent'>
                      {leadData.activityTimeline
                        .slice()
                        .reverse()
                        .map((activity: any, idx: number) => (
                          <div
                            key={idx}
                            className='relative flex items-start justify-between gap-3'
                          >
                            <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[oklch(0.15_0.02_260)] border border-white/20 ring-4 ring-[oklch(0.15_0.02_260)] z-10'>
                              <Check className='h-3 w-3 text-foreground/60' />
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

        <div className='flex items-center justify-end gap-3 border-t border-white/10 p-4 bg-black/20'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='border-white/10 text-foreground hover:bg-white/10 bg-transparent'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            form='lead-form'
            disabled={isSubmitting || (isEditMode && isLoading)}
            className='bg-gradient-to-r from-[oklch(0.60_0.22_260)] to-[oklch(0.55_0.25_285)] text-white hover:brightness-110 px-6'
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
