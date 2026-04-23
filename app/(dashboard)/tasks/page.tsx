import { CheckSquare, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks — LeadPro",
  description: "Manage your sales tasks and to-dos",
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your to-do list and stay productive
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-[oklch(0.60_0.22_260)] to-[oklch(0.55_0.25_285)] text-white shadow-lg">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card">
            <CheckSquare className="h-7 w-7 text-foreground/30" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground/70">
            All caught up!
          </h3>
          <p className="mt-1 text-center text-sm text-muted-foreground/80">
            Create tasks to organize your work
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
