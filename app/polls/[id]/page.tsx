"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { API_BASE_URL } from "@/app/utils/constants";
import PollCard from "@/components/PollCard";
import { Poll } from "@/app/lib/poll-store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PollPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    const userId = session?.user?.id || "anonymous";
    fetch(`${API_BASE_URL}/polls/${id}?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPoll(data.data);
        } else {
          setError(data.error || "Failed to load poll");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading poll details:", err);
        setError("An error occurred while loading this poll.");
        setLoading(false);
      });
  }, [id, session, status]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 text-foreground">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Link href="/" className="rounded-full p-2 hover:bg-muted text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Poll Detail</h1>
        </div>
        <div className="py-12 text-center text-sm text-muted-foreground">Loading poll details...</div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex flex-col gap-6 text-foreground">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Link href="/" className="rounded-full p-2 hover:bg-muted text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Poll Detail</h1>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          <p className="text-sm font-semibold">{error || "Poll not found"}</p>
          <p className="text-xs mt-1">Please double check the URL or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-foreground">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link href="/" className="rounded-full p-2 hover:bg-muted text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Poll Detail</h1>
      </div>

      <PollCard poll={poll} />
    </div>
  );
}