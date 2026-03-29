import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { botsTable, usersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { botEngine } from "../services/botEngine";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/bots/save-session", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name, sessionId } = req.body;

  if (!name || !sessionId) {
    res.status(400).json({ error: "name and sessionId are required" });
    return;
  }

  const userId = req.user.id;

  const [bot] = await db
    .insert(botsTable)
    .values({
      id: sql`gen_random_uuid()` as unknown as string,
      userId,
      name,
      sessionId,
      status: "stopped",
    })
    .returning();

  res.status(201).json({
    bot: {
      id: bot.id,
      name: bot.name,
      status: bot.status,
      coins: 50,
      expiresAt: bot.expiresAt ? bot.expiresAt.toISOString() : null,
      createdAt: bot.createdAt.toISOString(),
    },
  });
});

router.get("/bots/my-bots", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;
  const bots = await db.select().from(botsTable).where(eq(botsTable.userId, userId));

  res.json({
    bots: bots.map((bot) => ({
      id: bot.id,
      name: bot.name,
      status: bot.status,
      coins: 50,
      expiresAt: bot.expiresAt ? bot.expiresAt.toISOString() : null,
      createdAt: bot.createdAt.toISOString(),
    })),
  });
});

router.post("/bots/start-bot", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { botId } = req.body;
  if (!botId) {
    res.status(400).json({ error: "botId is required" });
    return;
  }

  const userId = req.user.id;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (user.coins < 50) {
    res.status(400).json({ error: "Insufficient coins. You need at least 50 coins to start a bot." });
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

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db
    .update(usersTable)
    .set({ coins: user.coins - 50 })
    .where(eq(usersTable.id, userId));

  const [updatedBot] = await db
    .update(botsTable)
    .set({ status: "running", expiresAt })
    .where(eq(botsTable.id, botId))
    .returning();

  await botEngine.startBot(botId, bot.sessionId);

  res.json({
    bot: {
      id: updatedBot.id,
      name: updatedBot.name,
      status: updatedBot.status,
      coins: 50,
      expiresAt: updatedBot.expiresAt ? updatedBot.expiresAt.toISOString() : null,
      createdAt: updatedBot.createdAt.toISOString(),
    },
  });
});

router.post("/bots/stop-bot", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { botId } = req.body;
  if (!botId) {
    res.status(400).json({ error: "botId is required" });
    return;
  }

  const userId = req.user.id;

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
    .set({ status: "stopped", expiresAt: null })
    .where(eq(botsTable.id, botId))
    .returning();

  res.json({
    bot: {
      id: updatedBot.id,
      name: updatedBot.name,
      status: updatedBot.status,
      coins: 50,
      expiresAt: null,
      createdAt: updatedBot.createdAt.toISOString(),
    },
  });
});

export default router;
