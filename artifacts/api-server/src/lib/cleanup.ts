import { db, usersTable, emailVerificationsTable } from "@workspace/db";
import { and, lt, eq, isNull, ne } from "drizzle-orm";
import { sendWarningEmail } from "./email";

const UNVERIFIED_TTL_HOURS = 24;
const WARN_DAYS  = 14;
const DELETE_DAYS = 16;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

export async function runCleanup(): Promise<void> {
  console.log("[CLEANUP] Running cleanup job…");
  const now = new Date();

  try {
    await db
      .delete(emailVerificationsTable)
      .where(lt(emailVerificationsTable.expiresAt, now));

    const deletedUnverified = await db
      .delete(usersTable)
      .where(
        and(
          eq(usersTable.emailVerified, false),
          lt(usersTable.createdAt, hoursAgo(UNVERIFIED_TTL_HOURS)),
          isNull(usersTable.replitId),
          isNull(usersTable.githubId),
          isNull(usersTable.googleId),
        ),
      )
      .returning({ id: usersTable.id, email: usersTable.email });

    for (const u of deletedUnverified) {
      console.log(`[CLEANUP] Deleted unverified account: ${u.email ?? u.id}`);
    }

    const warnCandidates = await db.query.usersTable.findMany({
      where: and(
        eq(usersTable.emailVerified, true),
        eq(usersTable.warningSent, false),
        lt(usersTable.lastActiveAt, daysAgo(WARN_DAYS)),
        ne(usersTable.emailVerified, false),
      ),
      columns: { id: true, email: true, firstName: true, profileImageUrl: true },
    });

    for (const user of warnCandidates) {
      if (!user.email) continue;
      try {
        await sendWarningEmail(user.email, user.firstName, user.profileImageUrl);
        await db
          .update(usersTable)
          .set({ warningSent: true })
          .where(eq(usersTable.id, user.id));
        console.log(`[CLEANUP] Warning email sent to ${user.email}`);
      } catch (err) {
        console.error(`[CLEANUP] Failed to send warning to ${user.email}:`, err);
      }
    }

    const deletedIdle = await db
      .delete(usersTable)
      .where(
        and(
          eq(usersTable.emailVerified, true),
          lt(usersTable.lastActiveAt, daysAgo(DELETE_DAYS)),
          isNull(usersTable.replitId),
          isNull(usersTable.githubId),
          isNull(usersTable.googleId),
        ),
      )
      .returning({ id: usersTable.id, email: usersTable.email });

    for (const u of deletedIdle) {
      console.log(`[CLEANUP] Deleted idle account (${DELETE_DAYS}+ days): ${u.email ?? u.id}`);
    }

    console.log(
      `[CLEANUP] Done — ${deletedUnverified.length} unverified, ` +
      `${warnCandidates.length} warned, ${deletedIdle.length} idle deleted.`,
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[CLEANUP] Skipped — database unavailable: ${msg.split("\n")[0]}`);
  }
}

export function scheduleCleanup(intervalHours = 1): void {
  runCleanup().catch(() => {});
  setInterval(() => runCleanup().catch(() => {}), intervalHours * 60 * 60 * 1000);
}
