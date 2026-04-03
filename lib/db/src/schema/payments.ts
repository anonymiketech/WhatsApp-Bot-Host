import { sql } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const transactionsTable = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  checkoutRequestId: varchar("checkout_request_id"),
  phone: varchar("phone").notNull(),
  kesAmount: integer("kes_amount").notNull(),
  coinsAmount: integer("coins_amount").notNull(),
  packageName: varchar("package_name").notNull(),
  status: varchar("status").notNull().default("pending"),
  transactionCode: varchar("transaction_code"),
  reference: varchar("reference").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Transaction = typeof transactionsTable.$inferSelect;
export type InsertTransaction = typeof transactionsTable.$inferInsert;
