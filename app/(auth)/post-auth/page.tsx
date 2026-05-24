import { auth } from "@/auth";
import { userStore } from "@/app/lib/user-store";
import { redirect } from "next/navigation";

export default async function PostAuthPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/signin");
  }

  const dbUser = await userStore.getUserByEmail(session.user.email);

  if (!dbUser) {
    redirect("/profile");
  }

  if (!dbUser.onboardingCompleted) {
    redirect("/profile");
  }

  redirect("/");
}