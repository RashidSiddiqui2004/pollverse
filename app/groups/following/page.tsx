'use client';

import { UserGroup } from "@/app/lib/group-store";
import { API_BASE_URL } from "@/app/utils/constants";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, Globe } from "lucide-react";

export default function FollowingGroupsPage() {
    const { data: session } = useSession();
    const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUserGroups = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/groups/following?userId=${session?.user.id}`, {
                method: "GET"
            });
            const data = await response.json();
            setUserGroups(data.data.userGroups);
        } catch (error) {
            console.error("Error occurred while fetching user groups", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user.id) {
            fetchUserGroups();
        }
    }, [session]);

    if (loading) {
        return (
            <div className="flex flex-col gap-6 text-foreground">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <h1 className="text-xl font-bold tracking-tight">Joined Groups</h1>
                </div>
                <div className="py-8 text-center text-sm text-muted-foreground">Loading groups...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h1 className="text-xl font-bold tracking-tight">Joined Groups</h1>
                <Link
                    href="/createGroup"
                    className="inline-flex h-9 items-center justify-center rounded-xl bg-foreground px-4 text-xs font-bold text-background transition-transform hover:opacity-90 active:scale-[0.98] cursor-pointer"
                >
                    Create Group
                </Link>
            </div>

            {userGroups.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2 stroke-[1.5px]" />
                    <p className="text-sm font-semibold">You're not part of any group</p>
                    <p className="text-xs mt-1">
                        Explore{" "}
                        <Link href="/groups" className="font-semibold text-blue-500 hover:underline">
                            public groups
                        </Link>{" "}
                        to find your next group!
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {userGroups.map((usergroup) => (
                        <Link
                            key={usergroup.id}
                            href={`/groups/${usergroup.id}`}
                            className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                                    <Users className="h-5 w-5 stroke-[1.8px]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-foreground group-hover:underline">
                                        {usergroup.groupName}
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[280px] sm:max-w-[400px]">
                                        {usergroup.description || "No description provided"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                                    <Globe className="h-3 w-3" />
                                    <span>Public</span>
                                </span>
                                <span className="text-xs font-bold rounded-lg bg-foreground px-3 py-1.5 text-background transition-transform group-hover:scale-[1.02]">
                                    View
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}