import { db, usersTable, emailVerificationsTable } from "@workspace/db";
import { and, lt, eq, isNull, or } from "drizzle-orm";
import { sql } from "drizzle-orm";

const UNVERIFIED_TTL_HOURS = 24;
const IDLE_DAYS = 90;

export async function runCleanup(): Promise<void> {
  const now = new Date();

  const unverifiedCutoff = new Date(now.getTime() - UNVERIFIED_TTL_HOURS * 60 * 60 * 1000);
  const idleCutoff = new Date(now.getTime() - IDLE_DAYS * 24 * 60 * 60 * 1000);

  await db
    .delete(emailVerificationsTable)
    .where(lt(emailVerificationsTable.expiresAt, now));

  const deletedUnverified = await db
    .delete(usersTable)
    .where(
      and(
        eq(usersTable.emailVerified, false),
        lt(usersTable.createdAt, unverifiedCutoff),
        isNull(usersTable.replitId),
        isNull(usersTable.githubId),
        isNull(usersTable.googleId),
      ),
    )
    .returning({ id: usersTable.id });

  const deletedIdle = await db
    .delete(usersTable)
    .where(
      and(
        lt(usersTable.lastActiveAt, idleCutoff),
        isNull(usersTable.replitId),
        isNull(usersTable.githubId),
        isNull(usersTable.googleId),
      ),
    )
    .returning({ id: usersTable.id });

  if (deletedUnverified.length > 0 || deletedIdle.length > 0) {
    console.log(
      `[CLEANUP] Removed ${deletedUnverified.length} unverified + ${deletedIdle.length} idle accounts`,
    );
  }
}

export function scheduleCleanup(intervalHours = 6): void {
  runCleanup().catch(console.error);
  setInterval(() => runCleanup().catch(console.error), intervalHours * 60 * 60 * 1000);
}
