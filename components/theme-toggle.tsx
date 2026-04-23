"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./providers";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-foreground/70"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4 text-black" />
      )}
    </button>
  );
}
