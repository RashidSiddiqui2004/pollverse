'use client';

import { UserGroup } from "@/app/lib/group-store";
import { API_BASE_URL } from "@/app/utils/constants";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
            console.error("Error occured while fetching user groups", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserGroups();
    }, []);

    if (loading) return <div>Loading groups...</div>;

    return (
        <div>
            {
                (userGroups.length == 0) ?
                    <div>
                        <h1>You're not part of any group.</h1>
                        View <Link href={"/groups"} className="underline">public groups</Link> to find your next group.
                    </div>
                    :
                    userGroups.map((usergroup) => {
                        return (
                            <>
                                {usergroup.groupName}
                            </>
                        )
                    })
            }
        </div>
    );
};