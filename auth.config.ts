import type { NextAuthConfig } from "next-auth";

// This config is Edge-runtime safe — no mongoose, bcryptjs, or other Node-only imports here.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.onboardingCompleted = user.onboardingCompleted;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
  },
  providers: [], // Providers with Node.js deps are added only in auth.ts
  secret: process.env.AUTH_SECRET || "any-random-secret-for-now",
} satisfies NextAuthConfig;
