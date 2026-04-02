import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { botsTable, usersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { createNotification } from "../lib/notify";
import { pterodactyl, type PteroStatus } from "../services/pterodactyl";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Map pterodactyl states to our UI-friendly statuses
function mapPteroStatus(s: PteroStatus | null): string {
  if (!s) return "stopped";
  return s; // "running" | "stopped" | "starting" | "stopping"
}

function normalizeBotResponse(
  bot: typeof botsTable.$inferSelect,
  liveStatus?: string,
) {
  return {
    id: bot.id,
    name: bot.name,
    status: liveStatus ?? bot.status,
    botTypeId: bot.botTypeId ?? null,
    pterodactylServerId: bot.pterodactylServerId ?? null,
    coinsPerMonth: bot.coinsPerMonth,
    expiresAt: bot.expiresAt ? bot.expiresAt.toISOString() : null,
    createdAt: bot.createdAt.toISOString(),
  };
}

async function getLiveStatus(bot: typeof botsTable.$inferSelect): Promise<string> {
  if (!bot.pterodactylServerId || !pterodactyl.isConfigured()) {
    return bot.status;
  }
  try {
    const s = await pterodactyl.getServerStatus(bot.pterodactylServerId);
    return mapPteroStatus(s);
  } catch (err) {
    logger.warn({ err, botId: bot.id }, "Failed to get live Pterodactyl status");
    return bot.status;
  }
}

// Deploy a bot — charge coins for 30 days and start it
router.post("/bots", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name, sessionId, botType, coinsPerDay, pterodactylServerId } = req.body as {
    name?: string;
    sessionId?: string;
    botType?: string;
    coinsPerDay?: number;
    pterodactylServerId?: string;
  };

  if (!name || !sessionId) {
    res.status(400).json({ error: "name and sessionId are required" });
    return;
  }

  const perDay = typeof coinsPerDay === "number" && coinsPerDay > 0 ? coinsPerDay : 30;
  const coinsPerMonth = perDay * 30;

  const userId = req.user!.id;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (user.coins < coinsPerMonth) {
    res.status(400).json({
      error: `Insufficient coins. You need ${coinsPerMonth} coins for a 30-day subscription.`,
    });
    return;
  }

  await db.update(usersTable).set({ coins: user.coins - coinsPerMonth }).where(eq(usersTable.id, userId));

  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);
  const pteroServerId = pterodactylServerId ?? null;

  const [bot] = await db
    .insert(botsTable)
    .values({
      id: sql`gen_random_uuid()` as unknown as string,
      userId,
      name,
      sessionId,
      botTypeId: botType ?? null,
      pterodactylServerId: pteroServerId,
      coinsPerMonth,
      status: "starting",
      expiresAt,
    })
    .returning();

  // Start on Pterodactyl if server ID provided
  if (pteroServerId && pterodactyl.isConfigured()) {
    try {
      await pterodactyl.sendPowerSignal(pteroServerId, "start");
      await db.update(botsTable).set({ status: "running" }).where(eq(botsTable.id, bot.id));
    } catch (err) {
      logger.error({ err, botId: bot.id }, "Pterodactyl start failed on deploy");
      await db.update(botsTable).set({ status: "stopped" }).where(eq(botsTable.id, bot.id));
    }
  } else {
    await db.update(botsTable).set({ status: "running" }).where(eq(botsTable.id, bot.id));
  }

  await createNotification(
    userId,
    "success",
    `Bot "${name}" is now live 🚀`,
    `Your WhatsApp bot has been deployed successfully. Subscription active for 30 days (${coinsPerMonth} coins charged).`,
    "/dashboard"
  );

  const fresh = await db.query.botsTable.findFirst({ where: eq(botsTable.id, bot.id) });
  res.status(201).json({ bot: normalizeBotResponse(fresh!) });
});

router.get("/bots/my-bots", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user!.id;
  const bots = await db.select().from(botsTable).where(eq(botsTable.userId, userId));

  // Fetch live statuses from Pterodactyl in parallel
  const botsWithStatus = await Promise.all(
    bots.map(async (b) => normalizeBotResponse(b, await getLiveStatus(b)))
  );

  res.json({ bots: botsWithStatus });
});

// Renew a bot subscription for another 30 days
router.post("/bots/renew", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { botId } = req.body as { botId?: string };
  if (!botId) {
    res.status(400).json({ error: "botId is required" });
    return;
  }

  const userId = req.user!.id;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [bot] = await db
    .select()
    .from(botsTable)
    .where(and(eq(botsTable.id, botId), eq(botsTable.userId, userId)));

  if (!bot) {
    res.status(404).json({ error: "Bot not found" });
    return;
  }

  if (user.coins < bot.coinsPerMonth) {
    res.status(400).json({
      error: `Insufficient coins. You need ${bot.coinsPerMonth} coins to renew for 30 days.`,
    });
    return;
  }

  await db.update(usersTable).set({ coins: user.coins - bot.coinsPerMonth }).where(eq(usersTable.id, userId));

  const baseDate = bot.expiresAt && bot.expiresAt > new Date() ? bot.expiresAt : new Date();
  const newExpiresAt = new Date(baseDate.getTime() + THIRTY_DAYS_MS);

  const [updatedBot] = await db
    .update(botsTable)
    .set({ status: "starting", expiresAt: newExpiresAt })
    .where(eq(botsTable.id, botId))
    .returning();

  // Start on Pterodactyl
  if (bot.pterodactylServerId && pterodactyl.isConfigured()) {
    try {
      await pterodactyl.sendPowerSignal(bot.pterodactylServerId, "start");
      await db.update(botsTable).set({ status: "running" }).where(eq(botsTable.id, botId));
    } catch (err) {
      logger.error({ err, botId }, "Pterodactyl start failed on renew");
      await db.update(botsTable).set({ status: "stopped" }).where(eq(botsTable.id, botId));
    }
  } else {
    await db.update(botsTable).set({ status: "running" }).where(eq(botsTable.id, botId));
  }

  await createNotification(
    userId,
    "success",
    `Bot "${bot.name}" renewed ✅`,
    `Your subscription has been extended by 30 days. New expiry: ${newExpiresAt.toLocaleDateString()}.`,
    "/dashboard"
  );

  const fresh = await db.query.botsTable.findFirst({ where: eq(botsTable.id, botId) });
  res.json({ bot: normalizeBotResponse(fresh!, await getLiveStatus(fresh!)) });
});

