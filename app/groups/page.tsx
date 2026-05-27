'use client';

import { useEffect, useState } from "react";
import { UserGroup } from "../lib/group-store";
import { API_BASE_URL } from "../utils/constants";

export default function GroupsPage() {
    const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUserGroups = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/groups/public`, {
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
                        <h1>No public user groups found.</h1>
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