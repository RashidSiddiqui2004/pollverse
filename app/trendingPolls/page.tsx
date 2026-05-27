"use client";

import { useSession } from "next-auth/react";
import TrendingPollsFeed from "@/components/TrendingPollsFeed";

export default function TrendingPolls() {
  const { status } = useSession();
  const loading = status === "loading";

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="max-w-xl flex flex-col">
      <h1 className="text-xl font-semibold">Trending Polls</h1>
      <TrendingPollsFeed/>
    </div>
  );
}
