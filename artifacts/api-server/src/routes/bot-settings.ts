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

// Public — returns minimal per-bot settings (disabled + message only) for all bots
router.get("/bots/catalog-settings", async (_req, res) => {
  const rows = await db.select().from(botSettingsTable);
  const map: Record<string, { disabled: boolean; disableMessage: string | null }> = {};
  for (const r of rows) {
    map[r.botTypeId] = { disabled: r.disabled, disableMessage: r.disableMessage ?? null };
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
  } = req.body as {
    disabled?: boolean;
    disableMessage?: string | null;
    sessionLinkOverride?: string | null;
    githubRepoOverride?: string | null;
    pterodactylServerIdOverride?: string | null;
    notes?: string | null;
  };

  const values: Record<string, unknown> = { botTypeId, updatedAt: new Date() };
  if (typeof disabled === "boolean")              values.disabled = disabled;
  if (disableMessage !== undefined)               values.disableMessage = disableMessage || null;
  if (sessionLinkOverride !== undefined)          values.sessionLinkOverride = sessionLinkOverride || null;
  if (githubRepoOverride !== undefined)           values.githubRepoOverride = githubRepoOverride || null;
  if (pterodactylServerIdOverride !== undefined)  values.pterodactylServerIdOverride = pterodactylServerIdOverride || null;
  if (notes !== undefined)                        values.notes = notes || null;

  const [row] = await db
    .insert(botSettingsTable)
    .values({ botTypeId, ...values } as any)
    .onConflictDoUpdate({ target: botSettingsTable.botTypeId, set: values as any })
    .returning();

  return res.json({ setting: row });
});

export default router;
