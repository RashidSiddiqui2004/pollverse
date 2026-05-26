"use client"

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow-md rounded-md mb-4">
      <div className="flex space-x-4">
        <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:underline">
          Home
        </Link>
        {session?.user && (
          <>
            <Link href="/profile" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Profile
            </Link>
            <Link href="/createPoll" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Create Poll
            </Link>
            <Link href="/createGroup" className="text-lg font-semibold text-gray-500 dark:text-gray-100">
              Create Group
            </Link>
          </>
        )}

      </div>
      <div>
        {session?.user ?
          <SignOutButton />
          : (
            <Link
              href="/api/auth/signin"
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign In
            </Link>
          )}
      </div>
    </nav>
  );
}
