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

        // 🔥 SUPER ADMIN
        if (email === "techecho.kanpur@gmail.com" && password === "admin@123") {
          return {
            id: "super-admin",
            name: "Super Admin",
            email: "techecho.kanpur@gmail.com",
            role: "admin",
            onboardingCompleted: true,
          };
        }

        try {
          await connectDB();
          const user = await User.findOne({ email });

          if (user && user.password) {
            const isValid = await bcrypt.compare(password, user.password);

            if (isValid) {
              return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role || "client",
                onboardingCompleted: user.onboardingCompleted || false,
              };
            }
          }
        } catch (error) {
          console.error("Auth DB Error:", error);
        }

        // 🔥 fallback test user
        if (password === "Anuj@123") {
          return {
            id: `client-${email.split("@")[0]}`,
            name: email.split("@")[0],
            email: email,
            role: "client",
            onboardingCompleted: true,
          };
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
        token.onboardingCompleted = user.onboardingCompleted || false;
      }

      // 🔥 IMPORTANT: update token after onboarding
      if (trigger === "update") {
        if (session?.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.onboardingCompleted = Boolean(
          token.onboardingCompleted
        );
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});