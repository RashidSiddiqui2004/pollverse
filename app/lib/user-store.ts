import { db } from './db';
import { usersTable, followedUsersTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface User {
    id: string;
    name: string;
    userName: string;
    email: string;
    header: string;
    bio: string;
    isPublic: boolean;
    avatarUrl: string;
    onboardingCompleted: boolean;
    createdAt: string;
    updatedAt: string | null;
}

class UserStore {
    private static instance: UserStore;

    private constructor() { }

    public static getInstance(): UserStore {
        if (!UserStore.instance) {
            UserStore.instance = new UserStore();
        }
        return UserStore.instance;
    }

    private mapToUser(t: typeof usersTable.$inferSelect): User {
        return {
            ...t,
            id: String(t.id),
            userName: t.userName ?? "",
            header: t.header ?? "",
            bio: t.bio ?? "",
            avatarUrl: t.avatarUrl ?? "",
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt?.toISOString() ?? null,
        };
    }

    public async createUser(data: {
        name: string;
        userName: string;
        email: string;
        header: string;
        bio: string;
        avatarUrl: string;
        isPublic?: boolean;
    }): Promise<User> {
        if (!data.name.trim() || !data.userName.trim() || !data.email.trim()) {
            throw new Error("Name, username, and email are required fields.");
        }

        const [inserted] = await db.insert(usersTable).values({
            name: data.name,
            userName: data.userName,
            email: data.email,
            header: data.header ?? "",
            bio: data.bio ?? "",
            isPublic: data.isPublic ?? true,
            avatarUrl: data.avatarUrl ?? "",
            onboardingCompleted: false,
        }).returning();

        return this.mapToUser(inserted);
    }

    public async getUserById(userId: string): Promise<User | null> {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
        return user ? this.mapToUser(user) : null;
    }

    public async getUserByUsername(userName: string): Promise<User | null> {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.userName, userName));
        return user ? this.mapToUser(user) : null;
    }

    public async getUserByEmail(email: string): Promise<User | null> {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
        return user ? this.mapToUser(user) : null;
    }

    public async checkIfExistsByEmail(email: string): Promise<boolean> {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
        return Boolean(user);
    }

    public async checkIfExistsByUsername(userName: string): Promise<boolean> {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.userName, userName));
        return Boolean(user);
    }

    public async updateUser(userId: string, data: Partial<{
        name: string;
        userName: string;
        email: string;
        header: string;
        bio: string;
        isPublic: boolean;
    }>): Promise<User> {
        const [updated] = await db.update(usersTable)
            .set({
                ...data,
                updatedAt: new Date()
            })
            .where(eq(usersTable.id, userId))
            .returning();

        if (!updated) {
            throw new Error("User not found.");
        }
        return this.mapToUser(updated);
    }

    public async followUser(followerId: string, followingId: string): Promise<boolean> {
        if (followerId === followingId) {
            throw new Error("Users cannot follow themselves.");
        }

        const [existing] = await db.select().from(followedUsersTable)
            .where(and(
                eq(followedUsersTable.followerId, followerId),
                eq(followedUsersTable.followingId, followingId)
            ));

        if (existing) {
            return true;
        }

        await db.insert(followedUsersTable).values({
            followerId,
            followingId,
        });

        return true;
    }

    public async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
        await db.delete(followedUsersTable)
            .where(and(
                eq(followedUsersTable.followerId, followerId),
                eq(followedUsersTable.followingId, followingId)
            ));
        return true;
    }

    public async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const [follow] = await db.select().from(followedUsersTable)
            .where(and(
                eq(followedUsersTable.followerId, followerId),
                eq(followedUsersTable.followingId, followingId)
            ));
        return Boolean(follow);
    }
}

export const userStore = UserStore.getInstance();
