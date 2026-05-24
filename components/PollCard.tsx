"use client";
import { Poll, PollOption } from "@/app/lib/poll-store";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/app/utils/constants";

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votes, setVotes] = useState<PollOption[]>(poll.pollOptions);

  const checkIfUserAlreadyVoted = async () => {
    if (status !== "authenticated") {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/polls/${poll.id}/vote?userId=${session.user?.id}`, {
        method: "GET"
      });
      const data = await response.json();
      return data.data.hasVoted;
    } catch (e) {
      console.error("Error checking vote status:", e);
      return false;
    }
  }

  const handleVote = async (optionId: number) => {
    if (hasVoted) {
      alert("You have already voted for this poll.");
      return;
    }

    if (status !== "authenticated") {
      // Redirect unauthenticated users to signin page
      router.push("/signin");
      return;
    }

    const newVotes = [...votes];
    console.log("Current votes before update:", newVotes);

    // Update the vote count for the selected option
    const optionIndex = newVotes.findIndex((opt) => opt.id === optionId);
    if (optionIndex !== -1) {
      newVotes[optionIndex] = {
        ...newVotes[optionIndex],
        voteCount: newVotes[optionIndex].voteCount + 1,
      };
    }
    // Make sure each user can only vote once per poll
    try {
      const res = await fetch(`${API_BASE_URL}/polls/${poll.id}/vote?userId=${session.user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionId }),
      });

      const data = await res.json();
      if (data.success) {
        setVotes(newVotes);
        console.log("Updated votes after update:", newVotes);
      }
    } catch (e) {
      // Revert optimistic update on error
      setVotes(poll.pollOptions);
    }
  };

  useEffect(() => {
    const fetchVoteStatus = async () => {
      const hasVoted = await checkIfUserAlreadyVoted();
      setHasVoted(hasVoted);
    };

    if (status === "authenticated") {
      fetchVoteStatus();
    }
  }, [status]);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      {/* Poll Media */}
      {poll.mediaUrl && (
        <div className="relative aspect-video w-full overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
          <img
            src={poll.mediaUrl}
            alt="Poll media"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold leading-tight text-neutral-900 dark:text-neutral-100 sm:text-xl">
              {poll.question}
            </h3>

            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {votes.reduce((acc, curr) => acc + curr.voteCount, 0)} total votes
            </p>
          </div>
        </div>

        {/* Poll Options */}
        <div className="space-y-3">
          {poll.pollOptions.map((option, idx) => {
            const voteCount = votes[idx]?.voteCount ?? 0;

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                className="group cursor-pointer flex w-full items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-left transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-100 active:scale-[0.99] dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
              >
                {/* Option Media */}
                {option.mediaUrl && (
                  <div className="h-16 w-16 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <img
                      src={option.mediaUrl}
                      alt={option.text}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Option Content */}
                <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100 sm:text-base">
                      {option.text}
                    </p>
                  </div>

                  {/* Vote Count */}
                  <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm dark:bg-neutral-800 dark:text-neutral-300">
                    <span>{voteCount}</span>
                    <span className="text-neutral-400">votes</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}