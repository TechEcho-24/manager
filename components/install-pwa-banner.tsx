"use client";

import { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
      return;
    }

    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      const hasDismissed = localStorage.getItem("dismissed_pwa_banner");
      if (!hasDismissed) setShowBanner(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const hasDismissed = localStorage.getItem("dismissed_pwa_banner");
      if (!hasDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSInstructions(false);
    localStorage.setItem("dismissed_pwa_banner", "true");
  };

  if (!showBanner || isStandalone) return null;

  if (showIOSInstructions) {
    return (
      <div className="fixed bottom-[100px] left-4 right-4 z-[200] rounded-2xl border border-border/40 bg-card/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-2xl sm:border animate-in slide-in-from-bottom-2">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-black text-foreground">Install on iOS</h4>
            <p className="text-[11px] text-muted-foreground">Follow these 2 quick steps</p>
          </div>
          <button 
            onClick={() => setShowIOSInstructions(false)} 
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 border border-border/40">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm border border-border">
              <Share className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">1. Tap the <strong className="text-foreground">Share</strong> icon at the bottom of Safari.</p>
          </div>
          
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 border border-border/40">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm border border-border">
              <PlusSquare className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">2. Scroll down and tap <strong className="text-foreground">Add to Home Screen</strong>.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-[100px] left-4 right-4 z-[200] rounded-2xl border border-border/40 bg-card/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-2xl sm:border animate-in slide-in-from-bottom-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
            <img src="/assets/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
          </div>
          <div>
            <h4 className="text-sm font-black text-foreground">Pinglly App</h4>
            <p className="text-[11px] text-muted-foreground">
              {isIOS ? "Add to your home screen for quick access" : "Install for a faster, app-like experience"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleInstallClick} 
            size="sm" 
            className="h-8 gap-1.5 rounded-lg bg-orange-500 text-[11px] font-bold text-white hover:bg-orange-600"
          >
            <Download className="h-3.5 w-3.5" />
            {isIOS ? "How to Install" : "Install"}
          </Button>
          <button 
            onClick={handleDismiss} 
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