router.post("/bots/start-bot", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { botId } = req.body as { botId?: string };
  if (!botId) {
    res.status(400).json({ error: "botId is required" });
    return;
  }

  const userId = req.user!.id;
  const [bot] = await db
    .select()
    .from(botsTable)
    .where(and(eq(botsTable.id, botId), eq(botsTable.userId, userId)));

  if (!bot) {
    res.status(404).json({ error: "Bot not found" });
    return;
  }

  if (!bot.expiresAt || bot.expiresAt <= new Date()) {
    res.status(400).json({ error: "Subscription expired. Please renew your bot to continue." });
    return;
  }

  await db.update(botsTable).set({ status: "starting" }).where(eq(botsTable.id, botId));

  if (bot.pterodactylServerId && pterodactyl.isConfigured()) {
    try {
      await pterodactyl.sendPowerSignal(bot.pterodactylServerId, "start");
      await db.update(botsTable).set({ status: "running" }).where(eq(botsTable.id, botId));
    } catch (err) {
      logger.error({ err, botId }, "Pterodactyl start-bot failed");
      await db.update(botsTable).set({ status: "stopped" }).where(eq(botsTable.id, botId));
      res.status(502).json({ error: "Failed to start bot on panel. Try again." });
      return;
    }
  } else {
    await db.update(botsTable).set({ status: "running" }).where(eq(botsTable.id, botId));
  }

  const fresh = await db.query.botsTable.findFirst({ where: eq(botsTable.id, botId) });
  res.json({ bot: normalizeBotResponse(fresh!, await getLiveStatus(fresh!)) });
});

router.post("/bots/stop-bot", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { botId } = req.body as { botId?: string };
  if (!botId) {
    res.status(400).json({ error: "botId is required" });
    return;
  }

  const userId = req.user!.id;
  const [bot] = await db
    .select()
    .from(botsTable)
    .where(and(eq(botsTable.id, botId), eq(botsTable.userId, userId)));

  if (!bot) {
    res.status(404).json({ error: "Bot not found" });
    return;
  }

  await db.update(botsTable).set({ status: "stopping" }).where(eq(botsTable.id, botId));

  if (bot.pterodactylServerId && pterodactyl.isConfigured()) {
    try {
      await pterodactyl.sendPowerSignal(bot.pterodactylServerId, "stop");
    } catch (err) {
      logger.error({ err, botId }, "Pterodactyl stop-bot failed");
      res.status(502).json({ error: "Failed to stop bot on panel. Try again." });
      return;
    }
  }

  const [updatedBot] = await db
    .update(botsTable)
    .set({ status: "stopped" })
    .where(eq(botsTable.id, botId))
    .returning();

  res.json({ bot: normalizeBotResponse(updatedBot) });
});

router.post("/bots/restart-bot", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { botId } = req.body as { botId?: string };
  if (!botId) {
    res.status(400).json({ error: "botId is required" });
    return;
  }

  const userId = req.user!.id;
  const [bot] = await db
    .select()
    .from(botsTable)
    .where(and(eq(botsTable.id, botId), eq(botsTable.userId, userId)));

  if (!bot) {
    res.status(404).json({ error: "Bot not found" });
    return;
  }

  if (!bot.expiresAt || bot.expiresAt <= new Date()) {
    res.status(400).json({ error: "Subscription expired. Renew before restarting." });
    return;
  }

  if (!bot.pterodactylServerId || !pterodactyl.isConfigured()) {
    res.status(400).json({ error: "This bot is not linked to a Pterodactyl server." });
    return;
  }

  await db.update(botsTable).set({ status: "starting" }).where(eq(botsTable.id, botId));

  try {
    await pterodactyl.sendPowerSignal(bot.pterodactylServerId, "restart");
    await db.update(botsTable).set({ status: "running" }).where(eq(botsTable.id, botId));
  } catch (err) {
    logger.error({ err, botId }, "Pterodactyl restart-bot failed");
    await db.update(botsTable).set({ status: "stopped" }).where(eq(botsTable.id, botId));
    res.status(502).json({ error: "Failed to restart bot on panel. Try again." });
    return;
  }

  const fresh = await db.query.botsTable.findFirst({ where: eq(botsTable.id, botId) });
  res.json({ bot: normalizeBotResponse(fresh!, await getLiveStatus(fresh!)) });
});

// Legacy save-session (kept for backward compat)
router.post("/bots/save-session", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name, sessionId } = req.body as { name?: string; sessionId?: string };
  if (!name || !sessionId) {
    res.status(400).json({ error: "name and sessionId are required" });
    return;
  }

  const [bot] = await db
    .insert(botsTable)
    .values({
      id: sql`gen_random_uuid()` as unknown as string,
      userId: req.user!.id,
      name,
      sessionId,
      status: "stopped",
    })
    .returning();

  res.status(201).json({ bot: normalizeBotResponse(bot) });
});

export default router;
