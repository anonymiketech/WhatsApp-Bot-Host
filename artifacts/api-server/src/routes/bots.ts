import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { botsTable, usersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { botEngine } from "../services/botEngine";
import { sql } from "drizzle-orm";
import { createNotification } from "../lib/notify";

const router: IRouter = Router();

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function normalizeBotResponse(bot: typeof botsTable.$inferSelect, coinsOverride?: number) {
  return {
    id: bot.id,
    name: bot.name,
    status: bot.status,
    botTypeId: bot.botTypeId ?? null,
    coinsPerMonth: coinsOverride ?? bot.coinsPerMonth,
    expiresAt: bot.expiresAt ? bot.expiresAt.toISOString() : null,
    createdAt: bot.createdAt.toISOString(),
  };
}

// Deploy a bot — charge coins for 30 days and start it
router.post("/bots", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name, sessionId, botType, coinsPerDay } = req.body as {
    name?: string;
    sessionId?: string;
    botType?: string;
    coinsPerDay?: number;
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

  const [bot] = await db
    .insert(botsTable)
    .values({
      id: sql`gen_random_uuid()` as unknown as string,
      userId,
      name,
      sessionId,
      botTypeId: botType ?? null,
      coinsPerMonth,
      status: "running",
      expiresAt,
    })
    .returning();

  await botEngine.startBot(bot.id, sessionId).catch(() => {});

  await createNotification(
    userId,
    "success",
    `Bot "${name}" is now live 🚀`,
    `Your WhatsApp bot has been deployed successfully. Subscription active for 30 days (${coinsPerMonth} coins charged).`,
    "/dashboard"
  );

  res.status(201).json({ bot: normalizeBotResponse(bot) });
});

router.get("/bots/my-bots", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user!.id;
  const bots = await db.select().from(botsTable).where(eq(botsTable.userId, userId));

  res.json({ bots: bots.map((b) => normalizeBotResponse(b)) });
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

  // Extend from today or from existing expiry, whichever is later
  const baseDate = bot.expiresAt && bot.expiresAt > new Date() ? bot.expiresAt : new Date();
  const newExpiresAt = new Date(baseDate.getTime() + THIRTY_DAYS_MS);

  const [updatedBot] = await db
    .update(botsTable)
    .set({ status: "running", expiresAt: newExpiresAt })
    .where(eq(botsTable.id, botId))
    .returning();

  await botEngine.startBot(botId, bot.sessionId).catch(() => {});

  await createNotification(
    userId,
    "success",
    `Bot "${bot.name}" renewed ✅`,
    `Your subscription has been extended by 30 days. New expiry: ${newExpiresAt.toLocaleDateString()}.`,
    "/dashboard"
  );

  res.json({ bot: normalizeBotResponse(updatedBot) });
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

  // Check subscription is still valid
  if (!bot.expiresAt || bot.expiresAt <= new Date()) {
    res.status(400).json({ error: "Subscription expired. Please renew your bot to continue." });
    return;
  }

  const [updatedBot] = await db
    .update(botsTable)
    .set({ status: "running" })
    .where(eq(botsTable.id, botId))
    .returning();

  await botEngine.startBot(botId, bot.sessionId).catch(() => {});

  res.json({ bot: normalizeBotResponse(updatedBot) });
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

  await botEngine.stopBot(botId);

  const [updatedBot] = await db
    .update(botsTable)
    .set({ status: "stopped" })
    .where(eq(botsTable.id, botId))
    .returning();

  res.json({ bot: normalizeBotResponse(updatedBot) });
});

// Legacy save-session (kept for backward compat, now just saves without charging)
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
