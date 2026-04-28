import SignupForm from "@/components/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Pinglly — Create Account",
  description: "Start your journey with Pinglly today.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a1a] p-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>
      
      <SignupForm />
    </div>
  );
}
