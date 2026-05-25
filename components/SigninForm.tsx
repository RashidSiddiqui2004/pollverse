"use client";

import { signIn } from "next-auth/react";

export default function SignInForm() {

  return (
    <div className="rounded-2xl border p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Sign in</h1>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          className="rounded-md border px-4 py-2"
          onClick={() => signIn("google", { redirectTo: "/post-auth" })}
        >
          Continue with Google
        </button>

        <button
          type="button"
          className="rounded-md border px-4 py-2"
          onClick={() => signIn("github", { redirectTo: "/post-auth" })}
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}