import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from "@/models/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  session: {
    strategy: "jwt", // 🔥 important for middleware
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toString().trim().toLowerCase();
        const password = credentials.password.toString().trim();

        // 🔥 AUTHENTICATION FLOW
        try {
          await connectDB();
          const user = await User.findOne({ email });

          // 1. Super Admin Bypass
          if (email === "techecho.kanpur@gmail.com" && password === "admin@123") {
            return {
              id: user?._id?.toString() || "super-admin",
              name: user?.name || "Super Admin",
              email: "techecho.kanpur@gmail.com",
              role: "admin",
              organizationId: user?.organizationId,
              onboardingCompleted: user?.onboardingCompleted ?? true,
            };
          }

          // 3. AUTO-ORG CREATION (Ensure every user has an org)
          if (user && !user.organizationId) {
            try {
              const { Organization } = await import("@/models/organization");
              const newOrg = await Organization.create({
                name: `${user.name || user.email.split('@')[0]}'s Workspace`,
                email: user.email,
                phone: user.phone || "0000000000",
                ownerId: user.email,
                plan: "starter",
                subscription: { status: "trial" }
              });
              
              user.organizationId = newOrg._id.toString();
              await user.save();
            } catch (orgError) {
              console.error("Auto-Org Creation Failed:", orgError);
            }
          }

          // 4. Return Session Object
          if (user && user.password) {
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
              return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role || "client",
                organizationId: user.organizationId,
                onboardingCompleted: user.onboardingCompleted || false,
              };
            }
          }
        } catch (error) {
          console.error("Auth DB Error:", error);
        }

        // 🔥 fallback test user (synchronized with DB)
        if (password === "Anuj@123") {
          try {
            await connectDB();
            let user = await User.findOne({ email });
            if (!user) {
              user = await User.create({
                name: email.split("@")[0],
                email: email,
                phone: "0000000000",
                role: "client",
                onboardingCompleted: false,
              });
            }
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role || "client",
              organizationId: user.organizationId,
              onboardingCompleted: user.onboardingCompleted || false,
            };
          } catch (e) {
            console.error("Fallback Sync Error:", e);
          }
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // ✅ First login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.onboardingCompleted = user.onboardingCompleted || false;
      }

      // 🔥 IMPORTANT: update token after onboarding
      if (trigger === "update") {
        if (session?.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
        if (session?.organizationId !== undefined) {
          token.organizationId = session.organizationId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.onboardingCompleted = Boolean(
          token.onboardingCompleted
        );
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});