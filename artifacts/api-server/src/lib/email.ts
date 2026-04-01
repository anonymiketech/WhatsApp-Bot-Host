import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM = () =>
  process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@anonymiketech.online";

export async function sendVerificationEmail(
  to: string,
  code: string,
): Promise<void> {
  const transport = createTransport();

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#111113;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden">
        <tr>
          <td style="height:3px;background:linear-gradient(to right,#00e599,#22d3ee);padding:0"></td>
        </tr>
        <tr><td style="padding:36px 36px 0">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
            <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,229,153,0.1);border:1px solid rgba(0,229,153,0.25);display:inline-flex;align-items:center;justify-content:center">
              <span style="font-size:18px">🤖</span>
            </div>
            <span style="font-weight:900;letter-spacing:0.15em;font-size:13px;color:#a1a1aa;text-transform:uppercase">ANONYMIKETECH</span>
          </div>
          <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px">Verify your email</h1>
          <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 28px">
            Use the code below to verify your email address. It expires in <strong style="color:#e4e4e7">15 minutes</strong>.
          </p>
          <div style="text-align:center;margin-bottom:28px">
            <div style="display:inline-block;background:#0d0d0f;border:1px solid rgba(0,229,153,0.3);border-radius:14px;padding:20px 40px">
              <span style="font-size:36px;font-weight:900;letter-spacing:0.25em;color:#00e599;font-family:monospace">${code}</span>
            </div>
          </div>
          <p style="color:#71717a;font-size:12px;line-height:1.6;margin:0 0 28px">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid rgba(255,255,255,0.06)">
          <p style="color:#52525b;font-size:11px;margin:0;text-align:center">
            © ${new Date().getFullYear()} ANONYMIKETECH · WhatsApp Bot Hosting Platform
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  if (!transport) {
    console.log(`[EMAIL] No SMTP configured — verification code for ${to}: ${code}`);
    return;
  }

  await transport.sendMail({
    from: `"ANONYMIKETECH" <${FROM()}>`,
    to,
    subject: `${code} — Your ANONYMIKETECH verification code`,
    html,
    text: `Your ANONYMIKETECH verification code is: ${code}\n\nIt expires in 15 minutes.\n\nIf you did not create an account, ignore this email.`,
  });
}
