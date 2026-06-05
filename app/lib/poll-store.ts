import { db } from './db';
import { pollsTable, pollsOptionsTable, votesTable, followedUsersTable, userGroupsTable, groupMembersTable, usersTable, reactionsTable } from '../db/schema';
import { desc, sql, eq, gt, and, or, isNull } from 'drizzle-orm';
import { ReactionType } from '../utils/reactions';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';

export interface Poll {
    id: string,
    question: string,
    mediaUrl: string,
    userId: string,
    groupId: string | null,
    isMultiVotingAllowed: boolean,
    closingTime: string | null;
    createdAt: string,
    updatedAt: string | null,
    pollOptions: PollOption[],
};

export interface PollOption {
    id: number,
    pollId: string,
    text: string,
    mediaUrl: string | null,
    voteCount: number,
    createdAt: string,
    updatedAt: string | null
};

export const activePollsFilter = or(
    gt(pollsTable.closingTime, new Date()),
    isNull(pollsTable.closingTime)
);

export class PollStore {
    private static db: NeonHttpDatabase;
    private PAGE_SIZE: number;
    private static instance: PollStore;

    private constructor() {
        this.PAGE_SIZE = 6;
    }

    public static getInstance(db: NeonHttpDatabase): PollStore {
        if (!PollStore.instance) {
            this.db = db;
            PollStore.instance = new PollStore();
        }
        return PollStore.instance;
    }

    private mapToPoll(t: typeof pollsTable.$inferSelect, pollOptions: PollOption[] = []): Poll {
        return {
            ...t,
            id: t.id,
            mediaUrl: t.mediaUrl ?? "",
            userId: t.userId,
            groupId: t.groupId ?? null,
            isMultiVotingAllowed: t.isMultiVotingAllowed ?? false,
            closingTime: t.closingTime?.toISOString() ?? null,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt?.toISOString() ?? null,
            pollOptions
        };
    }

    private mapToPollOption(t: typeof pollsOptionsTable.$inferSelect): PollOption {
        return {
            ...t,
            pollId: String(t.pollId),
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt?.toISOString() ?? null
        };
    }

    public async createPoll(userId: string, question: string, mediaUrl: string | null,
        isMultiVotingAllowed: boolean = false, closingTime: string | null, groupId?: string): Promise<Poll> {

        // Validating the poll
        if (!question.trim() || !userId) {
            throw new Error("Poll validation failed, please check your inputs.");
        }

        const [inserted] = await PollStore.db.insert(pollsTable).values({
            question,
            mediaUrl,
            userId,
            groupId: groupId ?? null,
            isMultiVotingAllowed,
            closingTime: closingTime ? new Date(closingTime) : null
        }).returning();

        return this.mapToPoll(inserted, []);
    }

    public async createPollOption(pollId: string, text: string, mediaUrl: string | null): Promise<PollOption> {
        const [inserted] = await PollStore.db.insert(pollsOptionsTable).values({
            pollId,
            text,
            mediaUrl
        }).returning();

        return this.mapToPollOption(inserted);
    }

    // TODO: fetch only the public group polls or polls of the users the current user is following.
    // Or polls of public profiles.
    public async getPolls(page: number = 1, pageSize: number = this.PAGE_SIZE): Promise<{
        polls: Poll[],
        totalPolls: number
    }> {
        const offset = (page - 1) * pageSize;

        // Fetch the polls with no closing time or closing time is in future.
        const [data, countResult] = await Promise.all([
            db.select().from(pollsTable)
                .where(activePollsFilter)
                .orderBy(desc(pollsTable.createdAt))
                .limit(pageSize)
                .offset(offset),
            db.select({ count: sql<number>`cast(count(*) as integer)` }).from(pollsTable)
        ]);

        const allPolls: Poll[] = [];

        // Populate corresponding options data in each poll 
        for (const poll of data) {
            const pollOptions = await PollStore.db.select().from(pollsOptionsTable)
                .where(eq(pollsOptionsTable.pollId, poll.id));
            allPolls.push(this.mapToPoll(poll, pollOptions.map(this.mapToPollOption)));
        }

        return {
            polls: allPolls,
            totalPolls: countResult[0].count
        };
    }

