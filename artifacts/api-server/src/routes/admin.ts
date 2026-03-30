import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, notificationsTable, settingsTable } from "@workspace/db/schema";
import { eq, desc, count } from "drizzle-orm";

const router = Router();

const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(req: any): boolean {
  if (ADMIN_EMAILS.length === 0) return false;
  const email = (req.user?.email || "").toLowerCase();
  return req.isAuthenticated() && ADMIN_EMAILS.includes(email);
}

async function getMaintenanceSetting(): Promise<boolean> {
  try {
    const row = await db.query.settingsTable.findFirst({
      where: eq(settingsTable.key, "maintenance_mode"),
    });
    return row?.value === "true";
  } catch {
    return false;
  }
}

router.get("/api/maintenance-status", async (req, res) => {
  const maintenance = await getMaintenanceSetting();
  return res.json({ maintenance, isAdmin: isAdmin(req) });
});

router.get("/api/admin/status", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  const maintenance = await getMaintenanceSetting();
  const [userCountRow] = await db.select({ count: count() }).from(usersTable);
  const [notifCountRow] = await db.select({ count: count() }).from(notificationsTable);
  const recentUsers = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      coins: usersTable.coins,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(20);
  return res.json({
    maintenance,
    userCount: Number(userCountRow?.count ?? 0),
    notifCount: Number(notifCountRow?.count ?? 0),
    recentUsers,
  });
});

router.post("/api/admin/maintenance", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  const { enabled } = req.body as { enabled: boolean };
  await db
    .insert(settingsTable)
    .values({ key: "maintenance_mode", value: String(enabled) })
    .onConflictDoUpdate({
      target: settingsTable.key,
      set: { value: String(enabled), updatedAt: new Date() },
    });
  return res.json({ success: true, maintenance: enabled });
});

router.post("/api/admin/notify-all", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  const { type, title, message, link } = req.body as {
    type: string;
    title: string;
    message: string;
    link?: string;
  };
  if (!type || !title || !message) {
    return res.status(400).json({ error: "type, title, and message are required" });
  }
  const users = await db.select({ id: usersTable.id }).from(usersTable);
  if (users.length === 0) return res.json({ success: true, sentTo: 0 });
  await db.insert(notificationsTable).values(
    users.map((u) => ({
      userId: u.id,
      type: type as any,
      title,
      message,
      link: link || null,
    }))
  );
  return res.json({ success: true, sentTo: users.length });
});

export default router;
