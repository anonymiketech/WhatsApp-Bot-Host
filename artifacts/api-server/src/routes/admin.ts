import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, notificationsTable, settingsTable, botsTable } from "@workspace/db/schema";
import { eq, desc, count, and } from "drizzle-orm";
import { pterodactyl } from "../services/pterodactyl";

const router = Router();

function isAdmin(req: any): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.length === 0) return false;
  const email = (req.user?.email || "").toLowerCase();
  return req.isAuthenticated() && adminEmails.includes(email);
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

router.get("/maintenance-status", async (req, res) => {
  const maintenance = await getMaintenanceSetting();
  return res.json({ maintenance, isAdmin: isAdmin(req) });
});

router.get("/admin/status", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  const maintenance = await getMaintenanceSetting();
  const [userCountRow] = await db.select({ count: count() }).from(usersTable);
  const [notifCountRow] = await db.select({ count: count() }).from(notificationsTable);
  const [botCountRow] = await db.select({ count: count() }).from(botsTable);
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
    botCount: Number(botCountRow?.count ?? 0),
    recentUsers,
  });
});

router.post("/admin/maintenance", async (req, res) => {
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

router.post("/admin/notify-all", async (req, res) => {
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

// All deployed bots with user info — admin only
router.get("/admin/bots", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });

  const bots = await db
    .select({
      id: botsTable.id,
      name: botsTable.name,
      status: botsTable.status,
      suspended: botsTable.suspended,
      botTypeId: botsTable.botTypeId,
      pterodactylServerId: botsTable.pterodactylServerId,
      coinsPerMonth: botsTable.coinsPerMonth,
      expiresAt: botsTable.expiresAt,
      createdAt: botsTable.createdAt,
      userId: botsTable.userId,
      userEmail: usersTable.email,
      userFirstName: usersTable.firstName,
      userLastName: usersTable.lastName,
    })
    .from(botsTable)
    .leftJoin(usersTable, eq(botsTable.userId, usersTable.id))
    .orderBy(desc(botsTable.createdAt));

  return res.json({
    bots: bots.map((b) => ({
      ...b,
      expiresAt: b.expiresAt ? b.expiresAt.toISOString() : null,
      createdAt: b.createdAt.toISOString(),
    })),
    total: bots.length,
  });
});

// Add/remove coins for a user — admin only
router.post("/admin/users/:id/coins", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  const { id } = req.params;
  const { amount } = req.body as { amount?: number };
  if (typeof amount !== "number") return res.status(400).json({ error: "amount (number) required" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) return res.status(404).json({ error: "User not found" });

  const newCoins = Math.max(0, user.coins + amount);
  const [updated] = await db
    .update(usersTable)
    .set({ coins: newCoins })
    .where(eq(usersTable.id, id))
    .returning();

  return res.json({ success: true, coins: updated.coins });
});

// List Pterodactyl servers — admin only, for verifying panel connection
router.get("/pterodactyl/servers", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  if (!pterodactyl.isConfigured()) {
    return res.status(503).json({ error: "Pterodactyl not configured" });
  }
  try {
    const servers = await pterodactyl.listServers();
    return res.json({ servers, keyType: pterodactyl.isAppKey() ? "application" : "client" });
  } catch (err: any) {
    return res.status(502).json({ error: err?.message ?? "Failed to contact Pterodactyl panel" });
  }
});

// Test power signal on a specific server — admin only
router.post("/pterodactyl/power", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  const { serverId, signal } = req.body as { serverId?: string; signal?: string };
  if (!serverId || !signal) return res.status(400).json({ error: "serverId and signal required" });
  try {
    await pterodactyl.sendPowerSignal(serverId, signal as any);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(502).json({ error: err?.message ?? "Failed to send power signal" });
  }
});

// Suspend or unsuspend a deployed bot instance — admin only
router.put("/admin/bots/:botId/suspend", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });

  const { botId } = req.params;
  const { suspended } = req.body as { suspended?: boolean };
  if (typeof suspended !== "boolean") return res.status(400).json({ error: "suspended (boolean) required" });

  const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, botId));
  if (!bot) return res.status(404).json({ error: "Bot not found" });

  const [updated] = await db
    .update(botsTable)
    .set({ suspended })
    .where(eq(botsTable.id, botId))
    .returning();

  return res.json({ success: true, botId, suspended: updated.suspended });
});

export default router;
