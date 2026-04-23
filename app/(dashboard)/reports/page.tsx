import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports — LeadPro",
  description: "View your sales reports and analytics",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Analytics and insights for your sales performance
        </p>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card">
            <BarChart3 className="h-7 w-7 text-foreground/30" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground/70">
            Reports coming soon
          </h3>
          <p className="mt-1 text-center text-sm text-muted-foreground/80">
            Detailed analytics and performance dashboards
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
