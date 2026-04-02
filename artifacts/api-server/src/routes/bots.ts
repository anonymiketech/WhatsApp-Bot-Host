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

  // Check if this is the user's very first bot (free offer)
  const existingBots = await db.select({ id: botsTable.id }).from(botsTable).where(eq(botsTable.userId, userId));
  const isFirstBot = existingBots.length === 0;

  if (!isFirstBot && user.coins < coinsPerMonth) {
    res.status(400).json({
      error: `Insufficient coins. You need ${coinsPerMonth} coins for a 30-day subscription.`,
    });
    return;
  }

  // Charge coins only if not the first bot
  if (!isFirstBot) {
    await db.update(usersTable).set({ coins: user.coins - coinsPerMonth }).where(eq(usersTable.id, userId));
  }

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
      // Step 1: Write the user's session key into the server's .env file
      logger.info({ botId: bot.id, pteroServerId }, "Injecting SESSION_ID into server .env");
      await pterodactyl.setEnvVar(pteroServerId, "SESSION_ID", sessionId);

      // Step 2: Start the server
      await pterodactyl.sendPowerSignal(pteroServerId, "start");
      await db.update(botsTable).set({ status: "running" }).where(eq(botsTable.id, bot.id));
      logger.info({ botId: bot.id }, "Pterodactyl server started after session injection");
    } catch (err) {
      logger.error({ err, botId: bot.id }, "Pterodactyl deploy failed (env write or start)");
      await db.update(botsTable).set({ status: "stopped" }).where(eq(botsTable.id, bot.id));
    }
  } else {
    await db.update(botsTable).set({ status: "running" }).where(eq(botsTable.id, bot.id));
  }

  await createNotification(
    userId,
    "success",
    `Bot "${name}" is now live 🚀`,
    isFirstBot
      ? `Your first bot has been deployed for FREE! Subscription active for 30 days. Enjoy your free trial!`
      : `Your WhatsApp bot has been deployed successfully. Subscription active for 30 days (${coinsPerMonth} coins charged).`,
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

// Repo compatibility scanner — public, no auth needed
router.get("/bots/check-repo", async (req, res) => {
  const repoUrl = (req.query.repoUrl as string)?.trim();
  if (!repoUrl) {
    res.status(400).json({ error: "repoUrl query param required" });
    return;
  }

  // Parse GitHub URL → owner/repo
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?\s]+)/i);
  if (!match) {
    res.json({ compatible: false, reason: "Not a GitHub repository URL.", files: [] });
    return;
  }

  const [, owner, repoRaw] = match;
  const repo = repoRaw.replace(/\.git$/, "");

  // Check repo exists & is public via GitHub API
  let defaultBranch = "main";
  try {
    const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "AnonymikeTech-Scanner/1.0" },
    });
    if (!apiRes.ok) {
      const reason = apiRes.status === 404
        ? "Repository not found or is private."
        : `GitHub API returned ${apiRes.status}.`;
      res.json({ compatible: false, reason, files: [] });
      return;
    }
    const apiData = await apiRes.json() as { default_branch?: string; private?: boolean };
    if (apiData.private) {
      res.json({ compatible: false, reason: "Repository is private — panel cannot access it.", files: [] });
      return;
    }
    defaultBranch = apiData.default_branch ?? "main";
  } catch {
    res.json({ compatible: false, reason: "Could not reach GitHub API.", files: [] });
    return;
  }

  // Check for key runtime/deployment files
  const CANDIDATES = [
    { file: "Dockerfile",         label: "Dockerfile",       weight: 3 },
    { file: "docker-compose.yml", label: "docker-compose",   weight: 2 },
    { file: "package.json",       label: "package.json",     weight: 2 },
    { file: "index.js",           label: "index.js",         weight: 1 },
    { file: "index.ts",           label: "index.ts",         weight: 1 },
    { file: "go.mod",             label: "go.mod",           weight: 2 },
    { file: "requirements.txt",   label: "requirements.txt", weight: 2 },
    { file: ".env.example",       label: ".env.example",     weight: 1 },
  ];

  const found: string[] = [];
  let score = 0;

  await Promise.all(
    CANDIDATES.map(async ({ file, label, weight }) => {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${file}`;
      try {
        const r = await fetch(url, { method: "HEAD" });
        if (r.ok) { found.push(label); score += weight; }
      } catch { /* ignore */ }
    })
  );

  const hasDocker    = found.includes("Dockerfile") || found.includes("docker-compose");
  const hasNodeJs    = found.includes("package.json");
  const hasGo        = found.includes("go.mod");
  const hasPython    = found.includes("requirements.txt");
  const compatible   = score >= 2;

  let runtime = "Unknown";
  if (hasDocker)  runtime = "Docker";
  else if (hasNodeJs) runtime = "Node.js";
  else if (hasGo)     runtime = "Go";
  else if (hasPython) runtime = "Python";

  const reason = compatible
    ? `${runtime} project — compatible with Pterodactyl panel deployment.`
    : "No recognizable runtime files found. This bot may not support panel deployment.";

  res.json({ compatible, reason, files: found, runtime, score, repoUrl, owner, repo });
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