    // TODO: Update the algorithm to take geographical and demographic 
    // data in consideration.
    public async getTrendingPolls(page: number = 1, pageSize: number = this.PAGE_SIZE) {
        const offset = (page - 1) * pageSize;

        const voteCounts = db
            .select({
                pollId: votesTable.pollId,
                voteCount: sql<number>`count(*)`.as("vote_count"),
            })
            .from(votesTable)
            .groupBy(votesTable.pollId)
            .as("vote_counts");

        const reactionCounts = db
            .select({
                pollId: reactionsTable.pollId,
                reactionCount: sql<number>`count(*)`.as("reaction_count"),
            })
            .from(reactionsTable)
            .groupBy(reactionsTable.pollId)
            .as("reaction_counts");

        const trendingPollsData = await PollStore.db
            .select({
                poll: pollsTable,
                voteCount: sql<number>`coalesce(${voteCounts.voteCount}, 0)`.as("vote_count"),
                reactionCount: sql<number>`coalesce(${reactionCounts.reactionCount}, 0)`.as("reaction_count"),
                trendingScore: sql<number>`
      coalesce(${voteCounts.voteCount}, 0) * 2 +
      coalesce(${reactionCounts.reactionCount}, 0)
    `.as("trending_score"),
            })
            .from(pollsTable)
            .leftJoin(voteCounts, sql`${voteCounts.pollId} = ${pollsTable.id}`)
            .leftJoin(reactionCounts, sql`${reactionCounts.pollId} = ${pollsTable.id}`)
            .where(activePollsFilter)
            .orderBy(
                desc(sql`
      coalesce(${voteCounts.voteCount}, 0) * 2 +
      coalesce(${reactionCounts.reactionCount}, 0)
    `),
                desc(pollsTable.createdAt)
            )
            .limit(pageSize)
            .offset(offset);

        const trendingPolls: Poll[] = [];

        // Populate corresponding options data in each poll 
        for (const poll of trendingPollsData) {
            const pollOptions = await PollStore.db.select().from(pollsOptionsTable)
                .where(eq(pollsOptionsTable.pollId, poll.poll.id));
            trendingPolls.push(this.mapToPoll(poll.poll, pollOptions.map(this.mapToPollOption)));
        }

        return {
            polls: trendingPolls,
            totalPolls: trendingPolls.length
        };
    }

    public async getUserPolls(userId: string, page: number = 1, pageSize: number = this.PAGE_SIZE): Promise<{
        polls: Poll[],
        totalPolls: number
    }> {
        const offset = (page - 1) * pageSize;

        const [data, countResult] = await Promise.all([
            db.select().from(pollsTable).where(eq(pollsTable.userId, userId))
                .orderBy(desc(pollsTable.createdAt))
                .limit(pageSize)
                .offset(offset),
            db.select({ count: sql<number>`cast(count(*) as integer)` }).from(pollsTable)
                .where(eq(pollsTable.userId, userId))
        ]);

        const allPolls: Poll[] = [];

        // Populate corresponding options data in each poll
        for (const poll of data) {
            const pollOptions = await PollStore.db.select().from(pollsOptionsTable)
                .where(eq(pollsOptionsTable.pollId, poll.id));
            allPolls.push(this.mapToPoll(poll, pollOptions.map(this.mapToPollOption)));
        }

        return {
            polls: allPolls,
            totalPolls: countResult[0].count
        };
    }

