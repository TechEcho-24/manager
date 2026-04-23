import { Handshake, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deals — LeadPro",
  description: "Track and manage your sales deals",
};

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Deals
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Track your sales pipeline and close deals
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-[oklch(0.60_0.22_260)] to-[oklch(0.55_0.25_285)] text-white shadow-lg">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Deal</span>
        </Button>
      </div>

      <Card className="border-white/[0.06] bg-white/[0.03]">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05]">
            <Handshake className="h-7 w-7 text-white/30" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-white/70">
            No deals yet
          </h3>
          <p className="mt-1 text-center text-sm text-white/40">
            Create deals to track your sales pipeline
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
