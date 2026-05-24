"use client"

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 shadow-md rounded-md mb-4">
      <div className="flex space-x-4">
        <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:underline">
          Home
        </Link>
        <Link href="/profile" className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:underline">
          Profile
        </Link>
      </div>
      <div>
        {session?.user ? (
          <>
            <Link href="/createPoll" className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:underline">
              Create Poll
            </Link> 
            <button
              onClick={() => signOut()}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </>         
        ) : (
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
