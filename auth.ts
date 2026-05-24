import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { db } from "@/app/lib/db";
import { eq } from "drizzle-orm";
import { usersTable } from "@/app/db/schema";
import { userStore } from "@/app/lib/user-store";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      const dbUser = await userStore.getUserByEmail(session.user?.email || "");
      if (dbUser && session.user) {
        session.user.id = dbUser.id;
        session.user.userName = dbUser.userName ?? null;
        session.user.header = dbUser.header ?? null;
        session.user.bio = dbUser.bio ?? null;
        session.user.isPublic = dbUser.isPublic;
        session.user.onboardingCompleted = dbUser.onboardingCompleted;
      }

      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await db
        .update(usersTable)
        .set({ onboardingCompleted: false })
        .where(eq(usersTable.id, user.id));
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}); 