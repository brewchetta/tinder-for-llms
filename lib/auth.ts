import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * For local development we use a passwordless "dev login": enter any email and
 * you're signed in as that user (created on first use). This keeps the app
 * runnable with zero external setup while still being real, multi-user, session
 * -backed auth — swipes/matches are tied to a persisted User row.
 *
 * To move to production auth, add an OAuth provider (e.g. GitHub/Google) or the
 * Email provider to the `providers` array. The Prisma adapter below is already
 * wired so OAuth account/session persistence works without further changes.
 * (Credentials requires the JWT session strategy, which is why it's set here.)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/sign-in" },
  providers: [
    Credentials({
      name: "Dev login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        if (!email || !email.includes("@")) return null;

        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, name: email.split("@")[0] },
        });
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    // Persist the user id onto the JWT so it's available on the session.
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
