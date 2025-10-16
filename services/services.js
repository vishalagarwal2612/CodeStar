import { SubmissionTable, UserTable } from "../drizzle/schema.js";
import { db } from "../database/drizzle.js";
import { and, eq, count } from "drizzle-orm";

export const WriteRecord = async (user_id, topic, problem_index) => {
    const [NewRecord] = await db.insert(SubmissionTable).values({user_id : user_id, topic : topic, problem_number : problem_index});
    return NewRecord;
};

export const GetRecords = async (user_id, topic) => {
    const Records = await db.select().from(SubmissionTable).where(and(eq(SubmissionTable.user_id, user_id), eq(SubmissionTable.topic, topic)));
    return Records;
};

export const DeleteSubmissions = async (user_id, topic) => {
    await db.delete(SubmissionTable).where(and(eq(SubmissionTable.user_id, user_id), eq(SubmissionTable.topic, topic)));
};

export const GetAllRecords = async () => {
  const Records = await db.select({
    username: UserTable.username,
    totalSolved: count(SubmissionTable.problem_number)
  })
  .from(UserTable)
  .leftJoin(SubmissionTable, eq(SubmissionTable.user_id, UserTable.id))
  .groupBy(UserTable.id);
  return Records;
};

