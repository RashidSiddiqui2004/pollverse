"use client";

import { API_BASE_URL } from "@/app/utils/constants";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";

export interface PollOptionDto {
    text: string;
    mediaUrl: string;
}

export default function CreatePollPage() {
    const { data: session } = useSession();

    if (!session?.user) {
        redirect("/signin");
    }

    const [question, setQuestion] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [pollOptions, setPollOptions] = useState<PollOptionDto[]>([
        { text: "", mediaUrl: "" },
    ]);

    const handleAddOption = () => {
        setPollOptions([...pollOptions, { text: "", mediaUrl: "" }]);
    }

    const postJSON = async <T,>(
        url: string,
        body: unknown
    ): Promise<T> => {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            throw new Error(data?.error || `Request failed: ${res.status}`);
        }

        return data as T;
    };

    const handleMediaUpload = async (file: File | Blob): Promise<string | null> => {
        if (!file) return null;

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.error || "Upload failed");
            }

            return data.url ?? null;
        } catch (error) {
            console.error("Error uploading media:", error);
            return null;
        }
    };

    const handlePollSubmit = async () => {
        try {
            const userId = session?.user?.id;
            if (!userId) {
                throw new Error("User not authenticated");
            }

            const pollResponse = await postJSON<{
                success: boolean;
                data: { id: string };
            }>(`${API_BASE_URL}/polls`, {
                userId,
                question,
                mediaUrl,
            });

            if (!pollResponse.success) {
                throw new Error("Failed to create poll");
            }

            const poll = pollResponse.data;

            await Promise.all(
                pollOptions.map((pollOption) =>
                    postJSON(`${API_BASE_URL}/polls/options`, {
                        text: pollOption.text,
                        mediaUrl: pollOption.mediaUrl,
                        pollId: poll.id,
                        userId,
                    })
                )
            );

            alert("Poll created");

            redirect(`/polls/${poll.id}`);
        } catch (error) {
            console.error("Error creating poll:", error);
        }
    };

    return (
        <div>
            <h1>Create Poll</h1>

            <div>
                {/* Question Input */}
                <input type="text" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />

                <input type="file" onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const mediaUrl = await handleMediaUpload(file);
                        if (mediaUrl) {
                            setMediaUrl(mediaUrl);
                        }
                    }
                }} />

                {/* Options Input */}
                {pollOptions.map((option, index) => (
                    <div key={index}>
                        <input type="text" placeholder={`Option ${index + 1}`} value={option.text} onChange={(e) => {
                            const newOptions = [...pollOptions];
                            newOptions[index].text = e.target.value;
                            setPollOptions(newOptions);
                        }} />
                        <input type="file" onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const url = await handleMediaUpload(file);

                                if (url) {
                                    const newOptions = [...pollOptions];
                                    newOptions[index].mediaUrl = url;
                                    setPollOptions(newOptions);
                                }
                            }
                        }} />
                    </div>
                ))}

                <button onClick={handleAddOption}>Add Option</button>
                <button onClick={handlePollSubmit}>Create Poll</button>
            </div>
        </div>
    );
}