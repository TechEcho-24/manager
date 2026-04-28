import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import { User } from "@/models/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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

        // 1. SUPER ADMIN (The Platform Owner)
        if (email === "techecho.kanpur@gmail.com" && password === "admin@123") {
          return {
            id: "super-admin",
            name: "Super Admin",
            email: "techecho.kanpur@gmail.com",
            role: "admin",
            onboardingCompleted: true,
          };
        }

        // 2. Check Database for registered users
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
                role: user.role,
                onboardingCompleted: user.onboardingCompleted,
              };
            }
          }
        } catch (error) {
          console.error("Auth DB Error:", error);
        }

        // Fallback for generic testing
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
});
