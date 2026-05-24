import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    userName: string | null;
    header: string | null;
    bio: string | null;
    isPublic: boolean;
    onboardingCompleted: boolean;
  }

  interface Session {
    user: {
      id: string;
      userName: string | null;
        header: string | null;
      bio: string | null;
      isPublic: boolean;
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
    interface JWT {
        /** The user's UUID from the usersTable */
        id: string;
        userName: string | null;
        header: string | null;
        bio: string | null;
        isPublic: boolean;
        onboardingCompleted: boolean;
    }
}
