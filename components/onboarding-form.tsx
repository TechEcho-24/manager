"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { CldUploadWidget } from "next-cloudinary";
import {
  User,
  Building2,
  Target,
  Palette,
  Rocket,
  CheckCircle2,
  ChevronRight,
  Upload,
  Check,
  Briefcase,
  Network,
  Send,
  LogOut,
  Calendar,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, title: "Account & Contact", icon: User, description: "Personal Info" },
  { id: 2, title: "Business Identity", icon: Building2, description: "Structure" },
  { id: 3, title: "CRM & Leads", icon: Network, description: "Operations" },
  { id: 4, title: "Business Operations", icon: Briefcase, description: "Goals" },
  { id: 5, title: "Branding & Bot", icon: Palette, description: "Visuals & Bot" },
];

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFillLaterOpen, setIsFillLaterOpen] = useState(false);
  const router = useRouter();

  const { data: session, update } = useSession();

  const [formData, setFormData] = useState({
    // Step 1
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    designation: "",
    designationOther: "",
    recoveryEmail: "",
    website: "",
    preferredCommunicationChannel: [] as string[],

    // Step 2
    entityType: "Solo",
    industry: "",
    industryOther: "",
    companySize: "Solo",
    operatingRegion: [] as string[],
    foundingYear: "",
    primaryBusinessModel: [] as string[],

    // Step 3
    toolsUsed: [] as string[],
    toolsUsedOther: "",
    crmUsersCount: "Only Me",
    leadSources: [] as string[],
    leadSourcesOther: "",
    averageMonthlyLeads: "0-100",
    hasExistingLeads: false,

    // Step 4
    revenueRange: "Pre-revenue",
    gstRegistered: false,
    gstNumber: "",
    targetAudience: [] as string[],
    targetAudienceOther: "",
    businessPriority: [] as string[],

    // Step 5
    themePreference: "System Default",
    notificationPreferences: [] as string[],
    defaultCurrency: "USD",
    defaultCurrencyOther: "",
    logoUrl: "",
    primaryColor: "#7c3aed",
    botName: "Pinglly AI",
    welcomeMessage: "Hello! How can we assist your business today?",
  });

  useEffect(() => {
    try {
      const prefillStr = localStorage.getItem("onboardingPrefill");
      if (prefillStr) {
        const prefill = JSON.parse(prefillStr);
        setFormData((prev) => ({
          ...prev,
          fullName: prefill.name || prev.fullName,
          email: prefill.email || prev.email,
          phone: prefill.phone || prev.phone,
          recoveryEmail: prefill.email || prev.recoveryEmail,
        }));
      }
    } catch (e) {
      console.error("Failed to load prefill data", e);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: session.user.name || prev.fullName,
        email: session.user.email || prev.email,
      }));
    }
  }, [session]);

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.fullName &&
          formData.companyName &&
          formData.email &&
          formData.phone &&
          formData.designation &&
          (formData.designation !== "Other" || formData.designationOther)
        );
      case 2:
        return !!(
          formData.entityType &&
          formData.industry &&
          (formData.industry !== "Other" || formData.industryOther) &&
          formData.companySize &&
          formData.operatingRegion.length > 0 &&
          formData.foundingYear &&
          formData.primaryBusinessModel.length > 0
        );
      case 3:
        return !!(
          formData.toolsUsed.length > 0 &&
          (!formData.toolsUsed.includes("Other") || formData.toolsUsedOther) &&
          formData.crmUsersCount &&
          formData.leadSources.length > 0 &&
          (!formData.leadSources.includes("Other") || formData.leadSourcesOther) &&
          formData.averageMonthlyLeads
        );
      case 4:
        return !!(
          formData.revenueRange &&
          (!formData.gstRegistered || formData.gstNumber) &&
          formData.targetAudience.length > 0 &&
          formData.businessPriority.length > 0
        );
      case 5:
        return !!(
          formData.botName &&
          formData.welcomeMessage &&
          formData.primaryColor &&
          formData.defaultCurrency &&
          (formData.defaultCurrency !== "Other" || formData.defaultCurrencyOther)
        );
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (currentStep === STEPS.length) {
      setIsSubmitting(true);
      try {
        const payload = {
          ...formData,
          designation: formData.designation === "Other" ? formData.designationOther : formData.designation,
          industry: formData.industry === "Other" ? formData.industryOther : formData.industry,
          toolsUsed: formData.toolsUsed.map((t) => t === "Other" ? formData.toolsUsedOther : t),
          leadSources: formData.leadSources.map((s) => s === "Other" ? formData.leadSourcesOther : s),
          targetAudience: formData.targetAudience.map((t) => t === "Other" ? formData.targetAudienceOther : t),
          defaultCurrency: formData.defaultCurrency === "Other" ? formData.defaultCurrencyOther : formData.defaultCurrency,
        };

        const response = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to initialize protocol");

        localStorage.removeItem("onboardingPrefill");

        await update({
          onboardingCompleted: true,
          organizationId: result.organizationId,
        });

        setIsFinished(true);
      } catch (error) {
        console.error("Onboarding error:", error);
        setIsFinished(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scheduleCall = () => {
    setIsFillLaterOpen(false);
    router.push("/contact");
  };

  const continueLater = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setSingleChoice = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const setBooleanChoice = (field: keyof typeof formData, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- UI Components for Dropdowns ---

  const SingleSelect = ({ name, value, options, placeholder }: any) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={handleInputChange}
        className={cn(
          "h-13 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.05] px-5 pr-10 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-0",
          value ? "text-white" : "text-white/40"
        )}
      >
        <option value="" disabled className="bg-[#050510] text-white/40">
          {placeholder}
        </option>
        {options.map((opt: string) => (
          <option key={opt} value={opt} className="bg-[#050510] text-white py-2">
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );

  const MultiSelect = ({ field, options, placeholder }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selected = formData[field as keyof typeof formData] as string[];

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (opt: string) => {
      setFormData((prev: any) => {
        const arr = prev[field];
        if (arr.includes(opt)) {
          return { ...prev, [field]: arr.filter((item: string) => item !== opt) };
        } else {
          return { ...prev, [field]: [...arr, opt] };
        }
      });
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[52px] w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm transition-all flex flex-wrap gap-2 items-center"
        >
          {selected.length === 0 && <span className="text-white/40">{placeholder}</span>}
          {selected.map((item) => (
            <span
              key={item}
              className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5"
            >
              {item}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item);
                }}
                className="hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="ml-auto pointer-events-none text-white/50">
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a16] shadow-2xl custom-scrollbar"
            >
              {options.map((opt: string) => (
                <div
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={cn(
                    "px-5 py-3 cursor-pointer text-sm transition-colors border-b border-white/5 last:border-0",
                    selected.includes(opt)
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                        selected.includes(opt)
                          ? "border-indigo-500 bg-indigo-500 text-white"
                          : "border-white/20"
                      )}
                    >
                      {selected.includes(opt) && <Check className="h-3 w-3" />}
                    </div>
                    {opt}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className='flex flex-col lg:flex-row min-h-screen w-full bg-[#050510] overflow-x-hidden'>
      {/* Sidebar */}
      <div className='lg:w-[260px] xl:w-[280px] border-b lg:border-b-0 lg:border-r border-white/10 bg-white/[0.01] flex flex-row lg:flex-col p-4 lg:p-8 gap-2 lg:gap-0 overflow-x-auto lg:overflow-visible shrink-0'>
        <div className='hidden lg:flex flex-col items-start mb-10'>
          <img
            src='/assets/logo.png'
            alt='Pinglly Logo'
            className='h-7 object-contain'
          />
          <span
            className='text-[7px] font-bold tracking-[0.4em] text-indigo-400 ml-1 mt-1'
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Workspace Setup
          </span>
        </div>

        <div className='flex flex-row lg:flex-col gap-2 lg:gap-5 flex-1 lg:flex-none'>
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id && !isFinished;
            const isCompleted = currentStep > step.id || isFinished;

            return (
              <div
                key={step.id}
                className='relative flex items-center gap-2 lg:gap-3 group shrink-0'
              >
                <div
                  className={cn(
                    "relative z-10 flex h-7 w-7 lg:h-8 lg:w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-500",
                    isActive
                      ? "border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                      : isCompleted
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-white/5 bg-white/[0.02] text-white/20",
                  )}
                >
                  {isCompleted ? (
                    <Check className='h-3 w-3' />
                  ) : (
                    <Icon className='h-3 w-3' />
                  )}
                </div>
                <div className='hidden lg:flex flex-col'>
                  <span
                    className={cn(
                      "text-[10px] font-bold tracking-widest transition-all duration-500",
                      isActive
                        ? "text-white"
                        : isCompleted
                          ? "text-emerald-400/80"
                          : "text-white/20",
                    )}
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className='hidden lg:block mt-auto pt-6'>
          <div className='rounded-xl border border-white/10 bg-white/[0.03] p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span
                className='text-[8px] font-bold text-white/30 tracking-widest'
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Progress
              </span>
              <span
                className='text-[9px] font-bold text-indigo-400'
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                {isFinished
                  ? "100%"
                  : `${Math.round(((currentStep - 1) / STEPS.length) * 100)}%`}
              </span>
            </div>
            <div className='h-1 w-full rounded-full bg-white/5 overflow-hidden'>
              <motion.div
                className='h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                initial={{ width: 0 }}
                animate={{
                  width: isFinished
                    ? "100%"
                    : `${((currentStep - 1) / STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className='flex-1 relative lg:h-screen lg:overflow-y-auto lg:custom-scrollbar flex flex-col'>
        <div className="flex-1 flex flex-col justify-start pt-12 lg:pt-20 px-4 sm:px-6 lg:px-16 pb-32">
          <AnimatePresence mode='wait'>
            {!isFinished ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className='w-full max-w-4xl space-y-12 mx-auto'
              >
                {currentStep === 1 && (
                  <div className='space-y-10'>
                    <div className='space-y-4'>
                      <h1 className='text-4xl font-black text-white tracking-tight italic'>
                        Account & Contact.
                      </h1>
                      <p className='text-base text-white/60 font-medium'>
                        Let&apos;s set up your primary operator profile.
                      </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Full Name <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          name='fullName'
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder='John Doe'
                          className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Company Name <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          name='companyName'
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder='Acme Corp'
                          className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1 flex items-center'>
                          Work Email <span className='text-red-500 ml-1'>*</span>
                          {!!session?.user?.email && (
                            <span className='ml-3 text-[10px] text-emerald-400 font-semibold tracking-wide bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20'>
                              Auto-filled
                            </span>
                          )}
                        </Label>
                        <Input
                          name='email'
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder='john@company.com'
                          disabled={!!session?.user?.email}
                          className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:border-emerald-500/30'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Phone Number <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          name='phone'
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder='+1 (555) 000-0000'
                          className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Designation / Role <span className='text-red-500'>*</span>
                        </Label>
                        <SingleSelect 
                          name="designation"
                          value={formData.designation}
                          placeholder="Select your role"
                          options={["Founder", "CEO", "Sales Manager", "HR", "Marketing", "Operations", "Support", "Developer", "Other"]}
                        />
                        {formData.designation === "Other" && (
                          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-3">
                            <Input
                              name='designationOther'
                              value={formData.designationOther}
                              onChange={handleInputChange}
                              placeholder='Custom Role'
                              className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                            />
                          </motion.div>
                        )}
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Recovery Email
                        </Label>
                        <Input
                          name='recoveryEmail'
                          value={formData.recoveryEmail}
                          onChange={handleInputChange}
                          placeholder='alt@email.com'
                          className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Company Website URL
                        </Label>
                        <Input
                          name='website'
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder='https://example.com'
                          className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Preferred Communication Channel
                        </Label>
                        <MultiSelect 
                          field="preferredCommunicationChannel"
                          placeholder="Select channels"
                          options={["Email", "WhatsApp", "Calls"]}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className='space-y-10'>
                    <div className='space-y-4'>
                      <h1 className='text-4xl font-black text-white tracking-tight italic'>
                        Business Identity.
                      </h1>
                      <p className='text-base text-white/60 font-medium'>
                        Tell us about your organization.
                      </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Entity Type <span className='text-red-500'>*</span>
                        </Label>
                        <SingleSelect 
                          name="entityType"
                          value={formData.entityType}
                          placeholder="Select entity type"
                          options={["Solo", "Enterprise"]}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Industry / Business Type <span className='text-red-500'>*</span>
                        </Label>
                        <SingleSelect 
                          name="industry"
                          value={formData.industry}
                          placeholder="Select industry"
                          options={["Real Estate", "Healthcare", "SaaS", "Agency", "Education", "Finance", "E-commerce", "Manufacturing", "Local Business", "Other"]}
                        />
                        {formData.industry === "Other" && (
                          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-3">
                            <Input
                              name='industryOther'
                              value={formData.industryOther}
                              onChange={handleInputChange}
                              placeholder='Custom Industry'
                              className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                            />
                          </motion.div>
                        )}
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Company Size <span className='text-red-500'>*</span>
                        </Label>
                        <SingleSelect 
                          name="companySize"
                          value={formData.companySize}
                          placeholder="Select size"
                          options={["Solo", "2–10", "11–50", "51–200", "200+"]}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Operating Region <span className='text-red-500'>*</span>
                        </Label>
                        <MultiSelect 
                          field="operatingRegion"
                          placeholder="Select regions"
                          options={["Local", "State-wide", "Nationwide", "International"]}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Company Founding Year <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          type="number"
                          name='foundingYear'
                          value={formData.foundingYear}
                          onChange={handleInputChange}
                          placeholder='YYYY'
                          className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Primary Business Model <span className='text-red-500'>*</span>
                        </Label>
                        <MultiSelect 
                          field="primaryBusinessModel"
                          placeholder="Select models"
                          options={["B2B", "B2C", "D2C", "Marketplace", "Subscription", "Services", "Other"]}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className='space-y-10'>
                    <div className='space-y-4'>
                      <h1 className='text-4xl font-black text-white tracking-tight italic'>
                        CRM Usage & Leads.
                      </h1>
                      <p className='text-base text-white/60 font-medium'>
                        Define your operational systems and lead funnels.
                      </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Current Tools You Use <span className='text-red-500'>*</span>
                        </Label>
                        <MultiSelect 
                          field="toolsUsed"
                          placeholder="Select tools"
                          options={["Excel", "Google Sheets", "WhatsApp", "HubSpot", "Zoho", "Salesforce", "Notion", "Trello", "No CRM Currently", "Other"]}
                        />
                        {formData.toolsUsed.includes("Other") && (
                          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-3">
                            <Input
                              name='toolsUsedOther'
                              value={formData.toolsUsedOther}
                              onChange={handleInputChange}
                              placeholder='Other Tools'
                              className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                            />
                          </motion.div>
                        )}
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Where Do Your Leads Come From? <span className='text-red-500'>*</span>
                        </Label>
                        <MultiSelect 
                          field="leadSources"
                          placeholder="Select sources"
                          options={["Facebook Ads", "Instagram", "Google Ads", "Website", "WhatsApp", "Calls", "Referral", "LinkedIn", "Walk-ins", "Email Campaigns", "Other"]}
                        />
                        {formData.leadSources.includes("Other") && (
                          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-3">
                            <Input
                              name='leadSourcesOther'
                              value={formData.leadSourcesOther}
                              onChange={handleInputChange}
                              placeholder='Other Sources'
                              className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                            />
                          </motion.div>
                        )}
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Team Members Using CRM <span className='text-red-500'>*</span>
                        </Label>
                        <SingleSelect 
                          name="crmUsersCount"
                          value={formData.crmUsersCount}
                          placeholder="Select member count"
                          options={["Only Me", "2–5", "6–20", "20+"]}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Average Monthly Leads <span className='text-red-500'>*</span>
                        </Label>
                        <SingleSelect 
                          name="averageMonthlyLeads"
                          value={formData.averageMonthlyLeads}
                          placeholder="Select lead volume"
                          options={["0–100", "100–500", "500–5k", "5k+"]}
                        />
                      </div>
                      <div className='space-y-2 md:col-span-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Do You Already Have Existing Leads?
                        </Label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center transition-all", formData.hasExistingLeads ? "border-indigo-500 bg-indigo-500" : "border-white/20 bg-white/[0.02]")}>
                              {formData.hasExistingLeads && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-sm text-white/80">Yes</span>
                            <input type="radio" className="hidden" checked={formData.hasExistingLeads} onChange={() => setBooleanChoice("hasExistingLeads", true)} />
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center transition-all", !formData.hasExistingLeads ? "border-indigo-500 bg-indigo-500" : "border-white/20 bg-white/[0.02]")}>
                              {!formData.hasExistingLeads && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-sm text-white/80">No</span>
                            <input type="radio" className="hidden" checked={!formData.hasExistingLeads} onChange={() => setBooleanChoice("hasExistingLeads", false)} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className='space-y-10'>
                    <div className='space-y-4'>
                      <h1 className='text-4xl font-black text-white tracking-tight italic'>
                        Business Operations.
                      </h1>
                      <p className='text-base text-white/60 font-medium'>
                        Outline your goals and priorities.
                      </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Revenue Stream Range <span className='text-red-500'>*</span>
                        </Label>
                        <SingleSelect 
                          name="revenueRange"
                          value={formData.revenueRange}
                          placeholder="Select revenue range"
                          options={["Pre-revenue", "Under $10k/month", "$10k–$50k/month", "$50k–$500k/month", "$500k+"]}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Target Audience Segment <span className='text-red-500'>*</span>
                        </Label>
                        <MultiSelect 
                          field="targetAudience"
                          placeholder="Select audience"
                          options={["Individuals", "Small Businesses", "Enterprises", "Agencies", "Students", "Healthcare Clients", "Retail Customers", "Other"]}
                        />
                        {formData.targetAudience.includes("Other") && (
                          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-3">
                            <Input
                              name='targetAudienceOther'
                              value={formData.targetAudienceOther}
                              onChange={handleInputChange}
                              placeholder='Other Audience'
                              className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                            />
                          </motion.div>
                        )}
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          Main Business Priority <span className='text-red-500'>*</span>
                        </Label>
                        <MultiSelect 
                          field="businessPriority"
                          placeholder="Select priorities"
                          options={["Increase Sales", "Improve Follow-ups", "Better Lead Tracking", "Automate Tasks", "Customer Retention", "Faster Team Collaboration", "AI Automation"]}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                          GSTR / Tax Registry <span className='text-red-500'>*</span>
                        </Label>
                        <div className="flex gap-4 mb-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center transition-all", formData.gstRegistered ? "border-indigo-500 bg-indigo-500" : "border-white/20 bg-white/[0.02]")}>
                              {formData.gstRegistered && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-sm text-white/80">Registered</span>
                            <input type="radio" className="hidden" checked={formData.gstRegistered} onChange={() => setBooleanChoice("gstRegistered", true)} />
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className={cn("h-5 w-5 rounded-full border flex items-center justify-center transition-all", !formData.gstRegistered ? "border-indigo-500 bg-indigo-500" : "border-white/20 bg-white/[0.02]")}>
                              {!formData.gstRegistered && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-sm text-white/80">Not Registered</span>
                            <input type="radio" className="hidden" checked={!formData.gstRegistered} onChange={() => setBooleanChoice("gstRegistered", false)} />
                          </label>
                        </div>
                        {formData.gstRegistered && (
                          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
                            <Input
                              name='gstNumber'
                              value={formData.gstNumber}
                              onChange={handleInputChange}
                              placeholder='GST Number'
                              className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className='grid grid-cols-1 xl:grid-cols-5 gap-12 items-start'>
                    <div className='xl:col-span-3 space-y-10'>
                      <div className='space-y-4'>
                        <h1 className='text-4xl font-black text-white tracking-tight italic'>
                          Branding & Workspace.
                        </h1>
                        <p className='text-base text-white/60 font-medium'>
                          Finalize your visual identity and AI assistant.
                        </p>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
                        <div className='space-y-4 md:col-span-2'>
                          <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                            Company Logo (Optional)
                          </Label>
                          {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
                            <CldUploadWidget
                              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default"}
                              options={{
                                cropping: true,
                                croppingAspectRatio: 1,
                                showSkipCropButton: false,
                                clientAllowedFormats: ["png", "jpeg", "jpg", "svg", "webp"],
                                maxFiles: 1,
                              }}
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              onSuccess={(result: any) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  logoUrl: result?.info?.secure_url || "",
                                }));
                              }}
                            >
                              {({ open }) => (
                                <div
                                  onClick={() => open()}
                                  className='group relative h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex overflow-hidden'
                                >
                                  {formData.logoUrl ? (
                                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-4" />
                                  ) : (
                                    <>
                                      <Upload className='h-8 w-8 text-white/20 group-hover:text-indigo-400 transition-all' />
                                      <span className='mt-3 text-[9px] font-black tracking-widest text-white/30'>
                                        SVG / PNG / WebP (SQUARE)
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </CldUploadWidget>
                          ) : (
                            <div className='group relative h-40 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] flex overflow-hidden'>
                              <div className="text-center p-4">
                                <Upload className='h-8 w-8 text-white/20 mx-auto mb-2' />
                                <span className='text-[9px] font-black tracking-widest text-white/30 block mb-2'>
                                  SVG / PNG / WebP (SQUARE)
                                </span>
                                <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                                  Cloudinary Env Missing
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className='space-y-4 md:col-span-2'>
                          <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                            Brand Primary Color <span className='text-red-500'>*</span>
                          </Label>
                          <div className='flex gap-3'>
                            <div className='flex-1 grid grid-cols-4 md:grid-cols-8 gap-3'>
                              {[
                                "#8b5cf6",
                                "#f97316",
                                "#2563eb",
                                "#059669",
                                "#e11d48",
                                "#f59e0b",
                                "#f8fafc",
                                "#0f172a",
                              ].map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      primaryColor: color,
                                    }))
                                  }
                                  className={cn(
                                    "h-10 w-full rounded-lg transition-all",
                                    formData.primaryColor === color
                                      ? "ring-2 ring-indigo-500 ring-offset-4 ring-offset-[#050510]"
                                      : "opacity-30 hover:opacity-100",
                                  )}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <input
                              type="color"
                              value={formData.primaryColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                              className="h-10 w-10 shrink-0 rounded-lg cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                            />
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                            Theme Preference
                          </Label>
                          <SingleSelect 
                            name="themePreference"
                            value={formData.themePreference}
                            placeholder="Select theme"
                            options={["Light", "Dark", "System Default"]}
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                            Default Currency <span className='text-red-500'>*</span>
                          </Label>
                          <SingleSelect 
                            name="defaultCurrency"
                            value={formData.defaultCurrency}
                            placeholder="Select currency"
                            options={["INR", "USD", "EUR", "GBP", "AED", "Other"]}
                          />
                          {formData.defaultCurrency === "Other" && (
                            <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-3">
                              <Input
                                name='defaultCurrencyOther'
                                value={formData.defaultCurrencyOther}
                                onChange={handleInputChange}
                                placeholder='Other Currency'
                                className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                              />
                            </motion.div>
                          )}
                        </div>

                        <div className='space-y-2 md:col-span-2'>
                          <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                            Notification Preferences
                          </Label>
                          <MultiSelect 
                            field="notificationPreferences"
                            placeholder="Select notifications"
                            options={["Email Notifications", "WhatsApp Notifications", "Push Notifications"]}
                          />
                        </div>

                        <div className='space-y-2 md:col-span-2 mt-4 pt-6 border-t border-white/10'>
                          <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                            AI Assistant Name <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            name='botName'
                            value={formData.botName}
                            onChange={handleInputChange}
                            placeholder='Pinglly AI'
                            className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                          />
                        </div>
                        <div className='space-y-2 md:col-span-2'>
                          <Label className='text-xs font-semibold tracking-wide text-white/60 ml-1'>
                            Bot Welcome Message <span className='text-red-500'>*</span>
                          </Label>
                          <textarea
                            name='welcomeMessage'
                            value={formData.welcomeMessage}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                welcomeMessage: e.target.value,
                              }))
                            }
                            className='w-full min-h-[100px] rounded-xl border border-white/10 bg-white/[0.05] p-5 text-white text-sm focus:border-indigo-500 transition-all resize-none'
                            placeholder='How can I help you today?'
                          />
                        </div>
                      </div>
                    </div>

                    <div className='xl:col-span-2 xl:sticky xl:top-12 mt-12 xl:mt-0'>
                      <Label className='text-[10px] font-black tracking-widest text-white/60 mb-6 block text-center'>
                        Live Preview: {formData.companyName || "Your Brand"}
                      </Label>

                      {/* Chatbot Preview Rendering */}
                      <div className='relative mx-auto w-full max-w-[340px] h-[550px] rounded-[2.5rem] bg-black border-[8px] border-white/5 shadow-2xl overflow-hidden'>
                        <div
                          className='h-24 w-full flex items-center px-6 gap-3 transition-colors duration-300'
                          style={{ backgroundColor: formData.primaryColor }}
                        >
                          <div className='h-12 w-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30 shrink-0'>
                            {formData.logoUrl ? (
                              <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              <img
                                src='/assets/logo.png'
                                className='h-6 w-6 object-contain grayscale brightness-200'
                                alt='Logo'
                              />
                            )}
                          </div>
                          <div className='flex flex-col truncate'>
                            <span className='font-bold text-white text-sm tracking-tight truncate'>
                              {formData.botName || "Bot Name"}
                            </span>
                            <span className='text-[10px] text-white/70'>
                              Online now
                            </span>
                          </div>
                        </div>
                        <div className='flex-1 p-6 space-y-4 h-[350px] bg-[#0a0a0a]'>
                          <div className='flex gap-2'>
                            <div className='h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40 shrink-0'>
                              AI
                            </div>
                            <div className='max-w-[80%] rounded-2xl bg-white/10 p-3 text-[11px] text-white break-words'>
                              {formData.welcomeMessage || "Welcome!"}
                            </div>
                          </div>
                          <div className='flex gap-2 justify-end'>
                            <div className='max-w-[80%] rounded-2xl bg-white/5 border border-white/10 p-3 text-[11px] text-white/60 italic'>
                              Hey, tell me about your growth plans!
                            </div>
                          </div>
                        </div>
                        <div className='absolute bottom-0 w-full p-4 bg-black border-t border-white/5 flex items-center gap-3'>
                          <div className='flex-1 h-12 rounded-full bg-white/5 border border-white/10 px-4 flex items-center text-white/20 text-xs'>
                            Type a message...
                          </div>
                          <div
                            className='h-12 w-12 rounded-full flex items-center justify-center text-white shrink-0 transition-colors duration-300'
                            style={{ backgroundColor: formData.primaryColor }}
                          >
                            <Send className='h-5 w-5' />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation - Always visible at the bottom of the scrollable area */}
                <div className='flex items-center justify-between pt-10 mt-12 border-t border-white/10 gap-2'>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button
                      variant='ghost'
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className='h-12 sm:h-14 px-3 sm:px-4 md:px-10 text-[9px] sm:text-[10px] font-black tracking-wider sm:tracking-widest text-white/40 hover:text-white disabled:opacity-0'
                    >
                      Back
                    </Button>

                    <Button
                      variant='outline'
                      onClick={() => setIsFillLaterOpen(true)}
                      className='h-12 sm:h-14 rounded-xl sm:rounded-2xl border-white/20 bg-white/[0.06] px-3 sm:px-4 md:px-6 text-[9px] sm:text-[10px] font-black tracking-wider sm:tracking-widest text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:border-white/40 hover:bg-white/[0.1] hover:text-white'
                    >
                      <LogOut className="h-3.5 w-3.5 sm:h-3 sm:w-3 md:mr-2" />
                      <span className="hidden md:inline">Fill Later</span>
                    </Button>
                  </div>

                  <Button
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className={cn(
                      "h-12 sm:h-14 md:h-16 px-4 sm:px-6 md:px-12 rounded-xl sm:rounded-2xl bg-white text-black font-black transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]",
                      !isStepValid()
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105",
                    )}
                  >
                    <div className='flex items-center gap-1.5 sm:gap-2 md:gap-3'>
                      <span className='tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.2em] text-[10px] sm:text-xs md:text-sm'>
                        {currentStep === STEPS.length ? (
                          <>
                            <span className="inline sm:hidden">Finish</span>
                            <span className="hidden sm:inline">Initialize Setup</span>
                          </>
                        ) : (
                          "Next Phase"
                        )}
                      </span>
                      <ChevronRight className='h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5' />
                    </div>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='flex flex-col items-center justify-center text-center space-y-12 h-full py-20'
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className='h-40 w-40 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.5)]'
                >
                  <CheckCircle2 className='h-20 w-20 text-white' />
                </motion.div>

                <div className='space-y-4'>
                  <h1 className='text-5xl md:text-7xl font-black text-white tracking-tighter italic '>
                    Initialized.
                  </h1>
                  <p className='text-xl md:text-2xl text-white/70 max-w-lg font-medium'>
                    Setup complete. Your CRM workspace is ready for deployment.
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/dashboard")}
                  className='h-16 md:h-20 px-10 md:px-16 rounded-[2rem] bg-white text-black text-lg md:text-xl font-black hover:scale-105 transition-all flex items-center gap-4'
                >
                  <span>Enter Workspace</span>
                  <Rocket className='h-5 w-5 md:h-6 md:w-6' />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Dialog
        open={isFillLaterOpen}
        onOpenChange={setIsFillLaterOpen}
      >
        <DialogHeader className='space-y-4 text-left'>
          <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-200'>
            <Calendar className='h-5 w-5' />
          </div>
          <DialogTitle className='text-3xl font-black italic tracking-tight text-white'>
            Need help completing your setup?
          </DialogTitle>
          <DialogDescription className='text-base leading-7 text-white/60'>
            You can continue onboarding later anytime. If you are facing any
            confusion, our team can help you set everything up in a quick call.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className='mt-8 gap-3 sm:justify-start sm:space-x-0'>
          <Button
            onClick={scheduleCall}
            className='h-12 rounded-xl bg-white px-6 font-black tracking-widest text-black hover:scale-[1.02]'
          >
            <Calendar className='h-4 w-4 mr-2' />
            <span>Schedule a Call</span>
          </Button>
          <Button
            variant='ghost'
            onClick={continueLater}
            className='h-12 rounded-xl border border-white/10 px-6 font-black tracking-widest text-white/60 hover:bg-white/[0.06] hover:text-white'
          >
            Continue Later
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
