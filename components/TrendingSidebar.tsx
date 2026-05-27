"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Flame, Users, ArrowRight } from "lucide-react";
import { Poll } from "@/app/lib/poll-store";
import { UserGroup } from "@/app/lib/group-store";
import { API_BASE_URL } from "@/app/utils/constants";

export default function TrendingSidebar() {
  const [trendingPolls, setTrendingPolls] = useState<Poll[]>([]);
  const [popularGroups, setPopularGroups] = useState<UserGroup[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch trending polls
    fetch(`${API_BASE_URL}/polls/trending`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.polls) {
          setTrendingPolls(data.data.polls.slice(0, 3));
        }
        setLoadingPolls(false);
      })
      .catch((err) => {
        console.error("Failed to fetch trending polls in sidebar:", err);
        setLoadingPolls(false);
      });

    // Fetch popular/public groups
    fetch(`${API_BASE_URL}/groups/public`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.userGroups) {
          setPopularGroups(data.data.userGroups.slice(0, 3));
        }
        setLoadingGroups(false);
      })
      .catch((err) => {
        console.error("Failed to fetch public groups in sidebar:", err);
        setLoadingGroups(false);
      });
  }, []);

  return (
    <aside className="sticky top-0 hidden h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l border-border bg-background px-6 py-6 text-foreground xl:flex">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground stroke-[1.8px]" />
        <input
          type="text"
          placeholder="Search Pollverse..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-full border border-border bg-secondary/30 py-3 pr-4 pl-12 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/20 focus:bg-background focus:ring-1 focus:ring-foreground/20"
        />
      </div>

      {/* Trending Polls Section */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500 fill-orange-500 stroke-[1.5px]" />
          <h2 className="text-lg font-bold">Trending Polls</h2>
        </div>

        {loadingPolls ? (
          <div className="text-sm text-muted-foreground py-2">Loading trends...</div>
        ) : trendingPolls.length > 0 ? (
          <div className="flex flex-col gap-4">
            {trendingPolls.map((poll) => {
              const totalVotes = poll.pollOptions.reduce((sum, opt) => sum + opt.voteCount, 0);
              return (
                <Link
                  key={poll.id}
                  href={`/polls/${poll.id}`}
                  className="group flex flex-col gap-1 rounded-xl p-2 transition-colors hover:bg-muted"
                >
                  <span className="text-xs text-muted-foreground font-medium">Trending now</span>
                  <span className="text-sm font-semibold leading-tight text-foreground group-hover:underline">
                    {poll.question}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
                  </span>
                </Link>
              );
            })}
            <Link
              href="/trendingPolls"
              className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-500 hover:underline"
            >
              <span>Show more</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-2">No trending polls found</div>
        )}
      </div>

      {/* Recommended Groups Section */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500 stroke-[1.8px]" />
          <h2 className="text-lg font-bold">Popular Groups</h2>
        </div>

        {loadingGroups ? (
          <div className="text-sm text-muted-foreground py-2">Loading groups...</div>
        ) : popularGroups.length > 0 ? (
          <div className="flex flex-col gap-4">
            {popularGroups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="group flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground group-hover:underline">
                    {group.groupName}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {group.description || "No description"}
                  </span>
                </div>
                <span className="text-xs font-medium rounded-full bg-secondary px-2.5 py-1">
                  View
                </span>
              </Link>
            ))}
            <Link
              href="/groups"
              className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-500 hover:underline"
            >
              <span>Explore groups</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-2">No public groups found</div>
        )}
      </div>
    </aside>
  );
}
