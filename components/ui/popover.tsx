"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

export function Popover({ children, open: controlledOpen, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen: React.Dispatch<React.SetStateAction<boolean>> = React.useCallback(
    (value) => {
      if (onOpenChange) onOpenChange(value);
      if (!isControlled) setInternalOpen(value);
    },
    [onOpenChange, isControlled]
  );
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block text-left">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children, className, asChild = false }: { children: React.ReactNode; className?: string; asChild?: boolean }) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverTrigger must be used within Popover");

  const { open, setOpen } = context;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        setOpen(!open);
        if ((children.props as any).onClick) (children.props as any).onClick(e);
      },
      className: cn((children.props as any).className, className),
    });
  }

  return (
    <button type="button" onClick={() => setOpen(!open)} className={className}>
      {children}
    </button>
  );
}

export function PopoverContent({ children, className, align = "center", sideOffset }: { children: React.ReactNode; className?: string; align?: "start" | "center" | "end"; sideOffset?: number }) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverContent must be used within Popover");

  if (!context.open) return null;

  const alignments = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-2 w-72 rounded-md border border-white/10 bg-[oklch(0.15_0.02_260)] p-4 text-foreground shadow-md outline-none animate-in fade-in zoom-in-95",
        alignments[align],
        className
      )}
      style={sideOffset !== undefined ? { marginTop: `${sideOffset}px` } : undefined}
    >
      {children}
    </div>
  );
}
