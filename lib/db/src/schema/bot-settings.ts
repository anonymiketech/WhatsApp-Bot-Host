import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const botSettingsTable = pgTable("bot_settings", {
  botTypeId: varchar("bot_type_id").primaryKey(),
  disabled: boolean("disabled").notNull().default(false),
  disableMessage: text("disable_message"),
  sessionLinkOverride: varchar("session_link_override"),
  githubRepoOverride: varchar("github_repo_override"),
  pterodactylServerIdOverride: varchar("pterodactyl_server_id_override"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type BotSettings = typeof botSettingsTable.$inferSelect;
export type InsertBotSettings = typeof botSettingsTable.$inferInsert;
