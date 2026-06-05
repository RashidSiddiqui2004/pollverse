import { describe, it, expect } from '@jest/globals';
import { testdb } from '@/app/lib/test-db';
import { UserStore } from '@/app/lib/user-store';

describe('user store', () => {
    let store: UserStore = UserStore.getInstance(testdb);

    const user1Data = {
        name: "Rashid Siddiqui",
        userName: "rashidsiddiqui",
        email: "rashidsiddiqui@gmail.com",
        header: "Software developer @ MNC",
        bio: "",
        avatarUrl: ""
    }

    const user2Data = {
        name: "John Doe",
        userName: "johndoe",
        email: "johndoe@gmail.com",
        header: "Software developer @ MNC",
        bio: "",
        avatarUrl: ""
    }

    it('should create user with given details', async () => {
        const user = await store.createUser(user1Data);

        expect(user.name).toBe(user1Data.name);

        // cleanup
        await store.deleteUser(user.id);
    });

    it('should return false for non-existing email', async () => {
        const mail = user1Data.email;

        const isuserfound = await store.checkIfExistsByEmail(mail);

        expect(isuserfound).toBe(false);
    });

    it('should return true for non-existing email', async () => {
        const user = await store.createUser(user1Data);
        const isuserfound = await store.checkIfExistsByEmail(user.email);

        expect(isuserfound).toBe(true);
        
        // cleanup
        await store.deleteUser(user.id);
    });

    it('should update user details correctly', async () => {
        const user = await store.createUser(user1Data);
        const userId = user.id;
        const updatedUser = await store.updateUser(userId, {
            isPublic: false
        });

        expect(updatedUser.isPublic).toBe(false);

        // cleanup
        await store.deleteUser(userId);
    });

    it('should follow user', async () => {
        const user1 = await store.createUser(user1Data);
        const user2 = await store.createUser(user2Data);

        const user1Id = user1.id;
        const user2Id = user2.id;

        await store.followUser(user1Id, user2Id);

        const isFollowing = await store.isFollowing(user1Id, user2Id);
        expect(isFollowing).toBe(true)

        // cleanup
        await store.deleteUser(user1Id);
        await store.deleteUser(user2Id);
    });

    it('should unfollow user', async () => {
        const user1 = await store.createUser(user1Data);
        const user2 = await store.createUser(user2Data);

        const user1Id = user1.id;
        const user2Id = user2.id;

        await store.followUser(user1Id, user2Id);
        await store.unfollowUser(user1Id, user2Id);

        const isFollowing = await store.isFollowing(user1Id, user2Id);
        expect(isFollowing).toBe(false)

        // cleanup
        await store.deleteUser(user1Id);
        await store.deleteUser(user2Id);
    });
});