export enum ReactionType {
    FUNNY = "funny",
    LIKE = "like",
    LOVE = "love",
    INSIGHTFUL = "insightful",
    SUPPORT = "support"
}

export const REACTION_EMOJIS: Record<ReactionType, string> = {
    [ReactionType.FUNNY]: "😂",
    [ReactionType.LIKE]: "👍",
    [ReactionType.LOVE]: "❤️",
    [ReactionType.INSIGHTFUL]: "💡",
    [ReactionType.SUPPORT]: "🙌"
};

/**
 * Checks if a string is a valid ReactionType.
 */
export function isValidReaction(reaction: string): reaction is ReactionType {
    return Object.values(ReactionType).includes(reaction as ReactionType);
}

/**
 * Gets the emoji character associated with a ReactionType.
 */
export function getEmoji(reaction: ReactionType): string {
    return REACTION_EMOJIS[reaction];
}

/**
 * Gets a list of all supported reaction types.
 */
export function getSupportedReactions(): ReactionType[] {
    return Object.values(ReactionType);
}
