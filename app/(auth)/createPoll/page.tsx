"use client";

import { API_BASE_URL } from "@/app/utils/constants";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { PollClosingTimePicker } from "@/components/PollClosingtimePicker";

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
    const [isMultiVotingAllowed, setIsMultiVotingAllowed] = useState<boolean>(false);
    const [closingTime, setClosingTime] = useState<Date | null>(null);

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
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-100 px-6 py-5 sm:px-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
                        Create Poll
                    </h1>

                    <p className="mt-1 text-sm text-neutral-500">
                        Ask a question, add options, and let people vote.
                    </p>
                </div>

                <div className="space-y-8 px-6 py-6 sm:px-8">
                    {/* Question */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-neutral-700">
                            Poll Question
                        </label>

                        <input
                            type="text"
                            placeholder="What should we build next?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
                        />
                    </div>

                    {/* Poll Media */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-neutral-700">
                            Poll Media
                        </label>

                        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-5 transition-colors hover:border-neutral-400">
                            <input
                                type="file"
                                className="block w-full cursor-pointer text-sm text-neutral-600 file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
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
                                <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200">
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
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-neutral-700">
                                Poll Options
                            </label>

                            <span className="text-xs text-neutral-400">
                                Minimum 2 options
                            </span>
                        </div>

                        <div className="space-y-4">
                            {pollOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
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
                                            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
                                        />

                                        <input
                                            type="file"
                                            className="block w-full cursor-pointer text-sm text-neutral-600 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-neutral-700 file:shadow-sm hover:file:bg-neutral-100"
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
                                            <div className="overflow-hidden rounded-xl border border-neutral-200">
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
                            className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                        >
                            + Add Option
                        </button>
                    </div>

                    {/* Poll Settings */}
                    <div className="space-y-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                        <h2 className="text-sm font-semibold text-neutral-800">
                            Poll Settings
                        </h2>

                        {/* Multi Vote */}
                        <label className="flex cursor-pointer items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-neutral-800">
                                    Allow Multiple Votes
                                </p>

                                <p className="text-xs text-neutral-500">
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
                                className="h-5 w-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                            />
                        </label>

                        {/* Closing Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">
                                Poll Closing Time
                            </label>
                            <p className="text-xs text-neutral-500">By default, there is no closing time.</p>

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
                            className="inline-flex h-12 items-center justify-center rounded-2xl bg-neutral-900 px-6 text-sm font-medium text-white transition-all hover:bg-neutral-700 active:scale-[0.98]"
                        >
                            Create Poll
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}