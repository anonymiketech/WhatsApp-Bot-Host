import { Router } from "express";
import { db } from "@workspace/db";
import { partnerApplicationsTable } from "@workspace/db/schema";

const router = Router();

router.post("/api/partner-applications", async (req, res) => {
  try {
    const { type, name, email, whatsappNumber, githubRepo, botName, botDescription, experience, message } = req.body;

    if (!type || !name || !email) {
      return res.status(400).json({ error: "type, name and email are required" });
    }
    if (!["reseller", "developer"].includes(type)) {
      return res.status(400).json({ error: "type must be 'reseller' or 'developer'" });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (type === "developer" && !githubRepo) {
      return res.status(400).json({ error: "GitHub repo URL is required for developer submissions" });
    }

    const [application] = await db
      .insert(partnerApplicationsTable)
      .values({ type, name, email, whatsappNumber, githubRepo, botName, botDescription, experience, message })
      .returning();

    return res.status(201).json({ success: true, id: application.id });
  } catch (err) {
    console.error("Partner application error:", err);
    return res.status(500).json({ error: "Failed to submit application" });
  }
});

export default router;
