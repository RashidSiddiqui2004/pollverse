"use client";

import { useSession } from "next-auth/react";
import Feed from "@/components/Feed";

export default function Home() {
  const { status } = useSession();
  const loading = status === "loading";

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="max-w-xl flex flex-col">
      <Feed/>
    </div>
  );
}
