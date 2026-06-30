import type { NextAuthConfig } from "next-auth";

const THIRTY_DAYS = 30 * 24 * 60 * 60; // clientes e artesãos
const EIGHT_HOURS = 8 * 60 * 60;        // admin

export const authConfig = {
  providers: [],
  trustHost: true,
  session: { strategy: "jwt", maxAge: THIRTY_DAYS },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        // Admin session expires in 8 hours; everyone else in 30 days
        const isAdmin = (user as { role?: string }).role === "ADMIN";
        token.maxAge = isAdmin ? EIGHT_HOURS : THIRTY_DAYS;
      }
      // Enforce per-role expiry on every JWT refresh
      if (trigger === "update" || !trigger) {
        const isAdmin = token.role === "ADMIN";
        token.maxAge = isAdmin ? EIGHT_HOURS : THIRTY_DAYS;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      // Apply the per-role maxAge to the session expiry
      if (token.maxAge) {
        session.expires = new Date(Date.now() + (token.maxAge as number) * 1000).toISOString();
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
