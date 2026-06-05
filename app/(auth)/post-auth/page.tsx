import { userStore } from "@/app/lib";
import { auth } from "@/auth";
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