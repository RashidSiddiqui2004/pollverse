import { integer, pgTable, timestamp, varchar, boolean, pgEnum, uuid, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

const timestamps = {
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp(),
};

export const reactionTypeEnum = pgEnum("reaction_type", ["funny", "like", "love", "insightful", "support"]);

const usersTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    userName: varchar({ length: 100 }).unique(),
    // age: integer().notNull(),
    header: varchar({ length: 255 }).default(""),
    bio: varchar({ length: 455 }).default(""),
    isPublic: boolean().default(true).notNull(),
    avatarUrl: varchar({ length: 1000 }).default(""),
    onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
    ...timestamps
});

// A user can follow another user
const followedUsersTable = pgTable("followed_users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    followerId: uuid("follower_id").notNull().references(() => usersTable.id),
    followingId: uuid("following_id").notNull().references(() => usersTable.id),
    ...timestamps
});

const pollsTable = pgTable("polls", {
    id: uuid("id").primaryKey().defaultRandom(),
    question: varchar({ length: 500 }).notNull(),
    mediaUrl: varchar({ length: 1000 }),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    groupId: uuid("group_id").references(() => groupsTable.id),
    isMultiVotingAllowed: boolean().default(false),
    ...timestamps
});

const pollsOptionsTable = pgTable("polls_options", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    text: varchar({ length: 255 }).notNull(),
    mediaUrl: varchar({ length: 1000 }),
    pollId: uuid("poll_id").notNull().references(() => pollsTable.id),
    voteCount: integer().default(0).notNull(),
    ...timestamps
});

// User can cast their vote on a poll.
const votesTable = pgTable("votes", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    pollId: uuid("poll_id").notNull().references(() => pollsTable.id),
    optionId: integer().notNull().references(() => pollsOptionsTable.id),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    ...timestamps
});

// User can react either on a poll or on a poll option.
const reactionsTable = pgTable("reactions", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    pollId: uuid("poll_id").references(() => pollsTable.id),
    optionId: integer().references(() => pollsOptionsTable.id),
    reactionType: reactionTypeEnum("reaction_type").notNull(),
    ...timestamps
});

// Groups - Users can create groups and other users can join them. 
// Each group has one admin and many members. 
const groupsTable = pgTable("groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    groupName: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 400 }).notNull(),
    adminId: uuid("admin_id").notNull().references(() => usersTable.id),
    isPublic: boolean().default(true).notNull(),
    ...timestamps
});

const groupMembersTable = pgTable("group_members", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    groupId: uuid("group_id").notNull().references(() => groupsTable.id),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    ...timestamps
});

// TODO: Add a feature to allow users to request to join groups
const groupJoinRequestsTable = pgTable("group_join_requests", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    groupId: uuid("group_id").notNull().references(() => groupsTable.id),
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    note: varchar({ length: 255 }), // optional note by the user who wants to join
    ...timestamps
});

const usersRelations = relations(usersTable, ({ many }) => ({
    polls: many(pollsTable),
    votes: many(votesTable),
    reactions: many(reactionsTable),
    followers: many(followedUsersTable, { relationName: "follower" }),
    following: many(followedUsersTable, { relationName: "following" }),
    administeredGroups: many(groupsTable, { relationName: "groupAdmin" }),
    groupMemberships: many(groupMembersTable),
}));

const followedUsersRelations = relations(followedUsersTable, ({ one }) => ({
    follower: one(usersTable, {
        fields: [followedUsersTable.followerId],
        references: [usersTable.id],
        relationName: "follower"
    }),
    following: one(usersTable, {
        fields: [followedUsersTable.followingId],
        references: [usersTable.id],
        relationName: "following"
    })
}));

const groupsRelations = relations(groupsTable, ({ many, one }) => ({
    admin: one(usersTable, {
        fields: [groupsTable.adminId],
        references: [usersTable.id],
        relationName: "groupAdmin"
    }),
    members: many(groupMembersTable)
}));

const groupMembersRelations = relations(groupMembersTable, ({ one }) => ({
    group: one(groupsTable, {
        fields: [groupMembersTable.groupId],
        references: [groupsTable.id]
    }),
    user: one(usersTable, {
        fields: [groupMembersTable.userId],
        references: [usersTable.id]
    })
}));

const groupJoinRequestsRelations = relations(groupJoinRequestsTable, ({ one }) => ({
    group: one(groupsTable, {
        fields: [groupJoinRequestsTable.groupId],
        references: [groupsTable.id]
    }),
    user: one(usersTable, {
        fields: [groupJoinRequestsTable.userId],
        references: [usersTable.id]
    })
}));

const pollsRelations = relations(
    pollsTable, ({ many, one }) => ({
        author: one(usersTable, {
            fields: [pollsTable.userId],
            references: [usersTable.id]
        }),
        options: many(pollsOptionsTable),
        votes: many(votesTable),
        reactions: many(reactionsTable),
        group: one(groupsTable, {
            fields: [pollsTable.groupId],
            references: [groupsTable.id]
        })
    })
);

const pollOptionsRelations = relations(
    pollsOptionsTable, ({ one, many }) => ({
        poll: one(pollsTable, {
            fields: [pollsOptionsTable.pollId],
            references: [pollsTable.id]
        }),
        votes: many(votesTable),
        reactions: many(reactionsTable)
    })
);

const reactionsRelations = relations(reactionsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [reactionsTable.userId],
        references: [usersTable.id]
    }),
    poll: one(pollsTable, {
        fields: [reactionsTable.pollId],
        references: [pollsTable.id]
    }),
    option: one(pollsOptionsTable, {
        fields: [reactionsTable.optionId],
        references: [pollsOptionsTable.id]
    })
}));

const votesRelations = relations(votesTable, ({ one }) => ({
    poll: one(pollsTable, {
        fields: [votesTable.pollId],
        references: [pollsTable.id]
    }),
    option: one(pollsOptionsTable, {
        fields: [votesTable.optionId],
        references: [pollsOptionsTable.id]
    }),
    user: one(usersTable, {
        fields: [votesTable.userId],
        references: [usersTable.id]
    })
}));

export {
    usersTable,
    pollsTable,
    pollsOptionsTable,
    votesTable,
    reactionsTable,
    followedUsersTable,
    groupsTable,
    groupMembersTable,
    groupJoinRequestsTable,
    usersRelations,
    pollsRelations,
    pollOptionsRelations,
    reactionsRelations,
    votesRelations,
    followedUsersRelations,
    groupsRelations,
    groupMembersRelations,
    groupJoinRequestsRelations
};
