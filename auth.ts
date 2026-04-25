import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
          };
        }

        // 2. CLIENTS (Testing / Dynamic User Logic)
        if (email === "anujsachan98@gmail.com" && password === "Anuj@123") {
          return {
            id: "client-sagar",
            name: "Sagar Client",
            email: "anujsachan98@gmail.com",
            role: "client",
          };
        }

        // Fallback for generic testing
        if (password === "Anuj@123") {
          return {
            id: `client-${email.split('@')[0]}`,
            name: email.split('@')[0],
            email: email,
            role: "client",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || "any-random-secret-for-now",
});
