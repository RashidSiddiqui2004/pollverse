"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="w-fit rounded-md border px-4 py-2"
      onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
    >
      Sign out
    </button>
  );
}