"use client";

import { AlertCircle, Zap, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UpgradePromptProps {
  title?: string;
  description: string;
  type?: "warning" | "block" | "feature";
  onClose?: () => void;
}

export function UpgradePrompt({ 
  title, 
  description, 
  type = "block",
  onClose 
}: UpgradePromptProps) {
  const isWarning = type === "warning";
  const isFeature = type === "feature";

  return (
    <Card className={cn(
      "border-none shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300",
      isWarning ? "bg-amber-500/10" : "bg-red-500/10",
      isFeature && "bg-indigo-500/10"
    )}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center shadow-lg",
            isWarning ? "bg-amber-500 text-white" : "bg-red-500 text-white",
            isFeature && "bg-indigo-600 text-white"
          )}>
            {isFeature ? <Zap className="h-6 w-6" /> : isWarning ? <AlertCircle className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-black tracking-tight text-foreground uppercase">
              {title || (isWarning ? "Capacity Warning" : isFeature ? "Feature Locked" : "Limit Reached")}
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            {onClose && (
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 rounded-xl h-12 font-bold text-xs tracking-widest border-border"
              >
                CLOSE
              </Button>
            )}
            <Link 
              href="/settings?tab=subscription"
              className={cn(
                "flex-1 rounded-xl h-12 flex items-center justify-center font-black text-xs tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 text-white",
                isWarning ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20" : "bg-primary shadow-primary/20",
                isFeature && "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20"
              )}
            >
              UPGRADE PLAN
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
