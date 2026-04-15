import { Router } from "express";
import { db } from "@workspace/db";
import { partnerApplicationsTable } from "@workspace/db/schema";
import { Resend } from "resend";

const router = Router();

const resend = process.env["RESEND_API_KEY"]
  ? new Resend(process.env["RESEND_API_KEY"])
  : null;

const ADMIN_EMAIL = "anonymiketech@gmail.com";
const FROM_EMAIL = "ANONYMIKETECH <noreply@anonymiketech.online>";

async function sendPartnerEmail(type: "reseller" | "developer", data: {
  name: string;
  email: string;
  whatsappNumber?: string;
  experience?: string;
  message?: string;
  githubRepo?: string;
  botName?: string;
  botDescription?: string;
  nodeType?: string;
}) {
  if (!resend) {
    console.warn("[Partners] RESEND_API_KEY not set — skipping email notification");
    return;
  }

  const isReseller = type === "reseller";
  const subject = isReseller
    ? `New Reseller Application — ${data.name}`
    : `New Bot Submission — ${data.botName || data.name}`;

  const html = isReseller ? `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#0a0a0f;color:#e4e4e7;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(0,229,153,0.15);border:1px solid rgba(0,229,153,0.3);display:flex;align-items:center;justify-content:center">
          <span style="color:#00e599;font-weight:900;font-size:14px">A</span>
        </div>
        <span style="font-weight:700;color:#e4e4e7">ANONYMIKETECH</span>
      </div>
      <h2 style="color:#00e599;margin:0 0 8px">New Reseller Partner Application</h2>
      <p style="color:#71717a;margin:0 0 24px;font-size:14px">A new reseller application was just submitted on the platform.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px 8px 0 0;font-size:12px;color:#a1a1aa;width:140px">Name</td><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px;font-weight:600">${data.name}</td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">Email</td><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px"><a href="mailto:${data.email}" style="color:#00e599">${data.email}</a></td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">WhatsApp</td><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px">${data.whatsappNumber || "—"}</td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">Experience</td><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px">${data.experience || "—"}</td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;border-radius:0 0 8px 8px;font-size:12px;color:#a1a1aa">Message</td><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;border-radius:0 0 8px 8px;font-size:14px">${data.message || "—"}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#52525b">Review and respond within 3-5 business days · ANONYMIKETECH Partner Portal</p>
    </div>
  ` : `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#0a0a0f;color:#e4e4e7;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(0,229,153,0.15);border:1px solid rgba(0,229,153,0.3);display:flex;align-items:center;justify-content:center">
          <span style="color:#00e599;font-weight:900;font-size:14px">A</span>
        </div>
        <span style="font-weight:700;color:#e4e4e7">ANONYMIKETECH</span>
      </div>
      <h2 style="color:#8b5cf6;margin:0 0 8px">New Bot Submission</h2>
      <p style="color:#71717a;margin:0 0 24px;font-size:14px">A developer just submitted a bot for marketplace review.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px 8px 0 0;font-size:12px;color:#a1a1aa;width:140px">Submitter</td><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px;font-weight:600">${data.name}</td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">Email</td><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px"><a href="mailto:${data.email}" style="color:#8b5cf6">${data.email}</a></td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">WhatsApp</td><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px">${data.whatsappNumber || "—"}</td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">Bot Name</td><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px;font-weight:600">${data.botName || "—"}</td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">Node Type</td><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px;font-weight:600;color:#8b5cf6">${data.nodeType || "—"}</td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">GitHub Repo</td><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px"><a href="${data.githubRepo}" style="color:#8b5cf6">${data.githubRepo || "—"}</a></td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">Description</td><td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px">${data.botDescription || "—"}</td></tr>
        <tr><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;border-radius:0 0 8px 8px;font-size:12px;color:#a1a1aa">Notes</td><td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;border-radius:0 0 8px 8px;font-size:14px">${data.message || "—"}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#52525b">Review within 3-5 business days · ANONYMIKETECH Developer Portal</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      replyTo: data.email,
      subject,
      html,
    });
  } catch (err) {
    console.error("[Partners] Failed to send Resend email:", err);
  }
}

router.post("/api/partner-applications", async (req, res) => {
  try {
    const { type, name, email, whatsappNumber, githubRepo, botName, botDescription, nodeType, experience, message } = req.body;

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
      .values({ type, name, email, whatsappNumber, githubRepo, botName, botDescription, nodeType, experience, message })
      .returning();

    // Fire and forget — don't block the response
    sendPartnerEmail(type, { name, email, whatsappNumber, githubRepo, botName, botDescription, nodeType, experience, message });

    return res.status(201).json({ success: true, id: application.id });
  } catch (err) {
    console.error("Partner application error:", err);
    return res.status(500).json({ error: "Failed to submit application" });
  }
});

export default router;
