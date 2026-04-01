import { Resend } from "resend";

const NOREPLY = "ANONYMIKETECH <noreply@anonymiketech.online>";
const INFO    = "ANONYMIKETECH <info@anonymiketech.online>";
const YEAR    = new Date().getFullYear();
const LOGO_URL = "https://bots.anonymiketech.online/images/opengraph.jpg";

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function avatar(src: string | null | undefined, name: string | null | undefined, size = 48): string {
  if (src) {
    return `<img src="${src}" alt="${name ?? "User"}" width="${size}" height="${size}"
      style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:2px solid rgba(0,229,153,0.4);display:block;" />`;
  }
  const initials = (name ?? "U")[0].toUpperCase();
  return `
    <div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,rgba(0,229,153,0.25),rgba(34,211,238,0.25));
      border:2px solid rgba(0,229,153,0.4);display:flex;align-items:center;justify-content:center;
      font-size:${Math.round(size * 0.4)}px;font-weight:900;color:#00e599;text-align:center;line-height:${size}px;">
      ${initials}
    </div>`;
}

const shell = (body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>ANONYMIKETECH</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background:#09090b;min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
        style="max-width:500px;background:#111113;border:1px solid rgba(255,255,255,0.08);border-radius:18px;overflow:hidden;">

        <!-- Top accent bar (gradient via two-cell trick for email clients) -->
        <tr>
          <td style="height:3px;background:linear-gradient(90deg,#00e599 0%,#22d3ee 50%,#00e599 100%);padding:0;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="40" style="vertical-align:middle;">
                  <img src="${LOGO_URL}" alt="ANONYMIKETECH" width="36" height="36"
                    style="width:36px;height:36px;border-radius:10px;border:1px solid rgba(0,229,153,0.3);display:block;" />
                </td>
                <td style="vertical-align:middle;padding-left:10px;">
                  <span style="font-size:11px;font-weight:900;letter-spacing:0.18em;color:#71717a;text-transform:uppercase;">ANONYMIKETECH</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px 32px 28px;">
            ${body}
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="height:1px;background:rgba(255,255,255,0.06);font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;color:#3f3f46;">
              © ${YEAR} ANONYMIKETECH · WhatsApp Bot Hosting Platform
            </p>
            <p style="margin:0;font-size:10px;color:#27272a;">
              <a href="https://bots.anonymiketech.online" style="color:#3f3f46;text-decoration:none;">bots.anonymiketech.online</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
  <!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`;

/* ─── Verification Email ──────────────────────────────────────────────────── */

export async function sendVerificationEmail(
  to: string,
  code: string,
  name?: string | null,
  profileImageUrl?: string | null,
): Promise<void> {
  const client = getClient();
  const displayName = name ? `, ${name}` : "";

  const codeDigits = code.split("").map(d =>
    `<td style="width:44px;height:52px;text-align:center;vertical-align:middle;
       background:#0d0d10;border:1px solid rgba(0,229,153,0.3);border-radius:10px;
       font-size:26px;font-weight:900;color:#00e599;font-family:monospace;letter-spacing:0;
       padding:0 2px;">${d}</td>
     <td style="width:6px;font-size:0;line-height:0;padding:0;">&nbsp;</td>`
  ).join("");

  const body = `
    <!-- Greeting row with avatar -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="vertical-align:middle;padding-right:14px;width:52px;">
          ${avatar(profileImageUrl, name)}
        </td>
        <td style="vertical-align:middle;">
          <h1 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#f4f4f5;line-height:1.2;">
            Hey${displayName}! Verify your email
          </h1>
          <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
            Enter this code in the app to activate your account.
          </p>
        </td>
      </tr>
    </table>

    <!-- Code box -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"
      style="margin:0 auto 20px;background:rgba(0,229,153,0.04);border:1px solid rgba(0,229,153,0.15);border-radius:14px;padding:20px 24px;">
      <tr>
        <td align="center">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#52525b;text-transform:uppercase;">
            Your verification code
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>${codeDigits}</tr>
          </table>
          <p style="margin:14px 0 0;font-size:11px;color:#52525b;">
            ⏱ Expires in <strong style="color:#a1a1aa;">5 minutes</strong>
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA hint -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;margin-bottom:20px;">
      <tr>
        <td style="padding:12px 16px;">
          <p style="margin:0;font-size:12px;color:#71717a;line-height:1.6;">
            💡 <strong style="color:#a1a1aa;">Tip:</strong> You can paste the code directly into the 6-digit input — no need to type each digit.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:11px;color:#52525b;line-height:1.6;">
      Didn't create an account? You can safely ignore this email. This code will expire automatically.
    </p>`;

  if (!client) {
    console.log(`[EMAIL] No RESEND_API_KEY — verification code for ${to}: ${code}`);
    return;
  }

  await client.emails.send({
    from: NOREPLY,
    to,
    subject: `${code} — Your ANONYMIKETECH verification code`,
    html: shell(body),
    text: `Hi${displayName},\n\nYour ANONYMIKETECH verification code is: ${code}\n\nIt expires in 5 minutes.\n\nIf you didn't create an account, ignore this email.`,
  });
}

