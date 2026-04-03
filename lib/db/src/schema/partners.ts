import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const partnerApplicationsTable = pgTable("partner_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 20 }).notNull(), // "reseller" | "developer"
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  whatsappNumber: varchar("whatsapp_number", { length: 30 }),
  githubRepo: varchar("github_repo", { length: 500 }),
  botName: varchar("bot_name", { length: 255 }),
  botDescription: text("bot_description"),
  experience: text("experience"),
  message: text("message"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PartnerApplication = typeof partnerApplicationsTable.$inferSelect;
export type InsertPartnerApplication = typeof partnerApplicationsTable.$inferInsert;
