import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar — LeadPro",
  description: "View your sales calendar and scheduled events",
};

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Calendar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your appointments and scheduled events
        </p>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card">
            <CalendarIcon className="h-7 w-7 text-foreground/30" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground/70">
            Calendar view coming soon
          </h3>
          <p className="mt-1 text-center text-sm text-muted-foreground/80">
            Schedule and manage your meetings in one place
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
