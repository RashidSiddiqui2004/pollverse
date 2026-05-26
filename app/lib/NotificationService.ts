import { db } from './db';
import { groupJoinRequestsTable, groupMembersTable, userGroupsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface UserGroupJoinRequest {
    userId: string;
    groupId: string;
    note: string | null;
    createdAt: string;
    updatedAt: string | null;
};

class NotificationService {
    private static instance: NotificationService;

    private constructor() { }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private mapToUserGroupJoinRequest(t: typeof groupJoinRequestsTable.$inferSelect): UserGroupJoinRequest {
            return {
                ...t,
                userId: t.userId,
                groupId: t.groupId,
                note: t.note,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt?.toISOString() ?? null,
            };
        }

    public async getNewNotificationsForAdmin(userId: string, groupId: string): Promise<UserGroupJoinRequest[]> {
        const [group] = await db.select().from(userGroupsTable)
            .where(eq(userGroupsTable.id, groupId));

        if (!group) {
            throw new Error("No group found!");
        }

        if (group.adminId !== userId) {
            throw new Error("You're not authorized to view join requests of this group!");
        }

        const joinRequests = await db.select().from(groupJoinRequestsTable)
            .where(eq(groupJoinRequestsTable.groupId, groupId));

        return joinRequests.map(this.mapToUserGroupJoinRequest);
    }
};

export const notificationService = NotificationService.getInstance();