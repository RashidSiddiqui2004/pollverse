import { db } from './db';
import { UserStore } from "./user-store";
import { PollStore } from "./poll-store";
import { UserGroupStore } from './group-store';

export const userStore = UserStore.getInstance(db);
export const pollStore = PollStore.getInstance(db);
export const userGroupStore = UserGroupStore.getInstance(db);