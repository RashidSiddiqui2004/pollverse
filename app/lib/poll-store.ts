import { db } from './db';
import { pollsTable, pollsOptionsTable, followedUsersTable, groupsTable, groupMembersTable } from '../db/schema';
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
    id: string,
    pollId: string,
    text: string,
    mediaUrl: string | null,
    createdAt: string,
    updatedAt: string | null
};

export interface PollOptionWithCounts extends PollOption {
    voteCount: number;
    percentage: number;
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
            id: String(t.id),
            pollId: String(t.pollId),
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt?.toISOString() ?? null
        };
    }

    public async createPoll(userId: string, question: string,
        mediaUrl: string | null, options: string[], groupId?: string): Promise<Poll> {

        // Validating the poll
        // 1. Question must not be empty.
        // 2. User ID must not be empty.
        // 3. Options must not be empty and must be at least 2.
        if (!question.trim() || !options || !userId || options.length <= 1) {
            throw new Error("Poll validation failed, please check your inputs.");
        }

        const [inserted] = await db.insert(pollsTable).values({
            question,
            mediaUrl,
            userId,
            groupId: groupId ?? null
        }).returning();

        const pollOptions = await db.insert(pollsOptionsTable).values(options.map(option => ({
            pollId: inserted.id,
            text: option
        }))).returning();

        return this.mapToPoll(inserted, pollOptions.map(this.mapToPollOption));
    }

    // TODO: fetch only the public group polls or polls of the users the current user is following
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
        // User can the poll only if
        // 1. The profile of the poll's owner is public 
        // 2. OR the user is following the poll's owner
        // 3. OR the poll's group is public (if the poll is in a group)
        // 4. OR the user is a member of the poll's group (if the poll is in a group)
        let isAuthorized = poll.userId === userId;
        if (!isAuthorized) {
            // 1. Check if the user is following the poll's owner
            if (!poll.groupId) {
                const [followedUser] = await db.select().from(followedUsersTable)
                    .where(and(eq(followedUsersTable.followerId, userId), eq(followedUsersTable.followingId, poll.userId)));
                if (followedUser) {
                    isAuthorized = true;
                }
            }
            // 2. Check if the poll's group is public  
            else if (poll.groupId) {
                const [group] = await db.select().from(groupsTable)
                    .where(eq(groupsTable.id, poll.groupId));
                if (group.isPublic) {
                    isAuthorized = true;
                }
                // 3. OR the user is a member of the poll's group
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
};

export const pollStore = PollStore.getInstance();