import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar — LeadPro",
  description: "View your sales calendar and scheduled events",
};

export default function CalendarPage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Calendar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View your appointments and scheduled events for <span className="font-semibold text-primary">anujsachan98@gmail.com</span>
          </p>
        </div>
      </div>

      <Card className="flex-1 min-h-[650px] border-border bg-card shadow-xl overflow-hidden rounded-2xl">
        <CardContent className="p-0 h-full w-full">
          <iframe
            src="https://calendar.google.com/calendar/embed?src=anujsachan98%40gmail.com&ctz=Asia%2FKolkata"
            style={{ border: 0 }}
            className="w-full h-full min-h-[650px] grayscale-[0.1] contrast-[1.05] invert-0 dark:invert-[0.9] dark:hue-rotate-180"
            frameBorder="0"
            scrolling="no"
          ></iframe>
        </CardContent>
      </Card>
    </div>
  );
}
