import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as dotenv from 'dotenv';
dotenv.config();

const testsql = neon(process.env.TEST_DATABASE_URL!);
export const testdb: NeonHttpDatabase = drizzle(testsql);