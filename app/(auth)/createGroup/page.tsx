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
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Header */}
        <div className="border-b border-border px-6 py-5 sm:px-8">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Create Group
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Build a space for people with shared interests.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-8 px-6 py-6 sm:px-8">
          {/* Group Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Group Name
            </label>
            <input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/20 focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Description
            </label>
            <textarea
              placeholder="Tell people what this group is about"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground/20 focus:ring-1 focus:ring-foreground/20"
            />
          </div>

          {/* Visibility */}
          <div className="rounded-xl border border-border bg-secondary/10 p-5">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Public Group
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Anyone can discover and join this group.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={[
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
                  isPublic ? "bg-foreground" : "bg-muted",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                    isPublic ? "translate-x-6" : "translate-x-1",
                  ].join(" ")}
                />
              </button>
            </label>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-bold text-foreground">Preview</p>
            <div className="mt-4 rounded-xl border border-border bg-secondary/10 p-4">
              <h3 className="text-base font-bold text-foreground">
                {groupName || "Group Name Preview"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {description || "Your group description will appear here."}
              </p>
              <div className="mt-4 inline-flex rounded-full bg-card border border-border px-3 py-1 text-xs font-semibold text-foreground">
                {isPublic ? "Public" : "Private"}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              onClick={handleUserGroupSubmit}
              disabled={loading || !groupName.trim()}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-bold text-background transition-transform hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] cursor-pointer"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}