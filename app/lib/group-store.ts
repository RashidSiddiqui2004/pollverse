import { db } from './db';
import { groupJoinRequestsTable, groupMembersTable, userGroupsTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface UserGroup {
    id: string;
    groupName: string;
    description: string;
    adminId: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string | null;
};

class UserGroupStore {
    private static instance: UserGroupStore;

    private constructor() { }

    public static getInstance(): UserGroupStore {
        if (!UserGroupStore.instance) {
            UserGroupStore.instance = new UserGroupStore();
        }
        return UserGroupStore.instance;
    }

    private mapToUserGroup(t: typeof userGroupsTable.$inferSelect): UserGroup {
        return {
            ...t,
            id: t.id,
            groupName: t.groupName,
            isPublic: t.isPublic,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt?.toISOString() ?? null,
        };
    }

    public async createUserGroup(data: {
        groupName: string;
        description: string;
        adminId: string;
        isPublic?: boolean;
    }): Promise<UserGroup> {
        if (!data.groupName.trim()) {
            throw new Error("Group name is required.");
        }

        const [inserted] = await db.insert(userGroupsTable).values({
            groupName: data.groupName,
            description: data.description,
            adminId: data.adminId,
            isPublic: data.isPublic
        }).returning();

        return this.mapToUserGroup(inserted);
    }

    public async getPublicUserGroups(): Promise<UserGroup[]> {
        const publicUserGroups = await db.select().from(userGroupsTable)
            .where(eq(userGroupsTable.isPublic, true));

        return publicUserGroups.map(this.mapToUserGroup);
    }

    // TODO: Write an algorithm to fetch the most popular user groups
    // on the basis of daily posts, trend in members joining the group,
    // average user retention period, geographical or linguistic basis etc. 
    public async getTrendingUserGroups(){
        
    }

    public async getUserGroupById(groupId: string): Promise<UserGroup> {
        const [userGroup] = await db.select().from(userGroupsTable)
            .where(eq(userGroupsTable.id, groupId));

        if (!userGroup) {
            throw new Error("User group not found!");
        }

        return this.mapToUserGroup(userGroup);
    }

    public async getUserGroupsForUser(userId: string): Promise<UserGroup[]> {
        const userGroupIds = await db.select({
            groupId: groupMembersTable.groupId
        }).from(groupMembersTable)
            .where(eq(groupMembersTable.userId, userId));

        const userGroups: UserGroup[] = [];

        for (const userGroupId of userGroupIds) {
            const [currentGroup] = await db.select().from(userGroupsTable)
                .where(eq(userGroupsTable.id, userGroupId.groupId));
            userGroups.push(this.mapToUserGroup(currentGroup));
        }

        return userGroups;
    }

    public async requestUserGroupJoin(groupId: string, userId: string, note: string | null): Promise<boolean> {
        // Check if the group is public.
        const [userGroup] = await db.select().from(userGroupsTable)
            .where(eq(userGroupsTable.id, groupId));

        if (!userGroup) {
            throw new Error("No user group found!")
        }

        if (userGroup.isPublic) {
            await this.joinUserGroup(groupId, userId);
            return true;
        }
        else {
            // Send join request to group admin.
            await db.insert(groupJoinRequestsTable).values({
                userId,
                groupId,
                note
            });
            return true;
        }
    }

    public async joinUserGroup(groupId: string, userId: string): Promise<boolean> {
        // Check if already a member of the UserGroup.
        const [member] = await db.select().from(groupMembersTable)
            .where(and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.userId, userId)));

        if (Boolean(member)) {
            throw new Error("Already a member!");
        }

        // Add user to the UserGroup
        await db.insert(groupMembersTable).values({
            userId,
            groupId
        });

        return true;
    }

    public async acceptJoinRequest(groupId: string, userId: string, acceptedUserId: string): Promise<boolean> {
        const [userGroup] = await db.select().from(userGroupsTable)
            .where(eq(userGroupsTable.id, groupId));

        if (!userGroup) {
            throw new Error("No user group found!")
        }

        if (userGroup.adminId !== userId) {
            throw new Error("You're not authorized to accept join requests of this group!");
        }

        // Add the member to the group.
        await this.joinUserGroup(groupId, acceptedUserId);

        // Delete the join request of the user for this userGroup.
        await this.deleteJoinRequest(groupId, acceptedUserId);
        return true;
    }

    public async rejectJoinRequest(groupId: string, userId: string, rejectedUserId: string): Promise<boolean> {
        const [userGroup] = await db.select().from(userGroupsTable)
            .where(eq(userGroupsTable.id, groupId));

        if (!userGroup) {
            throw new Error("No user group found!")
        }

        if (userGroup.adminId !== userId) {
            throw new Error("You're not authorized to reject join requests of this group!");
        }

        // Delete the join request of the user for this userGroup.
        await this.deleteJoinRequest(groupId, rejectedUserId);
        return true;
    }

    public async deleteJoinRequest(groupId: string, userId: string): Promise<boolean> {
        const [userGroup] = await db.select().from(userGroupsTable)
            .where(eq(userGroupsTable.id, groupId));

        if (!userGroup) {
            throw new Error("No user group found!")
        }

        await db.delete(groupJoinRequestsTable)
            .where(and(eq(groupJoinRequestsTable.groupId, groupId), eq(groupJoinRequestsTable.userId, userId)));
        return true;
    }
};

export const userGroupStore = UserGroupStore.getInstance();