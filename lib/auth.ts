import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

/**
 * Google OAuth is enabled only when its credentials are present, so the app still
 * runs locally without them. Set AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET in .env to
 * turn it on (see GOOGLE_OAUTH.md). The sign-in page reads this to show the button.
 */
export const googleEnabled =
  !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET;

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * Providers:
 *  - Google OAuth (when AUTH_GOOGLE_ID/SECRET are set) — production sign-in.
 *  - A passwordless "dev login" (enter any email → user created on first use) so
 *    the app stays runnable locally with zero setup.
 *
 * Both persist to the DB via the Prisma adapter. Credentials requires the JWT
 * session strategy, so we use JWT for everything (one session shape for both).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/sign-in" },
  providers: [
    // allowDangerousEmailAccountLinking links a Google sign-in to an existing user
    // with the same email (e.g. one made via the dev login). Safe here since we
    // trust Google-verified emails; remove it if you require explicit linking.
    ...(googleEnabled
      ? [Google({ allowDangerousEmailAccountLinking: true })]
      : []),
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
