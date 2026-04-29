"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
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
  Globe,
  Network,
  Sparkles,
  Zap,
  Activity,
  Shield,
  Mail,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Bot,
  Type,
  Layout,
  Globe2,
  Clock,
  Link,
  MapPin,
  TrendingUp,
  Settings,
  Smile,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, title: "Command", icon: User, description: "Personal" },
  { id: 2, title: "Logic", icon: Network, description: "Structure" },
  { id: 3, title: "DNA", icon: Briefcase, description: "Business" },
  { id: 4, title: "Visual", icon: Palette, description: "Branding" },
  { id: 5, title: "Neural", icon: Target, description: "Objectives" },
  { id: 6, title: "Interface", icon: Bot, description: "Bot Preview" },
];

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { update } = useSession();

  const [formData, setFormData] = useState({
    // Command
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    designation: "",
    secondaryEmail: "",
    // Logic
    entityType: "company",
    department: "Sales",
    teamSize: "11-50",
    location: "Global",
    language: "English",
    timezone: "UTC+5:30",
    // DNA
    companyName: "",
    gstr: "",
    industry: "",
    website: "",
    foundingYear: "",
    revenue: "1M-5M",
    // Visual
    brandColor: "#7c3aed",
    tagline: "Intelligence for Sales",
    brandVoice: "Professional",
    fontStyle: "Modern",
    // Neural
    goal: "automation",
    primaryChannel: "whatsapp",
    targetAudience: "B2B Enterprise",
    integration: "HubSpot",
    leadGoal: "50+",
    supportLevel: "Gold",
    // Bot
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
          secondaryEmail: prefill.email || prev.secondaryEmail,
        }));
      }
    } catch (e) {
      console.error("Failed to load prefill data", e);
    }
  }, []);

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.fullName &&
          formData.email &&
          formData.phone &&
          formData.linkedin &&
          formData.designation &&
          formData.secondaryEmail
        );
      case 2:
        return !!(
          formData.entityType &&
          formData.department &&
          formData.teamSize &&
          formData.location &&
          formData.language
        );
      case 3:
        return !!(
          formData.companyName &&
          formData.industry &&
          formData.website &&
          formData.foundingYear &&
          formData.gstr &&
          formData.revenue
        );
      case 4:
        return !!(
          formData.brandColor &&
          formData.tagline &&
          formData.brandVoice &&
          formData.fontStyle
        );
      case 5:
        return !!(
          formData.goal &&
          formData.primaryChannel &&
          formData.targetAudience &&
          formData.integration &&
          formData.leadGoal &&
          formData.supportLevel
        );
      case 6:
        return !!(formData.botName && formData.welcomeMessage);
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (currentStep === STEPS.length) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Failed to initialize protocol");
        localStorage.removeItem("onboardingPrefill");
        await update({
          onboardingCompleted: true,
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
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className='flex flex-col lg:flex-row min-h-screen w-full bg-[#050510] overflow-x-hidden'>
      {/* Sidebar — scrollable pills on mobile, full vertical sidebar on desktop */}
      <div className='lg:w-[260px] xl:w-[280px] border-b lg:border-b-0 lg:border-r border-white/10 bg-white/[0.01] flex flex-row lg:flex-col p-4 lg:p-8 gap-2 lg:gap-0 overflow-x-auto lg:overflow-visible shrink-0'>
        <div className='hidden lg:flex flex-col items-start mb-10'>
          <img
            src='/assets/logo.png'
            alt='Pinglly Logo'
            className='h-7 object-contain'
          />
          <span
            className='text-[7px] font-bold tracking-[0.4em] uppercase text-indigo-400 ml-1 mt-1'
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Terminal Node
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
                      "text-[10px] font-bold uppercase tracking-widest transition-all duration-500",
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
                className='text-[8px] font-bold uppercase text-white/30 tracking-widest'
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
      <div className='flex-1 relative flex items-center justify-center p-12 overflow-y-auto custom-scrollbar'>
        <AnimatePresence mode='wait'>
          {!isFinished ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className='w-full max-w-4xl space-y-12'
            >
              {currentStep === 1 && (
                <div className='space-y-10'>
                  <div className='space-y-4'>
                    <h1 className='text-4xl font-black text-white tracking-tight leading-none italic uppercase'>
                      Command Center.
                    </h1>
                    <p className='text-base text-white/60 font-medium'>
                      Define your personal operator identity.
                    </p>
                  </div>

                  <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
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
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Work Email <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='email'
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder='john@company.com'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Personal Link (Phone){" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='phone'
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder='+91 00000 00000'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        LinkedIn Profile <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='linkedin'
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        placeholder='linkedin.com/in/user'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Designation / Role{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='designation'
                        value={formData.designation}
                        onChange={handleInputChange}
                        placeholder='VP of Sales'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Recovery Email <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='secondaryEmail'
                        value={formData.secondaryEmail}
                        onChange={handleInputChange}
                        placeholder='alt@email.com'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className='space-y-10'>
                  <div className='space-y-4'>
                    <h1 className='text-4xl font-black text-white tracking-tight leading-none italic uppercase'>
                      Logic Node.
                    </h1>
                    <p className='text-base text-white/60 font-medium'>
                      Configure your operational structure.
                    </p>
                  </div>

                  <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
                    <div className='col-span-2 space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Entity Logic <span className='text-red-500'>*</span>
                      </Label>
                      <RadioGroup
                        defaultValue={formData.entityType}
                        onValueChange={(v) =>
                          setFormData((p) => ({ ...p, entityType: v }))
                        }
                        className='grid grid-cols-2 gap-4'
                      >
                        <Label
                          className={cn(
                            "flex h-12 items-center justify-center rounded-xl border cursor-pointer transition-all uppercase tracking-widest text-[10px] font-black",
                            formData.entityType === "individual"
                              ? "border-indigo-500 bg-indigo-500/10 text-white"
                              : "border-white/10 text-white/20",
                          )}
                        >
                          <RadioGroupItem
                            value='individual'
                            className='sr-only'
                          />{" "}
                          Solo Pro
                        </Label>
                        <Label
                          className={cn(
                            "flex h-12 items-center justify-center rounded-xl border cursor-pointer transition-all uppercase tracking-widest text-[10px] font-black",
                            formData.entityType === "company"
                              ? "border-indigo-500 bg-indigo-500/10 text-white"
                              : "border-white/10 text-white/20",
                          )}
                        >
                          <RadioGroupItem value='company' className='sr-only' />{" "}
                          Enterprise
                        </Label>
                      </RadioGroup>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Main Department <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='department'
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder='Marketing'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Team Dimension <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='teamSize'
                        value={formData.teamSize}
                        onChange={handleInputChange}
                        placeholder='11-50 Members'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Operating Region <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='location'
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder='North America / APAC'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        System Language <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='language'
                        value={formData.language}
                        onChange={handleInputChange}
                        placeholder='English / Hindi'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className='space-y-10'>
                  <div className='space-y-4'>
                    <h1 className='text-4xl font-black text-white tracking-tight leading-none italic uppercase'>
                      Organization DNA.
                    </h1>
                    <p className='text-base text-white/60 font-medium'>
                      Define your organization's core parameters.
                    </p>
                  </div>

                  <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Company Master Name{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='companyName'
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder='Pinglly Tech'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Industry Sector <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='industry'
                        value={formData.industry}
                        onChange={handleInputChange}
                        placeholder='Fintech / SaaS'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Digital Endpoint (Web){" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='website'
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder='pinglly.com'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Founding Year <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='foundingYear'
                        value={formData.foundingYear}
                        onChange={handleInputChange}
                        placeholder='2024'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        GSTR / Tax Registry{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='gstr'
                        value={formData.gstr}
                        onChange={handleInputChange}
                        placeholder='GST Number'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Revenue Stream Range{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='revenue'
                        value={formData.revenue}
                        onChange={handleInputChange}
                        placeholder='$1M - $10M'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className='space-y-10'>
                  <div className='space-y-4'>
                    <h1 className='text-4xl font-black text-white tracking-tight leading-none italic uppercase'>
                      Visual Core.
                    </h1>
                    <p className='text-base text-white/60 font-medium'>
                      Personalize your brand's digital identity.
                    </p>
                  </div>

                  <div className='grid grid-cols-2 gap-x-12 gap-y-6'>
                    <div className='space-y-4 row-span-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Master Logo <span className='text-red-500'>*</span>
                      </Label>
                      <div className='group relative h-64 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex'>
                        <Upload className='h-10 w-10 text-white/20 group-hover:text-indigo-400 transition-all' />
                        <span className='mt-4 text-[9px] font-black uppercase tracking-widest text-white/30'>
                          SVG / PNG / WebP
                        </span>
                      </div>
                    </div>
                    <div className='space-y-4'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Neural Primary Color{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <div className='grid grid-cols-4 gap-3'>
                        {[
                          "#7c3aed",
                          "#ff6b35",
                          "#3b82f6",
                          "#10b981",
                          "#f43f5e",
                          "#fbbf24",
                          "#ffffff",
                          "#000000",
                        ].map((color) => (
                          <button
                            key={color}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                brandColor: color,
                              }))
                            }
                            className={cn(
                              "h-10 w-full rounded-lg transition-all",
                              formData.brandColor === color
                                ? "ring-2 ring-indigo-500 ring-offset-4 ring-offset-[#050510]"
                                : "opacity-30 hover:opacity-100",
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Brand Tagline <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='tagline'
                        value={formData.tagline}
                        onChange={handleInputChange}
                        placeholder='Sales Reimagined'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Brand Voice <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='brandVoice'
                        value={formData.brandVoice}
                        onChange={handleInputChange}
                        placeholder='Empathetic / Aggressive'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Digital Font Style{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='fontStyle'
                        value={formData.fontStyle}
                        onChange={handleInputChange}
                        placeholder='Modern / Classic'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className='space-y-10'>
                  <div className='space-y-4'>
                    <h1 className='text-4xl font-black text-white tracking-tight leading-none italic uppercase'>
                      Neural Targets.
                    </h1>
                    <p className='text-base text-white/60 font-medium'>
                      Select your primary operational goal and channel.
                    </p>
                  </div>

                  <div className='grid grid-cols-2 gap-x-8 gap-y-6'>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Primary Growth Goal{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='goal'
                        value={formData.goal}
                        onChange={handleInputChange}
                        placeholder='Automate Leads'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Main Sales Channel{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='primaryChannel'
                        value={formData.primaryChannel}
                        onChange={handleInputChange}
                        placeholder='WhatsApp'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Target Audience Segment{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='targetAudience'
                        value={formData.targetAudience}
                        onChange={handleInputChange}
                        placeholder='SaaS Startups'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        CRM Logic Integration{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='integration'
                        value={formData.integration}
                        onChange={handleInputChange}
                        placeholder='HubSpot / Salesforce'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Weekly Lead Target{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='leadGoal'
                        value={formData.leadGoal}
                        onChange={handleInputChange}
                        placeholder='100 Leads'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                        Support Tier Priority{" "}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        name='supportLevel'
                        value={formData.supportLevel}
                        onChange={handleInputChange}
                        placeholder='24/7 Premium'
                        className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className='grid grid-cols-5 gap-12 items-start'>
                  <div className='col-span-2 space-y-8'>
                    <div className='space-y-4'>
                      <h1 className='text-4xl font-black text-white tracking-tight leading-none italic uppercase'>
                        Bot Interface.
                      </h1>
                      <p className='text-base text-white/60 font-medium'>
                        Finalize your AI agent's presence.
                      </p>
                    </div>

                    <div className='space-y-6'>
                      <div className='space-y-2'>
                        <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                          AI Assistant Name{" "}
                          <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          name='botName'
                          value={formData.botName}
                          onChange={handleInputChange}
                          placeholder='Pinglly AI'
                          className='h-13 rounded-xl border-white/10 bg-white/[0.05] px-5 text-white'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-[9px] font-black uppercase tracking-widest text-white/40 ml-1'>
                          Bot Welcome Logic{" "}
                          <span className='text-red-500'>*</span>
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
                          className='w-full min-h-[120px] rounded-xl border border-white/10 bg-white/[0.05] p-5 text-white text-sm focus:border-indigo-500 transition-all resize-none'
                          placeholder='How can I help you today?'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='col-span-3'>
                    <Label className='text-[10px] font-black uppercase tracking-widest text-white/60 mb-6 block text-center'>
                      Live Preview: {formData.companyName || "Your Brand"}
                    </Label>

                    {/* Chatbot Preview Rendering */}
                    <div className='relative mx-auto w-[340px] h-[550px] rounded-[2.5rem] bg-black border-[8px] border-white/5 shadow-2xl overflow-hidden'>
                      <div
                        className='h-24 w-full flex items-center px-6 gap-3'
                        style={{ backgroundColor: formData.brandColor }}
                      >
                        <div className='h-12 w-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30'>
                          <img
                            src='/assets/logo.png'
                            className='h-6 w-6 object-contain grayscale brightness-200'
                            alt='Logo'
                          />
                        </div>
                        <div className='flex flex-col'>
                          <span className='font-bold text-white text-sm tracking-tight'>
                            {formData.botName}
                          </span>
                          <span className='text-[10px] text-white/70'>
                            Online now
                          </span>
                        </div>
                      </div>
                      <div className='flex-1 p-6 space-y-4 h-[350px] bg-[#0a0a0a]'>
                        <div className='flex gap-2'>
                          <div className='h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40'>
                            AI
                          </div>
                          <div className='max-w-[80%] rounded-2xl bg-white/10 p-3 text-[11px] text-white leading-relaxed'>
                            {formData.welcomeMessage}
                          </div>
                        </div>
                        <div className='flex gap-2 justify-end'>
                          <div className='max-w-[80%] rounded-2xl bg-white/5 border border-white/10 p-3 text-[11px] text-white/60 leading-relaxed italic'>
                            Hey, tell me about your growth plans!
                          </div>
                        </div>
                      </div>
                      <div className='absolute bottom-0 w-full p-4 bg-black border-t border-white/5 flex items-center gap-3'>
                        <div className='flex-1 h-12 rounded-full bg-white/5 border border-white/10 px-4 flex items-center text-white/20 text-xs'>
                          Type a message...
                        </div>
                        <div
                          className='h-12 w-12 rounded-full flex items-center justify-center text-white'
                          style={{ backgroundColor: formData.brandColor }}
                        >
                          <Send className='h-5 w-5' />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className='flex items-center justify-between pt-10 border-t border-white/10'>
                <Button
                  variant='ghost'
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className='h-14 px-10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-0'
                >
                  Back
                </Button>

                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={cn(
                    "h-16 px-12 rounded-2xl bg-white text-black font-black transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]",
                    !isStepValid()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105",
                  )}
                >
                  <div className='flex items-center gap-3'>
                    <span className='uppercase tracking-[0.2em] text-sm'>
                      {currentStep === STEPS.length
                        ? "Initialize Protocol"
                        : "Next Phase"}
                    </span>
                    <ChevronRight className='h-5 w-5' />
                  </div>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='flex flex-col items-center justify-center text-center space-y-12'
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
                <h1 className='text-7xl font-black text-white tracking-tighter italic leading-none uppercase'>
                  Initialized.
                </h1>
                <p className='text-2xl text-white/70 max-w-lg font-medium'>
                  Protocol complete. Your secure environment is ready for
                  deployment.
                </p>
              </div>

              <Button
                onClick={() => router.push("/dashboard")}
                className='h-20 px-16 rounded-[2rem] bg-white text-black text-xl font-black hover:scale-105 transition-all flex items-center gap-4'
              >
                <span>Enter Terminal</span>
                <Rocket className='h-6 w-6' />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
