import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and, like } from "drizzle-orm";

type NotificationType = "info" | "success" | "warning" | "error" | "update";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  try {
    await db.insert(notificationsTable).values({ userId, type, title, message, link });
  } catch (err) {
    console.error("[notify] Failed to create notification:", err);
  }
}

export async function ensureWelcomeNotification(userId: string) {
  try {
    const existing = await db.query.notificationsTable.findFirst({
      where: and(
        eq(notificationsTable.userId, userId),
        like(notificationsTable.title, "%Welcome to ANONYMIKETECH%")
      ),
    });
    if (!existing) {
      await createNotification(
        userId,
        "success",
        "Welcome to ANONYMIKETECH! 🎉",
        "You've received 100 free coins — deploy your first WhatsApp bot and go live in seconds!",
        "/bots"
      );
    }
  } catch (err) {
    console.error("[notify] ensureWelcomeNotification failed:", err);
  }
}
