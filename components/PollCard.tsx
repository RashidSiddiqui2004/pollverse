"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BiSelectMultiple } from "react-icons/bi";
import { GrCheckboxSelected } from "react-icons/gr";
import { FloatingReactionDock } from "@/components/FloatingReactionDock";
import { Poll, PollOption } from "@/app/lib/poll-store";
import { ReactionType } from "@/app/utils/reactions";
import { API_BASE_URL } from "@/app/utils/constants";

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [votes, setVotes] = useState<PollOption[]>(poll.pollOptions);
  const [userReaction, setUserReaction] = useState(ReactionType.LIKE);

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
    if (!poll.isMultiVotingAllowed && hasVoted) {
      alert("You have already voted for this singularity poll.");
      return;
    }

    if (status !== "authenticated") {
      router.push("/signin");
      return;
    }

    const newVotes = [...votes];
    const optionIndex = newVotes.findIndex((opt) => opt.id === optionId);
    if (optionIndex !== -1) {
      newVotes[optionIndex] = {
        ...newVotes[optionIndex],
        voteCount: newVotes[optionIndex].voteCount + 1,
      };
    }

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
        setHasVoted(true);
      }
    } catch (e) {
      setVotes(poll.pollOptions);
      console.error("Error while reacting to poll: ", e);
      throw new Error("Failed to react to poll");
    }
  };

  const handleReact = async (reaction: ReactionType, optionId: number | null = null): Promise<void> => {
    if (status !== "authenticated") {
      router.push("/signin");
      return;
    }

    try {
      if (optionId === null) {
        const res = await fetch(`${API_BASE_URL}/polls/${poll.id}/react?userId=${session.user?.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reaction }),
        });

        const data = await res.json();
        if (data.success) {
          setUserReaction(reaction);
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/polls/options/${optionId}react?userId=${session.user?.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reaction }),
        });

        const data = await res.json();
        if (data.success) {
          setUserReaction(reaction);
        }
      }
    } catch (e) {
      console.error("Error while reacting to poll: ", e);
      throw new Error("Failed to react to poll");
    }
  };

  useEffect(() => {
    const fetchVoteStatus = async () => {
      const voted = await checkIfUserAlreadyVoted();
      setHasVoted(voted);
    };

    if (status === "authenticated") {
      fetchVoteStatus();
    }
  }, [status]);

  const totalVotes = votes.reduce((acc, curr) => acc + curr.voteCount, 0);

  return (
    <div className="relative my-4 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-foreground transition-colors">
      {/* Floating Reaction Dock */}
      <FloatingReactionDock
        value={userReaction}
        onChange={(reaction) => handleReact(reaction)}
        align="right"
      />

      {/* Poll Media */}
      {poll.mediaUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-secondary/10">
          <img
            src={poll.mediaUrl}
            alt="Poll media"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Poll Heading & Meta */}
      <div className="flex flex-col gap-1.5 pr-12">
        <h3 className="text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl">
          {poll.question}
        </h3>

        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
          <span className="font-bold text-foreground">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            {poll.isMultiVotingAllowed ? (
              <>
                <BiSelectMultiple className="h-3.5 w-3.5" />
                <span>Multiple selection</span>
              </>
            ) : (
              <>
                <GrCheckboxSelected className="h-3.5 w-3.5" />
                <span>Single selection</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Poll Options */}
      <div className="flex flex-col gap-2">
        {poll.pollOptions.map((option, idx) => {
          const voteCount = votes[idx]?.voteCount ?? 0;
          const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!poll.isMultiVotingAllowed && hasVoted}
              className="group relative overflow-hidden flex w-full items-center gap-4 rounded-xl border border-border bg-card p-3.5 text-left transition-all hover:bg-muted/50 disabled:cursor-default"
            >
              {/* Progress bar visual overlay */}
              {hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 bg-blue-500/10 dark:bg-blue-500/20 transition-all duration-500 ease-out"
                  style={{ width: `${percent}%` }}
                />
              )}

              {/* Option content */}
              <div className="relative z-10 flex min-w-0 flex-1 items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {option.mediaUrl && (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/10">
                      <img
                        src={option.mediaUrl}
                        alt={option.text}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                    {option.text}
                  </span>
                </div>

                {/* Option badge or percentage */}
                <div className="flex items-center gap-2">
                  {hasVoted ? (
                    <span className="text-sm font-bold text-foreground">{percent}%</span>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors group-hover:bg-secondary">
                      <span>{voteCount}</span>
                      <span>{`vote${voteCount !== 1 ? 's' : ''}`}</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}