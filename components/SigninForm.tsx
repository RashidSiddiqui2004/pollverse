"use client";

import { signIn } from "next-auth/react";

export default function SignInForm() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-foreground">
      <div className="flex flex-col items-center gap-2 text-center mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background font-black text-xl">
          P
        </div>
        <h1 className="text-xl font-bold tracking-tight">Sign in to Pollverse</h1>
        <p className="text-xs text-muted-foreground">Select a provider to continue</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 font-semibold text-sm transition-colors hover:bg-muted active:scale-[0.99] cursor-pointer"
          onClick={() => signIn("google", { redirectTo: "/post-auth" })}
        >
          Continue with Google
        </button>

        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 font-semibold text-sm transition-colors hover:bg-muted active:scale-[0.99] cursor-pointer"
          onClick={() => signIn("github", { redirectTo: "/post-auth" })}
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}