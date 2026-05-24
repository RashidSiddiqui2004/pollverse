import { db } from './db';
import { pollsTable, pollsOptionsTable, votesTable, followedUsersTable, groupsTable, groupMembersTable, usersTable } from '../db/schema';
import { desc, sql, eq, and } from 'drizzle-orm';

export interface Poll {
    id: string,
    question: string,
    mediaUrl: string,
    userId: string,
    groupId: string | null,
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

class PollStore {
    private PAGE_SIZE: number;
    private static instance: PollStore;

    private constructor() {
        this.PAGE_SIZE = 6;
    }

    public static getInstance(): PollStore {
        if (!PollStore.instance) {
            PollStore.instance = new PollStore();
        }
        return PollStore.instance;
    }

    private mapToPoll(t: typeof pollsTable.$inferSelect, pollOptions: PollOption[] = []): Poll {
        return {
            ...t,
            id: String(t.id),
            mediaUrl: t.mediaUrl ?? "",
            userId: String(t.userId),
            groupId: t.groupId ? String(t.groupId) : null,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt?.toISOString() ?? null,
            pollOptions: pollOptions
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
        groupId?: string): Promise<Poll> {

        // Validating the poll
        if (!question.trim() || !userId) {
            throw new Error("Poll validation failed, please check your inputs.");
        }

        const [inserted] = await db.insert(pollsTable).values({
            question,
            mediaUrl,
            userId,
            groupId: groupId ?? null
        }).returning();

        return this.mapToPoll(inserted, []);
    }

    public async createPollOption(pollId: string, text: string, mediaUrl: string | null): Promise<PollOption> {
        const [inserted] = await db.insert(pollsOptionsTable).values({
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

        const [data, countResult] = await Promise.all([
            db.select().from(pollsTable)
                .orderBy(desc(pollsTable.createdAt))
                .limit(pageSize)
                .offset(offset),
            db.select({ count: sql<number>`cast(count(*) as integer)` }).from(pollsTable)
        ]);

        const allPolls: Poll[] = [];

        // Populate corresponding options data in each poll 
        for (const poll of data) {
            const pollOptions = await db.select().from(pollsOptionsTable)
                .where(eq(pollsOptionsTable.pollId, poll.id));
            allPolls.push(this.mapToPoll(poll, pollOptions.map(this.mapToPollOption)));
        }

        return {
            polls: allPolls,
            totalPolls: countResult[0].count
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
            const pollOptions = await db.select().from(pollsOptionsTable)
                .where(eq(pollsOptionsTable.pollId, poll.id));
            allPolls.push(this.mapToPoll(poll, pollOptions.map(this.mapToPollOption)));
        }

        return {
            polls: allPolls,
            totalPolls: countResult[0].count
        };
    }

    public async getPollById(userId: string, pollId: string): Promise<Poll> {
        const [poll] = await db.select().from(pollsTable)
            .where(eq(pollsTable.id, pollId));

        if (!poll) {
            throw new Error("Poll not found");
        }

        // Check if user is authorized to view the poll
        // 1. The profile of the poll's owner is public 
        // 2. OR the user is following the poll's owner
        // 3. OR the poll's group is public (if the poll is in a group)
        // 4. OR the user is a member of the poll's group (if the poll is in a group)
        let isAuthorized = poll.userId === userId;
        if (!isAuthorized) {
            if (!poll.groupId) {
                // 1. Check if the user is following the poll's owner
                const [user] = await db.select().from(usersTable)
                    .where(eq(usersTable.id, poll.userId));
                if (user.isPublic) {
                    isAuthorized = true;
                    // 2. OR the user is following the poll's owner
                } else {
                    const [followedUser] = await db.select().from(followedUsersTable)
                        .where(and(eq(followedUsersTable.followerId, userId), eq(followedUsersTable.followingId, poll.userId)));
                    if (followedUser) {
                        isAuthorized = true;
                    }
                }
            }
            // 3. Check if the poll's group is public  
            else if (poll.groupId) {
                const [group] = await db.select().from(groupsTable)
                    .where(eq(groupsTable.id, poll.groupId));
                if (group.isPublic) {
                    isAuthorized = true;
                }
                // 4. OR the user is a member of the poll's group
            } else {
                const [groupMember] = await db.select().from(groupMembersTable)
                    .where(and(eq(groupMembersTable.groupId, poll.groupId), eq(groupMembersTable.userId, userId)));
                if (groupMember) {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            throw new Error("You are not authorized to view this poll");
        }

        const pollOptions = await db.select().from(pollsOptionsTable)
            .where(eq(pollsOptionsTable.pollId, pollId));

        return this.mapToPoll(poll, pollOptions.map(this.mapToPollOption));
    }

    public async votePollOption(userId: string, pollId: string, optionId: number): Promise<boolean> {
        // Check if user has already voted for this poll.
        const [existingVote] = await db.select().from(votesTable)
            .where(and(eq(votesTable.userId, userId), eq(votesTable.pollId, pollId)));
        
        if (Boolean(existingVote)) {
            throw new Error("You have already voted for this poll");
        }

        // Add vote to the option.
        await db.insert(votesTable).values({
            userId: userId,
            pollId: pollId,
            optionId: optionId
        });

        // Update vote count of the option.
        // This should be an atomic operation. (Handle concurent votes)
        await db.update(pollsOptionsTable).set({
            voteCount: sql`${pollsOptionsTable.voteCount} + 1`
        }).where(eq(pollsOptionsTable.id, optionId));

        return true;
    }

    public async deletePoll(userId: string, pollId: string): Promise<boolean> {
        const [fetchedPoll] = await db.select().from(pollsTable)
            .where(eq(pollsTable.id, pollId));

        // check if poll exists
        if (!fetchedPoll) {
            throw new Error("Poll not found");
        }

        // check if the user is the owner of the poll
        if (fetchedPoll.userId !== userId) {
            throw new Error("You are not authorized to delete this poll");
        }

        await db.delete(pollsTable).where(eq(pollsTable.id, pollId));
        return true;
    };

    public async checkIfUserVoted(userId: string, pollId: string): Promise<boolean> {
        const [existingVote] = await db.select().from(votesTable)
            .where(and(eq(votesTable.userId, userId), eq(votesTable.pollId, pollId)));
        return !!existingVote;
    }
};

export const pollStore = PollStore.getInstance();