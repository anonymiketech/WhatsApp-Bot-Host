import { Router } from "express";
import { Resend } from "resend";

const router = Router();

const resend = process.env["RESEND_API_KEY"]
  ? new Resend(process.env["RESEND_API_KEY"])
  : null;

const ADMIN_EMAIL = "anonymiketech@gmail.com";
const FROM_EMAIL = "ANONYMIKETECH <noreply@anonymiketech.online>";

router.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "name, email, subject and message are required" });
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (!resend) {
      console.warn("[Contact] RESEND_API_KEY not set — skipping email notification");
      return res.status(200).json({ success: true });
    }

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#0a0a0f;color:#e4e4e7;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
          <div style="width:32px;height:32px;border-radius:8px;background:rgba(0,229,153,0.15);border:1px solid rgba(0,229,153,0.3);display:flex;align-items:center;justify-content:center">
            <span style="color:#00e599;font-weight:900;font-size:14px">A</span>
          </div>
          <span style="font-weight:700;color:#e4e4e7">ANONYMIKETECH</span>
        </div>
        <h2 style="color:#00e599;margin:0 0 8px">New Contact Message</h2>
        <p style="color:#71717a;margin:0 0 24px;font-size:14px">Someone just sent a message through the contact form.</p>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px 8px 0 0;font-size:12px;color:#a1a1aa;width:120px">Name</td>
            <td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px;font-weight:600">${name}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">Email</td>
            <td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px"><a href="mailto:${email}" style="color:#00e599">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:12px;color:#a1a1aa">Subject</td>
            <td style="padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-top:none;font-size:14px;font-weight:600">${subject}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;border-radius:0 0 8px 8px;font-size:12px;color:#a1a1aa">Message</td>
            <td style="padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-top:none;border-radius:0 0 8px 8px;font-size:14px;white-space:pre-wrap">${message}</td>
          </tr>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#52525b">Received via contact form · ANONYMIKETECH</p>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `Contact: ${subject} — ${name}`,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Contact] Failed to send email:", err);
    return res.status(500).json({ error: "Failed to send message. Please try again." });
  }
});

export default router;
