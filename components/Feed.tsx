"use client";
import { useEffect, useState } from "react";
import PollCard from './PollCard';
import { Poll } from "@/app/lib/poll-store";
import { API_BASE_URL } from "@/app/utils/constants";

export default function PublicPolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/polls`)
      .then((res) => res.json())
      .then((data) => {
        setPolls(data.data.polls);
        setLoading(false);
      });

  }, []);

  if (loading) return <div>Loading polls...</div>;

  return (
    <div className="space-y-4">
      {polls && polls.length > 0 ? polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      )) : <div>No polls found</div>}
    </div>
  );
}
