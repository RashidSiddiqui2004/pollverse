"use client";

import * as React from "react";
import {
  ReactionType,
  getSupportedReactions,
  getEmoji,
} from "@/app/utils/reactions";

type FloatingReactionDockProps = {
  value?: ReactionType | null;
  onChange: (reaction: ReactionType) => void;
  className?: string;
  align?: "left" | "right";
};

export function FloatingReactionDock({
  value,
  onChange,
  className = "",
  align = "right",
}: FloatingReactionDockProps) {
  const reactions = React.useMemo(() => getSupportedReactions(), []);
  const defaultReaction = ReactionType.LIKE;

  return (
    <div
      className={[
        "group absolute z-30",
        align === "right" ? "right-3 top-3" : "left-3 top-3",
        className,
      ].join(" ")}
    >
      <div className="relative">
        <button
          type="button"
          aria-label="React"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-lg shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          {getEmoji(value ?? defaultReaction)}
        </button>

        <div
          className={[
            "absolute top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 shadow-lg backdrop-blur-md transition-all duration-200",
            "pointer-events-none opacity-0 scale-95 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100",
            "group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:scale-100",
            align === "right" ? "right-12 origin-right" : "left-12 origin-left",
            "dark:border-neutral-800 dark:bg-neutral-950",
          ].join(" ")}
        >
          {reactions.map((reaction) => {
            const active = value === reaction;

            return (
              <button
                key={reaction}
                type="button"
                aria-label={reaction}
                title={reaction}
                onClick={() => onChange(reaction)}
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all duration-150",
                  "hover:-translate-y-1 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  active
                    ? "scale-110 bg-neutral-100 ring-2 ring-neutral-300 dark:bg-neutral-800 dark:ring-neutral-600"
                    : "bg-transparent",
                ].join(" ")}
              >
                <span>{getEmoji(reaction)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}