/* ─── Warning Email ───────────────────────────────────────────────────────── */

export async function sendWarningEmail(
  to: string,
  firstName?: string | null,
  profileImageUrl?: string | null,
): Promise<void> {
  const client = getClient();
  const name = firstName ?? null;
  const displayName = name ? `, ${name}` : "";

  const body = `
    <!-- Greeting row with avatar -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="vertical-align:middle;padding-right:14px;width:52px;">
          ${avatar(profileImageUrl, name)}
        </td>
        <td style="vertical-align:middle;">
          <h1 style="margin:0 0 4px;font-size:20px;font-weight:800;color:#f4f4f5;line-height:1.2;">
            Hey${displayName}, your account is inactive
          </h1>
          <p style="margin:0;font-size:13px;color:#71717a;line-height:1.5;">
            We haven't seen you in a while — just a heads up.
          </p>
        </td>
      </tr>
    </table>

    <!-- Warning banner -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:rgba(250,204,21,0.06);border:1px solid rgba(250,204,21,0.25);border-radius:12px;margin-bottom:20px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#fde047;">⚠️ Account deletion warning</p>
          <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">
            Your ANONYMIKETECH account has been inactive for <strong style="color:#fde047;">14 days</strong>.
            It will be <strong style="color:#f87171;">permanently deleted in 2 days</strong> if you don't log in.
            All your bots, data, and coin balance will be lost.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px;">
      <tr>
        <td align="center" style="border-radius:12px;background:#00e599;">
          <a href="https://bots.anonymiketech.online/dashboard"
            style="display:inline-block;padding:13px 40px;font-size:14px;font-weight:800;color:#000000;text-decoration:none;border-radius:12px;letter-spacing:0.01em;">
            Log In Now →
          </a>
        </td>
      </tr>
    </table>

    <!-- What you'd lose -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;margin-bottom:20px;">
      <tr>
        <td style="padding:14px 18px;">
          <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;color:#52525b;text-transform:uppercase;">What you'll lose if deleted</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding:3px 0;font-size:12px;color:#71717a;">🤖 All deployed WhatsApp bots</td>
              <td style="padding:3px 0;font-size:12px;color:#71717a;">💰 Remaining coin balance</td>
            </tr>
            <tr>
              <td style="padding:3px 0;font-size:12px;color:#71717a;">📊 Bot history & sessions</td>
              <td style="padding:3px 0;font-size:12px;color:#71717a;">⚙️ Account settings & data</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:11px;color:#52525b;line-height:1.6;">
      If you no longer need this account, no action is required — it will be removed automatically in 2 days.
    </p>`;

  if (!client) {
    console.log(`[EMAIL] No RESEND_API_KEY — warning email would be sent to ${to}`);
    return;
  }

  await client.emails.send({
    from: INFO,
    to,
    subject: "⚠️ Your ANONYMIKETECH account will be deleted in 2 days",
    html: shell(body),
    text: `Hi${displayName},\n\nYour ANONYMIKETECH account has been inactive for 14 days.\n\nIt will be permanently deleted in 2 days if you don't log in.\n\nLog in now: https://bots.anonymiketech.online/dashboard\n\nIf you no longer need this account, no action is required.`,
  });
}
