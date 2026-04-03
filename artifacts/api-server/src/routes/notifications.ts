import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ensureWelcomeNotification } from "../lib/notify";

const router = Router();

router.get("/notifications", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user!.id;
  await ensureWelcomeNotification(userId);
  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
  const unreadCount = rows.filter((n) => !n.read).length;
  return res.json({ notifications: rows, unreadCount });
});

router.post("/notifications/read-all", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user!.id;
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, userId));
  return res.json({ success: true });
});

router.delete("/notifications/delete-all", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user!.id;
  await db.delete(notificationsTable).where(eq(notificationsTable.userId, userId));
  return res.json({ success: true });
});

router.post("/notifications/:id/read", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user!.id;
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.id, req.params.id), eq(notificationsTable.userId, userId)));
  return res.json({ success: true });
});

router.delete("/notifications/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user!.id;
  await db
    .delete(notificationsTable)
    .where(and(eq(notificationsTable.id, req.params.id), eq(notificationsTable.userId, userId)));
  return res.json({ success: true });
});

export default router;
