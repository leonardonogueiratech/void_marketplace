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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        // Set exp at login time — admin 8h, todos os outros 30 dias
        const isAdmin = (user as { role?: string }).role === "ADMIN";
        token.exp = Math.floor(Date.now() / 1000) + (isAdmin ? EIGHT_HOURS : THIRTY_DAYS);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
