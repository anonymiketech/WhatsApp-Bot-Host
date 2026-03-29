import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/users/me", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
    coins: user.coins,
  });
});

router.post("/users/add-coins", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { amount } = req.body;
  if (!amount || typeof amount !== "number" || amount < 1) {
    res.status(400).json({ error: "amount must be a positive number" });
    return;
  }

  const userId = req.user.id;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ coins: user.coins + amount })
    .where(eq(usersTable.id, userId))
    .returning();

  res.json({
    id: updated.id,
    email: updated.email ?? null,
    firstName: updated.firstName ?? null,
    lastName: updated.lastName ?? null,
    profileImageUrl: updated.profileImageUrl ?? null,
    coins: updated.coins,
  });
});

export default router;
