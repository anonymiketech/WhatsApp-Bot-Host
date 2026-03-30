import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const botsTable = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  sessionId: varchar("session_id").notNull(),
  botTypeId: varchar("bot_type_id"),
  coinsPerMonth: integer("coins_per_month").notNull().default(900),
  status: text("status").notNull().default("stopped"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Bot = typeof botsTable.$inferSelect;
export type InsertBot = typeof botsTable.$inferInsert;
