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
        <div className="rounded-2xl border p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-4">Welcome, {session?.user?.name}!</h1>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    disabled={!isFirstTimeUser}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="Header"
                    value={header}
                    onChange={(e) => setHeader(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                />
                <textarea
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                />
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="form-checkbox"
                    />
                    <span>Make my profile public</span>
                </label>
                <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={() => { isFirstTimeUser ? handleProfileCreate() : handleProfileUpdate() }}>
                    Update Profile
                </button>
            </div>
        </div>
    );
}