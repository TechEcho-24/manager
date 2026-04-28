import { OnboardingForm } from "@/components/onboarding-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding — Pinglly",
  description: "Configure your Pinglly CRM environment",
};

export default function OnboardingPage() {
  return (
    <div className="h-screen w-full bg-[#050510] fixed inset-0 z-[9999] overflow-hidden">
      <OnboardingForm />
    </div>
  );
}
