"use client";

import { API_BASE_URL } from "@/app/utils/constants";
import { postJSON } from "@/app/utils/postJson";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateGroupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

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
    router.push("/signin");
    return null;
  }

  const handleUserGroupSubmit = async () => {
    try {
      setLoading(true);

      const userId = session.user.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await postJSON<{
        success: boolean;
        data: { id: string };
      }>(`${API_BASE_URL}/groups`, {
        userId,
        groupName,
        description,
        isPublic
      });

      if (!response.success) {
        throw new Error("Failed to create user group");
      }

      const userGroup = response.data;
      router.push(`/groups/${userGroup.id}`);
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-neutral-100 px-6 py-5 sm:px-8">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Create Group
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Build a space for people with shared interests.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8 px-6 py-6 sm:px-8">
          {/* Group Name */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-700">
              Group Name
            </label>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-700">
              Description
            </label>
            <textarea
              placeholder="Tell people what this group is about"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />
          </div>

          {/* Visibility */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-800">
                  Public Group
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Anyone can discover and join this group.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={[
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                  isPublic ? "bg-neutral-900" : "bg-neutral-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                    isPublic ? "translate-x-6" : "translate-x-1",
                  ].join(" ")}
                />
              </button>
            </label>
          </div>

          {/* Preview */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="text-sm font-semibold text-neutral-800">Preview</p>
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="text-base font-semibold text-neutral-900">
                {groupName || "Group Name Preview"}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                {description || "Your group description will appear here."}
              </p>
              <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm">
                {isPublic ? "Public" : "Private"}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              onClick={handleUserGroupSubmit}
              disabled={loading || !groupName.trim()}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-neutral-900 px-6 text-sm font-medium text-white transition-all hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}