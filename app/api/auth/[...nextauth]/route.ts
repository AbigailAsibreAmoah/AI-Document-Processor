// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { AuthService } from "@/services/auth";

const prisma = new PrismaClient();
const authService = new AuthService();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // Credentials login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const loginResult = await authService.login(
            credentials.email,
            credentials.password
          );
          return {
            id: loginResult.user.id,
            email: loginResult.user.email,
            name: loginResult.user.name,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  // Use JWT strategy (recommended for APIs)
  session: { strategy: "jwt" },

  // Custom pages
  pages: {
    signIn: "/login",
    newUser: "/register",
  },

  callbacks: {
    // Add user ID to JWT token
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    // Add user ID to session object
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };