import { Resend } from "resend";

const NOREPLY = "ANONYMIKETECH <noreply@anonymiketech.online>";
const INFO    = "ANONYMIKETECH <info@anonymiketech.online>";
const YEAR    = new Date().getFullYear();

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const baseHtml = (body: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#111113;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden">
        <tr><td style="height:3px;background:linear-gradient(to right,#00e599,#22d3ee);padding:0"></td></tr>
        <tr><td style="padding:36px 36px 0">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td width="40" style="vertical-align:middle">
                <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,229,153,0.1);border:1px solid rgba(0,229,153,0.25);text-align:center;line-height:36px;font-size:18px">🤖</div>
              </td>
              <td style="vertical-align:middle;padding-left:10px">
                <span style="font-weight:900;letter-spacing:0.15em;font-size:13px;color:#a1a1aa;text-transform:uppercase">ANONYMIKETECH</span>
              </td>
            </tr>
          </table>
          ${body}
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06)">
          <p style="color:#52525b;font-size:11px;margin:0;text-align:center">
            © ${YEAR} ANONYMIKETECH · WhatsApp Bot Hosting Platform
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const client = getClient();
  const html = baseHtml(`
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px">Verify your account</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px">
      Use the code below to verify your email address. It expires in <strong style="color:#e4e4e7">5 minutes</strong>.
    </p>
    <div style="text-align:center;margin-bottom:24px">
      <div style="display:inline-block;background:#0d0d0f;border:1px solid rgba(0,229,153,0.35);border-radius:14px;padding:18px 44px">
        <span style="font-size:38px;font-weight:900;letter-spacing:0.3em;color:#00e599;font-family:monospace">${code}</span>
      </div>
    </div>
    <p style="color:#71717a;font-size:12px;line-height:1.6;margin:0 0 28px">
      If you didn't create an account, you can safely ignore this email.
    </p>
  `);

  if (!client) {
    console.log(`[EMAIL] No RESEND_API_KEY — verification code for ${to}: ${code}`);
    return;
  }

  await client.emails.send({
    from: NOREPLY,
    to,
    subject: `${code} — Verify your ANONYMIKETECH account`,
    html,
    text: `Your ANONYMIKETECH verification code is: ${code}\n\nIt expires in 5 minutes.\n\nIf you did not create an account, ignore this email.`,
  });
}

export async function sendWarningEmail(to: string, firstName?: string | null): Promise<void> {
  const client = getClient();
  const name = firstName ? ` ${firstName}` : "";
  const html = baseHtml(`
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px">Your account is inactive</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 20px">
      Hi${name}, we noticed you haven't logged in for <strong style="color:#facc15">14 days</strong>.
    </p>
    <div style="background:rgba(250,204,21,0.06);border:1px solid rgba(250,204,21,0.25);border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="color:#fde047;font-size:14px;font-weight:700;margin:0 0 6px">⚠️ Account deletion warning</p>
      <p style="color:#a1a1aa;font-size:13px;margin:0;line-height:1.6">
        Your account will be <strong style="color:#f87171">permanently deleted in 2 days</strong> if you don't log in.
        All your data, bots, and coin balance will be lost.
      </p>
    </div>
    <div style="text-align:center;margin-bottom:28px">
      <a href="https://anonymiketech.online/dashboard"
         style="display:inline-block;background:#00e599;color:#000;font-weight:800;font-size:14px;padding:12px 32px;border-radius:10px;text-decoration:none">
        Log In Now →
      </a>
    </div>
    <p style="color:#71717a;font-size:12px;line-height:1.6;margin:0 0 28px">
      If you no longer need this account, no action is required — it will be removed automatically.
    </p>
  `);

  if (!client) {
    console.log(`[EMAIL] No RESEND_API_KEY — warning email would be sent to ${to}`);
    return;
  }

  await client.emails.send({
    from: INFO,
    to,
    subject: "⚠️ Your ANONYMIKETECH account will be deleted in 2 days",
    html,
    text: `Hi${name},\n\nYour ANONYMIKETECH account has been inactive for 14 days.\n\nYour account will be permanently deleted in 2 days if you don't log in.\n\nLog in now: https://anonymiketech.online/dashboard\n\nIf you no longer need this account, no action is required.`,
  });
}
