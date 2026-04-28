import LoginForm from "@/components/login-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login — Pinglly",
  description: "Sign in to your Pinglly CRM dashboard",
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a1a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
