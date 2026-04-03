import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "../lib/notify";

const router: IRouter = Router();

function userPayload(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
    coins: user.coins,
  };
}

router.get("/users/me", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(userPayload(user));
});

router.put("/users/profile", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { firstName, lastName, profileImageUrl } = req.body as {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (typeof firstName === "string") updates.firstName = firstName.trim().slice(0, 100);
  if (typeof lastName === "string") updates.lastName = lastName.trim().slice(0, 100);
  if (typeof profileImageUrl === "string") {
    // allow data URLs (base64 images) or https URLs or empty string (to remove)
    updates.profileImageUrl = profileImageUrl.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.user!.id))
    .returning();

  await createNotification(
    req.user!.id,
    "success",
    "Profile Updated",
    "Your account information has been successfully updated."
  );

  return res.json(userPayload(updated));
});

router.post("/users/add-coins", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { amount } = req.body;
  if (!amount || typeof amount !== "number" || amount < 1) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  const userId = req.user!.id;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  const [updated] = await db
    .update(usersTable)
    .set({ coins: user.coins + amount })
    .where(eq(usersTable.id, userId))
    .returning();

  return res.json(userPayload(updated));
});

export default router;
