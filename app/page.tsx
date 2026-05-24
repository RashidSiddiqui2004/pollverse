"use client";
import { useSession } from "next-auth/react";
import PublicPolls from "@/components/Feed";

export default function Home() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <PublicPolls/>
    </div>
  );
}
