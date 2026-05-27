'use client';

import { API_BASE_URL } from "@/app/utils/constants";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const { data: session, status } = useSession();

    const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
    const [username, setUsername] = useState("");
    const [header, setHeader] = useState("");
    const [bio, setBio] = useState("");
    const [isPublic, setIsPublic] = useState(true);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/user-profile/${encodeURIComponent(session?.user?.email || "")}`
            );
            const data = await response.json();
            const user = data.user;
            if (user) {
                setUsername(user.userName || "");
                setHeader(user.header || "");
                setBio(user.bio || "");
                setIsPublic(user.isPublic);
            }
            else {
                setIsFirstTimeUser(true);
            }
        } catch (e) {
            console.error("Error fetching user profile", e);
        }
    }

    useEffect(() => {
        fetchUserProfile();
    }, [status]);

    const checkIfUsernameIsUnique = async (username: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/check-username?username=${username}`);
            const data = await response.json();
            return data.isUnique;
        } catch (e) {
            console.error("Error checking username uniqueness", e);
            return false;
        }
    }

    const handleProfileUpdate = async () => {
        if (username && header) {
            const userData = {
                name: session?.user?.name || "",
                userName: username,
                email: session?.user?.email || "",
                header,
                bio,
                isPublic,
                avatarUrl: session?.user?.image || "",
            }

            try {
                const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(session?.user?.id || "")}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();
                if (!data.success) {
                    alert(data.error || "Failed to update profile");
                    throw new Error(data.error || "Failed to update profile");
                }
                else{
                    alert("Profile updated successfully!");
                }

            } catch (e) {
                console.error("Error updating profile", e);
                alert("An error occurred while updating your profile. Please try again.");
                return;
            }
        }
        else {
            alert("Please fill in all fields before updating your profile.");
        }
    }

    const handleProfileCreate = async () => {
        if (username && header) {
            const userData = {
                name: session?.user?.name || "",
                userName: username,
                email: session?.user?.email || "",
                header,
                bio,
                isPublic,
                avatarUrl: session?.user?.image || "",
            }

            try {
                const response = await fetch(`${API_BASE_URL}/users`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error || "Failed to update profile");
                }

                alert("Profile updated successfully!");
            } catch (e) {
                console.error("Error updating profile", e);
                alert("An error occurred while updating your profile. Please try again.");
                return;
            }
        }
        else {
            alert("Please fill in all fields before updating your profile.");
        }
    };

    // Check if username is unique whenever it changes
    // Use a debounce mechanism to avoid making too many API calls while the user is typing
    useEffect(() => {
        if (isFirstTimeUser && username) {
            const timeoutId = setTimeout(async () => {
                const isUnique = await checkIfUsernameIsUnique(username);
                if (!isUnique) {
                    alert("Username is already taken. Please choose another one.");
                }
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [username]);

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-6 text-foreground">
            <h1 className="text-xl font-bold tracking-tight mb-6">Welcome, {session?.user?.name}!</h1>

            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground px-1">Username</label>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        disabled={!isFirstTimeUser}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2.5 border border-border bg-background text-foreground rounded-xl outline-none focus:border-foreground/20 focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground text-sm disabled:opacity-50"
                    />
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground px-1">Header Message</label>
                    <input
                        type="text"
                        placeholder="Header"
                        value={header}
                        onChange={(e) => setHeader(e.target.value)}
                        className="w-full px-4 py-2.5 border border-border bg-background text-foreground rounded-xl outline-none focus:border-foreground/20 focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground px-1">Bio</label>
                    <textarea
                        placeholder="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-border bg-background text-foreground rounded-xl outline-none focus:border-foreground/20 focus:ring-1 focus:ring-foreground/20 placeholder:text-muted-foreground text-sm"
                    />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground py-1">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-foreground focus:ring-border bg-background"
                    />
                    <span>Make my profile public</span>
                </label>

                <button 
                    className="w-full sm:w-auto px-5 py-2.5 bg-foreground text-background font-bold text-sm rounded-xl hover:opacity-90 active:scale-[0.99] transition-transform cursor-pointer" 
                    onClick={() => { isFirstTimeUser ? handleProfileCreate() : handleProfileUpdate() }}
                >
                    Update Profile
                </button>
            </div>
        </div>
    );
}