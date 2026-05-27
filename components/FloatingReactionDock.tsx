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
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-base transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          {getEmoji(value ?? defaultReaction)}
        </button>

        <div
          className={[
            "absolute top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm backdrop-blur-md transition-all duration-150",
            "pointer-events-none opacity-0 scale-95 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100",
            "group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:scale-100",
            align === "right" ? "right-11 origin-right" : "left-11 origin-left",
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
                  "flex h-8 w-8 items-center justify-center rounded-full text-base transition-all duration-150",
                  "hover:bg-muted",
                  active
                    ? "bg-muted ring-1 ring-border font-bold scale-[1.05]"
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