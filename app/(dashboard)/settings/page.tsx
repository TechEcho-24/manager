import { Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — LeadPro",
  description: "Configure your LeadPro settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Manage your account and application preferences
        </p>
      </div>

      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05]">
            <SettingsIcon className="h-7 w-7 text-white/30" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white/70">
            Settings coming soon
          </h3>
          <p className="mt-1 text-center text-sm text-white/40">
            Account preferences and configuration options
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
