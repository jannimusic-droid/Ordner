import type { NextAuthConfig } from "next-auth";

/**
 * Edge-sichere Basiskonfiguration ohne Provider (kein Prisma/bcrypt-Import),
 * damit die Middleware nicht die volle Node.js-Auth-Konfiguration bündeln muss.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: string }).role;
        token.departmentId = (user as { departmentId: string | null }).departmentId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.departmentId = token.departmentId as string | null;
      }
      return session;
    },
  },
};
