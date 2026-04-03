import { logger } from "../lib/logger";
import { db, botsTable } from "@workspace/db";
import { eq, and, lt } from "drizzle-orm";

interface BotInstance {
  sessionId: string;
  socket?: unknown;
  stopped: boolean;
}

const runningBots: Record<string, BotInstance> = {};

async function startBot(botId: string, sessionId: string): Promise<void> {
  if (runningBots[botId]) {
    await stopBot(botId);
  }

  runningBots[botId] = { sessionId, stopped: false };
  logger.info({ botId, sessionId: "[hidden]" }, "Bot started");

  connectBot(botId, sessionId);
}

async function connectBot(botId: string, sessionId: string): Promise<void> {
  try {
    const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = await import(
      "@whiskeysockets/baileys"
    );

    const { state, saveCreds } = await useMultiFileAuthState(`./bot-sessions/${botId}`);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: logger.child({ botId }),
    });

    if (runningBots[botId]) {
      runningBots[botId].socket = sock;
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update: { connection?: string; lastDisconnect?: { error?: { output?: { statusCode?: number } } } }) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as { output?: { statusCode?: number } })?.output?.statusCode !==
          DisconnectReason.loggedOut;

        logger.info({ botId, shouldReconnect }, "Bot connection closed");

        if (shouldReconnect && runningBots[botId] && !runningBots[botId].stopped) {
          setTimeout(() => connectBot(botId, sessionId), 5000);
        }
      } else if (connection === "open") {
        logger.info({ botId }, "Bot connected to WhatsApp");
      }
    });
  } catch (err) {
    logger.error({ err, botId }, "Failed to connect bot");
  }
}

async function stopBot(botId: string): Promise<void> {
  const instance = runningBots[botId];
  if (instance) {
    instance.stopped = true;
    if (instance.socket) {
      try {
        const sock = instance.socket as { end?: (err?: Error) => void };
        sock?.end?.();
      } catch (err) {
        logger.warn({ err, botId }, "Error closing bot socket");
      }
    }
    delete runningBots[botId];
    logger.info({ botId }, "Bot stopped");
  }
}

async function autoStopExpiredBots(): Promise<void> {
  const now = new Date();
  const expiredBots = await db
    .select()
    .from(botsTable)
    .where(and(eq(botsTable.status, "running"), lt(botsTable.expiresAt, now)));

  for (const bot of expiredBots) {
    await stopBot(bot.id);
    await db
      .update(botsTable)
      .set({ status: "stopped", expiresAt: null })
      .where(eq(botsTable.id, bot.id));
    logger.info({ botId: bot.id }, "Auto-stopped expired bot");
  }
}

setInterval(autoStopExpiredBots, 60 * 1000);

export const botEngine = { startBot, stopBot };
