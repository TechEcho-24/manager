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
      <div className="mb-8 flex items-center justify-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.65_0.25_260)] to-[oklch(0.55_0.28_290)] shadow-lg shadow-[oklch(0.50_0.20_270)]/25">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          LeadPro
        </h1>
      </div>

      <Card className="border-white/[0.08] bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-4 text-center">
          <CardTitle className="text-xl font-semibold text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-white/50">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400 animate-in fade-in slide-in-from-top-1 duration-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-white/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@leadpro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/30 focus:border-[oklch(0.65_0.25_260)] focus:ring-[oklch(0.65_0.25_260)]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-white/70">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 border-white/[0.08] bg-white/[0.04] pr-10 text-white placeholder:text-white/30 focus:border-[oklch(0.65_0.25_260)] focus:ring-[oklch(0.65_0.25_260)]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full bg-gradient-to-r from-[oklch(0.60_0.22_260)] to-[oklch(0.55_0.25_285)] font-medium text-white shadow-lg shadow-[oklch(0.45_0.20_270)]/30 transition-all hover:shadow-xl hover:shadow-[oklch(0.45_0.20_270)]/40 hover:brightness-110 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-white/30">
        LeadPro CRM &copy; {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
}