    public async getPollById(userId: string, pollId: string): Promise<Poll> {
        const [poll] = await PollStore.db.select().from(pollsTable)
            .where(eq(pollsTable.id, pollId));

        if (!poll) {
            throw new Error("Poll not found");
        }

        // Check if user is authorized to view the poll.
        // 1. The profile of the poll's owner is public 
        // 2. OR the user is following the poll's owner
        // 3. OR the poll's group is public (if the poll is in a group)
        // 4. OR the user is a member of the poll's group (if the poll is in a group)
        let isAuthorized = poll.userId === userId;
        if (!isAuthorized) {
            if (!poll.groupId) {
                // 1. Check if the user is following the poll's owner
                const [user] = await PollStore.db.select().from(usersTable)
                    .where(eq(usersTable.id, poll.userId));
                if (user.isPublic) {
                    isAuthorized = true;
                    // 2. OR the user is following the poll's owner
                } else {
                    const [followedUser] = await PollStore.db.select().from(followedUsersTable)
                        .where(and(eq(followedUsersTable.followerId, userId), eq(followedUsersTable.followingId, poll.userId)));
                    if (followedUser) {
                        isAuthorized = true;
                    }
                }
            }
            // 3. Check if the poll's group is public  
            else if (poll.groupId) {
                const [group] = await PollStore.db.select().from(userGroupsTable)
                    .where(eq(userGroupsTable.id, poll.groupId));
                if (group.isPublic) {
                    isAuthorized = true;
                }
                // 4. OR the user is a member of the poll's group
            } else {
                const [groupMember] = await PollStore.db.select().from(groupMembersTable)
                    .where(and(eq(groupMembersTable.groupId, poll.groupId), eq(groupMembersTable.userId, userId)));
                if (groupMember) {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            throw new Error("You are not authorized to view this poll");
        }

        const pollOptions = await PollStore.db.select().from(pollsOptionsTable)
            .where(eq(pollsOptionsTable.pollId, pollId));

        return this.mapToPoll(poll, pollOptions.map(this.mapToPollOption));
    }

    public async votePollOption(userId: string, pollId: string, optionId: number): Promise<boolean> {
        // Check if user has already voted for this poll option.
        const [vote] = await PollStore.db.select().from(votesTable)
            .where(and(eq(votesTable.userId, userId), eq(votesTable.optionId, optionId)));

        if (vote) {
            throw new Error("You have already voted for this poll option.");
        }

        const [poll] = await PollStore.db.select().from(pollsTable)
            .where(eq(pollsTable.id, pollId));

        if (!poll) {
            throw new Error("Poll not found");
        }

        // If it's not a multi-voting poll.
        if (!poll.isMultiVotingAllowed) {
            // Check if user has already voted for this poll.
            const hasUserAlreadyVoted = await this.checkIfUserVoted(userId, pollId)
            if (hasUserAlreadyVoted) {
                throw new Error("You have already voted for this singular poll");
            }
        }

        // Otherwise, user can cast their vote.

        // Add vote to the option.
        await PollStore.db.insert(votesTable).values({
            userId: userId,
            pollId: pollId,
            optionId: optionId
        });

        // Update vote count of the option.
        // This should be an atomic operation. (Handle concurent votes)
        await PollStore.db.update(pollsOptionsTable).set({
            voteCount: sql`${pollsOptionsTable.voteCount} + 1`
        }).where(eq(pollsOptionsTable.id, optionId));

        return true;
    }

    public async deletePoll(userId: string, pollId: string): Promise<boolean> {
        const [fetchedPoll] = await PollStore.db.select().from(pollsTable)
            .where(eq(pollsTable.id, pollId));

        // Check if poll exists.
        if (!fetchedPoll) {
            throw new Error("Poll not found");
        }

        // Check if the user is the owner of the poll.
        if (fetchedPoll.userId !== userId) {
            throw new Error("You are not authorized to delete this poll");
        }

        await PollStore.db.delete(pollsTable).where(eq(pollsTable.id, pollId));
        return true;
    };

    public async checkIfUserVoted(userId: string, pollId: string): Promise<boolean> {
        const [existingVote] = await PollStore.db.select().from(votesTable)
            .where(and(eq(votesTable.userId, userId), eq(votesTable.pollId, pollId)));
        return Boolean(existingVote);
    }

    public async reactToPoll(userId: string, pollId: string, reaction: ReactionType): Promise<boolean> {
        // Delete previous reaction on the poll.
        const existingReaction = await this.getUserReactionOnPoll(userId, pollId);
        if (existingReaction) {
            await PollStore.db.delete(reactionsTable)
                .where(and(eq(reactionsTable.userId, userId), eq(reactionsTable.pollId, pollId)));
        }
        // Add reaction to the poll.
        await PollStore.db.insert(reactionsTable).values({
            userId: userId,
            pollId: pollId,
            reactionType: reaction
        });
        return true;
    }

    public async getUserReactionOnPoll(userId: string, pollId: string): Promise<string | null> {
        const [reaction] = await PollStore.db.select().from(reactionsTable)
            .where(and(eq(reactionsTable.userId, userId), eq(reactionsTable.pollId, pollId)));

        if (!reaction) {
            return null;
        }

        return reaction.reactionType;
    }

    public async reactToPollOption(userId: string, optionId: number, reaction: ReactionType): Promise<boolean> {
        // Delete previous reaction on the poll option.
        const existingReaction = await this.getUserReactionOnPollOption(userId, optionId);
        if (existingReaction) {
            await PollStore.db.delete(reactionsTable)
                .where(and(eq(reactionsTable.userId, userId), eq(reactionsTable.optionId, optionId)));
        }
        // Add reaction to the poll option.
        await PollStore.db.insert(reactionsTable).values({
            userId: userId,
            optionId: optionId,
            reactionType: reaction
        });
        return true;
    }

    public async getUserReactionOnPollOption(userId: string, optionId: number): Promise<string | null> {
        const [reaction] = await PollStore.db.select().from(reactionsTable)
            .where(and(eq(reactionsTable.userId, userId), eq(reactionsTable.optionId, optionId)));

        if (!reaction) {
            return null;
        }

        return reaction.reactionType;
    }
};