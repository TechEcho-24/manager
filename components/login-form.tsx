"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-primary/20 blur-md" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/25">
            <Zap className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          LeadPro
        </h1>
        <div className="h-1 w-12 rounded-full bg-primary/20" />
      </div>

      <Card className="overflow-hidden border-border/40 bg-card/80 shadow-2xl backdrop-blur-xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
        <CardHeader className="space-y-1.5 pb-6 pt-8 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </CardTitle>
          <CardDescription className="text-muted-foreground/80">
            Enter your credentials to manage your leads
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in zoom-in-95 duration-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@leadpro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 rounded-xl border-border/40 bg-muted/30 px-4 transition-all focus:border-primary/40 focus:bg-background focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 rounded-xl border-border/40 bg-muted/30 pl-4 pr-12 transition-all focus:border-primary/40 focus:bg-background focus:ring-4 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30 transition-colors hover:text-primary"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="group h-12 w-full rounded-xl bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign in to Dashboard</span>
                  <Zap className="h-4 w-4 transition-transform group-hover:scale-125" />
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground/30">
        LeadPro CRM &copy; {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
}
