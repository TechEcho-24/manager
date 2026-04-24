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
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        console.log("--- Auth Debug ---");
        console.log("Incoming Email:", email);
        console.log("Admin Email:", adminEmail);
        console.log("Hash present:", !!adminPasswordHash);

        if (!adminEmail || !adminPasswordHash) {
          console.error("Admin credentials not configured in environment");
          return null;
        }

        if (email !== adminEmail) {
          console.log("Email mismatch!");
          return null;
        }

        const isValid = await compare(password, adminPasswordHash);
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
