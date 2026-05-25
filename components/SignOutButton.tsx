"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Sign Out
    </button>
  );
}