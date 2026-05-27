"use client";

import { API_BASE_URL } from "@/app/utils/constants";
import { useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { PollClosingTimePicker } from "@/components/PollClosingtimePicker";
import { postJSON } from "@/app/utils/postJson";

export interface PollOptionDto {
    text: string;
    mediaUrl: string;
}

export default function CreatePollPage() {
    const { data: session, status } = useSession();

    const [question, setQuestion] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [isMultiVotingAllowed, setIsMultiVotingAllowed] = useState<boolean>(false);
    const [closingTime, setClosingTime] = useState<Date | null>(null);

    const [pollOptions, setPollOptions] = useState<PollOptionDto[]>([
        { text: "", mediaUrl: "" },
    ]);

    if (status === "loading") {
        return (
            <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
                <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-4 text-sm text-neutral-600 shadow-sm">
                    Loading...
                </div>
            </div>
        );
    }

    if (!session?.user) {
        redirect("/signin");
    }

    const handleAddOption = () => {
        setPollOptions([...pollOptions, { text: "", mediaUrl: "" }]);
    }

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
                isMultiVotingAllowed,
                closingTime: closingTime?.toISOString() || null
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
        <div className="mx-auto w-full max-w-2xl">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-6 py-5 sm:px-8">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        Create Poll
                    </h1>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Ask a question, add options, and let people vote.
                    </p>
                </div>

                <div className="space-y-6 px-6 py-6 sm:px-8">
                    {/* Question */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                            Poll Question
                        </label>

                        <input
                            type="text"
                            placeholder="What should we build next?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/20 focus:ring-1 focus:ring-foreground/20"
                        />
                    </div>

                    {/* Poll Media */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">
                            Poll Media
                        </label>

                        <div className="rounded-xl border border-dashed border-border bg-secondary/10 p-5 transition-colors hover:border-foreground/20">
                            <input
                                type="file"
                                className="block w-full cursor-pointer text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-xs file:font-bold file:text-background hover:file:opacity-90"
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];

                                        const uploadedUrl =
                                            await handleMediaUpload(file);

                                        if (uploadedUrl) {
                                            setMediaUrl(uploadedUrl);
                                        }
                                    }
                                }}
                            />

                            {mediaUrl && (
                                <div className="mt-4 overflow-hidden rounded-xl border border-border">
                                    <img
                                        src={mediaUrl}
                                        alt="Poll media"
                                        className="max-h-87.5 w-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Poll Options */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-foreground">
                                Poll Options
                            </label>

                            <span className="text-xs text-muted-foreground">
                                Minimum 2 options
                            </span>
                        </div>

                        <div className="space-y-3">
                            {pollOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-border bg-secondary/10 p-4"
                                >
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder={`Option ${index + 1}`}
                                            value={option.text}
                                            onChange={(e) => {
                                                const newOptions = [...pollOptions];
                                                newOptions[index].text =
                                                    e.target.value;

                                                setPollOptions(newOptions);
                                            }}
                                            className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/20 focus:ring-1 focus:ring-foreground/20"
                                        />

                                        <input
                                            type="file"
                                            className="block w-full cursor-pointer text-xs text-muted-foreground file:mr-4 file:rounded-lg file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground hover:file:bg-muted"
                                            onChange={async (e) => {
                                                if (e.target.files?.[0]) {
                                                    const file = e.target.files[0];

                                                    const uploadedUrl =
                                                        await handleMediaUpload(file);

                                                    if (uploadedUrl) {
                                                        const newOptions = [
                                                            ...pollOptions,
                                                        ];

                                                        newOptions[index].mediaUrl =
                                                            uploadedUrl;

                                                        setPollOptions(newOptions);
                                                    }
                                                }
                                            }}
                                        />

                                        {option.mediaUrl && (
                                            <div className="overflow-hidden rounded-xl border border-border">
                                                <img
                                                    src={option.mediaUrl}
                                                    alt={`Option ${index + 1}`}
                                                    className="h-40 w-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-xs font-bold text-foreground transition-colors hover:bg-muted cursor-pointer"
                        >
                            + Add Option
                        </button>
                    </div>

                    {/* Poll Settings */}
                    <div className="space-y-5 rounded-xl border border-border bg-secondary/10 p-5">
                        <h2 className="text-sm font-bold text-foreground">
                            Poll Settings
                        </h2>

                        {/* Multi Vote */}
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Allow Multiple Votes
                                </p>

                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Users can vote on more than one option.
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={isMultiVotingAllowed}
                                onChange={() =>
                                    setIsMultiVotingAllowed(
                                        !isMultiVotingAllowed
                                    )
                                }
                                className="h-5 w-5 rounded border-border text-foreground focus:ring-border bg-background"
                            />
                        </label>

                        {/* Closing Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                                Poll Closing Time
                            </label>
                            <p className="text-xs text-muted-foreground">By default, there is no closing time.</p>

                            <PollClosingTimePicker
                                value={closingTime}
                                onChange={setClosingTime}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            onClick={handlePollSubmit}
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-bold text-background transition-transform hover:opacity-90 active:scale-[0.98] cursor-pointer"
                        >
                            Create Poll
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}