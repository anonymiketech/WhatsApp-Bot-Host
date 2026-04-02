import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { botSettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function isAdmin(req: any): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (adminEmails.length === 0) return false;
  return req.isAuthenticated() && adminEmails.includes((req.user?.email || "").toLowerCase());
}

// Public — returns minimal per-bot settings for all bots (disable state + session format hint)
router.get("/bots/catalog-settings", async (_req, res) => {
  const rows = await db.select().from(botSettingsTable);
  const map: Record<string, {
    disabled: boolean;
    disableMessage: string | null;
    sessionFormat: string | null;
    sessionEnvKey: string | null;
  }> = {};
  for (const r of rows) {
    map[r.botTypeId] = {
      disabled: r.disabled,
      disableMessage: r.disableMessage ?? null,
      sessionFormat: r.sessionFormat ?? null,
      sessionEnvKey: r.sessionEnvKey ?? null,
    };
  }
  res.json({ settings: map });
});

// Admin — full settings for all bots
router.get("/admin/bot-settings", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
  const rows = await db.select().from(botSettingsTable);
  return res.json({ settings: rows });
});

// Admin — upsert settings for a single bot type
router.put("/admin/bot-settings/:botTypeId", async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });

  const { botTypeId } = req.params;
  const {
    disabled,
    disableMessage,
    sessionLinkOverride,
    githubRepoOverride,
    pterodactylServerIdOverride,
    notes,
    sessionEnvKey,
    sessionFormat,
    envTemplate,
    autoSetup,
    configFilePath,
    configFileFormat,
  } = req.body as {
    disabled?: boolean;
    disableMessage?: string | null;
    sessionLinkOverride?: string | null;
    githubRepoOverride?: string | null;
    pterodactylServerIdOverride?: string | null;
    notes?: string | null;
    sessionEnvKey?: string | null;
    sessionFormat?: string | null;
    envTemplate?: string | null;
    autoSetup?: boolean;
    configFilePath?: string | null;
    configFileFormat?: string | null;
  };

  const values: Record<string, unknown> = { botTypeId, updatedAt: new Date() };
  if (typeof disabled === "boolean")              values.disabled = disabled;
  if (disableMessage !== undefined)               values.disableMessage = disableMessage || null;
  if (sessionLinkOverride !== undefined)          values.sessionLinkOverride = sessionLinkOverride || null;
  if (githubRepoOverride !== undefined)           values.githubRepoOverride = githubRepoOverride || null;
  if (pterodactylServerIdOverride !== undefined)  values.pterodactylServerIdOverride = pterodactylServerIdOverride || null;
  if (notes !== undefined)                        values.notes = notes || null;
  if (sessionEnvKey !== undefined)                values.sessionEnvKey = sessionEnvKey || "SESSION_ID";
  if (sessionFormat !== undefined)                values.sessionFormat = sessionFormat || null;
  if (envTemplate !== undefined)                  values.envTemplate = envTemplate || null;
  if (typeof autoSetup === "boolean")             values.autoSetup = autoSetup;
  if (configFilePath !== undefined)               values.configFilePath = configFilePath || "/home/container/.env";
  if (configFileFormat !== undefined)             values.configFileFormat = configFileFormat || "env";

  const [row] = await db
    .insert(botSettingsTable)
    .values({ botTypeId, ...values } as any)
    .onConflictDoUpdate({ target: botSettingsTable.botTypeId, set: values as any })
    .returning();

  return res.json({ setting: row });
});

export default router;
