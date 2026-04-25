import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string || "").trim().toLowerCase();
        const password = (credentials?.password as string || "").trim();

        if (!email || !password) {
          return null;
        }

        const adminEmail = "anujsachan98@gmail.com";
        
        if (email !== adminEmail) {
          console.log("Email mismatch! Entered:", email, "Expected:", adminEmail);
          return null;
        }

        const isValid = password === "admin123" || password === "Anuj@123";
        console.log("Auth Attempt:", { email, isValid });
        console.log("Password Valid:", isValid);

        if (!isValid) {
          return null;
        }

        return {
          id: "1",
          email: adminEmail,
          name: "Admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
