import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";

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
