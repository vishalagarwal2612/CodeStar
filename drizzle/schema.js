import { relations } from "drizzle-orm";
import { boolean, int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const UserTable = mysqlTable("Users", {
    id : int().autoincrement().primaryKey(),
    username : varchar({length : 50}).notNull().unique(),
    email : varchar({length : 255}).notNull().unique(),
    password : varchar({length : 255}).notNull(),
    createdAt : timestamp("created_at").defaultNow()
});

export const SubmissionTable = mysqlTable("Submissions", {
    id : int().autoincrement().primaryKey(),
    user_id : int().notNull().references(() => UserTable.id, { onDelete: 'cascade' }),
    topic : varchar({length : 50}).notNull(),
    problem_number : int().notNull(),
    submittedAt : timestamp("submitted_at").defaultNow()
});

export const SessionTable = mysqlTable("Sessions",{
    id : int().autoincrement().primaryKey(),
    user_id : int().notNull().references(() => UserTable.id , {onDelete : "cascade"}),
    valid : boolean().default(true).notNull(),
    userAgent : text("user_agent"),
    ip : varchar({length : 255}),
    createdAt : timestamp("created_at").defaultNow().notNull(),
    updatedAt : timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});

export const UserRelations = relations(UserTable, ({ many }) => ({
    submissions: many(SubmissionTable),
}));

export const SubmissionRelations = relations(SubmissionTable, ({ one }) => ({
    user: one(UserTable, {
        fields: [SubmissionTable.user_id],
        references: [UserTable.id],
    }),
}));

export const SessionRelation = relations(SessionTable,({one}) => ({
    user : one(UserTable,{
        fields : [SessionTable.user_id],
        references : [UserTable.id]
    })
}));