import * as oidc from "openid-client";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetCurrentAuthUserResponse,
  ExchangeMobileAuthorizationCodeBody,
  ExchangeMobileAuthorizationCodeResponse,
  LogoutMobileSessionResponse,
} from "@workspace/api-zod";
import { db, usersTable, emailVerificationsTable } from "@workspace/db";
import { eq, or, and, lt } from "drizzle-orm";
import { sendVerificationEmail } from "../lib/email";
import { createNotification, ensureWelcomeNotification } from "../lib/notify";
import {
  clearSession,
  getOidcConfig,
  getSessionId,
  createSession,
  deleteSession,
  SESSION_COOKIE,
  SESSION_TTL,
  ISSUER_URL,
  type SessionData,
} from "../lib/auth";

const OIDC_COOKIE_TTL = 10 * 60 * 1000;
const scryptAsync = promisify(scrypt);

const router: IRouter = Router();

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host =
    req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function setOidcCookie(res: Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: OIDC_COOKIE_TTL,
  });
}

function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, "hex");
  return timingSafeEqual(derived, storedBuf);
}

async function buildSession(user: typeof usersTable.$inferSelect): Promise<string> {
  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    access_token: "",
  };
  return createSession(sessionData);
}

async function upsertReplitUser(claims: Record<string, unknown>) {
  const userData = {
    id: claims.sub as string,
    replitId: claims.sub as string,
    email: (claims.email as string) || null,
    firstName: (claims.first_name as string) || null,
    lastName: (claims.last_name as string) || null,
    profileImageUrl: (claims.profile_image_url || claims.picture) as string | null,
  };

  const [user] = await db
    .insert(usersTable)
    .values({ ...userData, coins: 100 })
    .onConflictDoUpdate({
      target: usersTable.replitId,
      set: { ...userData, updatedAt: new Date() },
    })
    .returning();
  return user;
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

// ─── Replit OIDC ─────────────────────────────────────────────────────────────

router.get("/login", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/callback`;
  const returnTo = getSafeReturnTo(req.query.returnTo);

  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

  const redirectTo = oidc.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl,
    scope: "openid email profile offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "login consent",
    state,
    nonce,
  });

  setOidcCookie(res, "code_verifier", codeVerifier);
  setOidcCookie(res, "nonce", nonce);
  setOidcCookie(res, "state", state);
  setOidcCookie(res, "return_to", returnTo);

  res.redirect(redirectTo.href);
});

router.get("/callback", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/callback`;

  const codeVerifier = req.cookies?.code_verifier;
  const nonce = req.cookies?.nonce;
  const expectedState = req.cookies?.state;

  if (!codeVerifier || !expectedState) {
    res.redirect("/api/login");
    return;
  }

  const currentUrl = new URL(
    `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
  );

  let tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers;
  try {
    tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState,
      idTokenExpected: true,
    });
  } catch {
    res.redirect("/api/login");
    return;
  }

  const returnTo = getSafeReturnTo(req.cookies?.return_to);

  res.clearCookie("code_verifier", { path: "/" });
  res.clearCookie("nonce", { path: "/" });
  res.clearCookie("state", { path: "/" });
  res.clearCookie("return_to", { path: "/" });

  const claims = tokens.claims();
  if (!claims) {
    res.redirect("/api/login");
    return;
  }

  const dbUser = await upsertReplitUser(claims as unknown as Record<string, unknown>);
  await ensureWelcomeNotification(dbUser.id);

  const now = Math.floor(Date.now() / 1000);
  const sessionData: SessionData = {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      profileImageUrl: dbUser.profileImageUrl,
    },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.redirect(returnTo);
});

router.get("/logout", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const origin = getOrigin(req);
  const sid = getSessionId(req);
  await clearSession(res, sid);

  const endSessionUrl = oidc.buildEndSessionUrl(config, {
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: origin,
  });

  res.redirect(endSessionUrl.href);
});

// ─── Email / Password ─────────────────────────────────────────────────────────

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const CODE_TTL_MS   = 5 * 60 * 1000;
const COOLDOWN_MS   = 60 * 1000;
const MAX_ATTEMPTS  = 5;

async function issueVerificationCode(
  userId: string,
  email: string,
  allowCooldownBypass = false,
): Promise<{ code: string; cooldownSeconds?: number }> {
  const existing = await db.query.emailVerificationsTable.findFirst({
    where: eq(emailVerificationsTable.userId, userId),
  });

  if (existing && !allowCooldownBypass) {
    const elapsed = Date.now() - existing.createdAt.getTime();
    if (elapsed < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      return { code: existing.code, cooldownSeconds: wait };
    }
  }

  await db.delete(emailVerificationsTable).where(eq(emailVerificationsTable.userId, userId));
  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  await db.insert(emailVerificationsTable).values({ userId, email, code, expiresAt });
  return { code };
}

router.post("/auth/email/register", async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const existing = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });
  if (existing) {
    if (!existing.emailVerified) {
      const result = await issueVerificationCode(existing.id, email);
      if (!result.cooldownSeconds) {
        await sendVerificationEmail(email, result.code, existing.firstName, existing.profileImageUrl).catch(console.error);
      }
      res.status(409).json({ error: "Account exists but not verified. A new code has been sent.", needsVerification: true });
      return;
    }
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({
      email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      coins: 100,
      emailVerified: false,
    })
    .returning();

  const result = await issueVerificationCode(user.id, email, true);
  await sendVerificationEmail(email, result.code, firstName || null, null).catch(console.error);

  res.json({ needsVerification: true });
});

router.post("/auth/email/verify", async (req: Request, res: Response) => {
  const { email, code } = req.body ?? {};
  if (!email || !code) {
    res.status(400).json({ error: "Email and code are required" });
    return;
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });
  if (!user) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  const record = await db.query.emailVerificationsTable.findFirst({
    where: eq(emailVerificationsTable.userId, user.id),
  });

  if (!record) {
    res.status(400).json({ error: "No verification code found. Please request a new one." });
    return;
  }
  if (record.expiresAt < new Date()) {
    await db.delete(emailVerificationsTable).where(eq(emailVerificationsTable.id, record.id));
    res.status(400).json({ error: "Verification code has expired. Request a new one." });
    return;
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    await db.delete(emailVerificationsTable).where(eq(emailVerificationsTable.id, record.id));
    res.status(429).json({ error: "Too many attempts. Please request a new code." });
    return;
  }
  if (record.code !== code.trim()) {
    await db
      .update(emailVerificationsTable)
      .set({ attempts: record.attempts + 1 })
      .where(eq(emailVerificationsTable.id, record.id));
    const remaining = MAX_ATTEMPTS - (record.attempts + 1);
    res.status(400).json({
      error: remaining > 0
        ? `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
        : "Too many attempts. Please request a new code.",
    });
    return;
  }

  await db
    .update(usersTable)
    .set({ emailVerified: true, lastActiveAt: new Date() })
    .where(eq(usersTable.id, user.id));
  await db.delete(emailVerificationsTable).where(eq(emailVerificationsTable.userId, user.id));

  await createNotification(
    user.id,
    "success",
    "Welcome to ANONYMIKETECH! 🎉",
    "Your account is ready. You've received 100 free coins — deploy your first WhatsApp bot and go live in seconds!",
    "/bots"
  );

  const sid = await buildSession(user);
  setSessionCookie(res, sid);
  res.json({ success: true });
});

router.post("/auth/email/resend", async (req: Request, res: Response) => {
  const { email } = req.body ?? {};
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });
  if (!user) {
    res.status(200).json({ success: true });
    return;
  }
  if (user.emailVerified) {
    res.status(400).json({ error: "This account is already verified" });
    return;
  }

  const result = await issueVerificationCode(user.id, email);
  if (result.cooldownSeconds) {
    res.status(429).json({
      error: `Please wait ${result.cooldownSeconds} seconds before requesting a new code.`,
      cooldownSeconds: result.cooldownSeconds,
    });
    return;
  }
  await sendVerificationEmail(email, result.code, user.firstName, user.profileImageUrl).catch(console.error);
  res.json({ success: true });
});

router.post("/auth/email/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (!user.emailVerified) {
    const result = await issueVerificationCode(user.id, email);
    if (!result.cooldownSeconds) {
      await sendVerificationEmail(email, result.code, user.firstName, user.profileImageUrl).catch(console.error);
    }
    res.status(403).json({ error: "Please verify your email first. A new code has been sent.", needsVerification: true });
    return;
  }

  await db.update(usersTable).set({ lastActiveAt: new Date() }).where(eq(usersTable.id, user.id));
  await ensureWelcomeNotification(user.id);
  const sid = await buildSession(user);
  setSessionCookie(res, sid);
  res.json({ success: true });
});

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────

router.get("/auth/github", (req: Request, res: Response) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    res.status(503).json({ error: "GitHub auth is not configured" });
    return;
  }

  const state = randomBytes(16).toString("hex");
  const returnTo = getSafeReturnTo(req.query.returnTo);

  setOidcCookie(res, "github_state", state);
  setOidcCookie(res, "return_to", returnTo);

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${getOrigin(req)}/api/auth/github/callback`,
    scope: "user:email read:user",
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get("/auth/github/callback", async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const expectedState = req.cookies?.github_state;
  const returnTo = getSafeReturnTo(req.cookies?.return_to);

  res.clearCookie("github_state", { path: "/" });
  res.clearCookie("return_to", { path: "/" });

  if (!code || !state || state !== expectedState) {
    res.redirect("/?error=github_auth_failed");
    return;
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${getOrigin(req)}/api/auth/github/callback`,
      }),
    });
    const tokenData = await tokenRes.json() as { access_token?: string };
    if (!tokenData.access_token) {
      res.redirect("/?error=github_auth_failed");
      return;
    }

    const [profileRes, emailsRes] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": "ANONYMIKETECH" },
      }),
      fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": "ANONYMIKETECH" },
      }),
    ]);

    const profile = await profileRes.json() as {
      id: number; login: string; name?: string; avatar_url?: string;
    };
    const emails = await emailsRes.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
    const primaryEmail = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? null;

    const githubId = String(profile.id);
    const nameParts = (profile.name || profile.login).split(" ");
    const firstName = nameParts[0] || null;
    const lastName = nameParts.slice(1).join(" ") || null;

    const existing = primaryEmail
      ? await db.query.usersTable.findFirst({
          where: or(
            eq(usersTable.githubId, githubId),
            eq(usersTable.email, primaryEmail),
          ),
        })
      : await db.query.usersTable.findFirst({
          where: eq(usersTable.githubId, githubId),
        });

    let user;
    if (existing) {
      [user] = await db
        .update(usersTable)
        .set({ githubId, firstName: firstName ?? existing.firstName, lastName: lastName ?? existing.lastName, profileImageUrl: profile.avatar_url ?? existing.profileImageUrl, updatedAt: new Date() })
        .where(eq(usersTable.id, existing.id))
        .returning();
      await ensureWelcomeNotification(user.id);
    } else {
      [user] = await db
        .insert(usersTable)
        .values({ githubId, email: primaryEmail, firstName, lastName, profileImageUrl: profile.avatar_url ?? null, coins: 100 })
        .returning();
      await createNotification(
        user.id,
        "success",
        "Welcome to ANONYMIKETECH! 🎉",
        "Your GitHub account is connected. You've received 100 free coins — deploy your first WhatsApp bot and go live in seconds!",
        "/bots"
      );
    }

    const sid = await buildSession(user);
    setSessionCookie(res, sid);
    res.redirect(returnTo);
  } catch (err) {
    req.log.error({ err }, "GitHub OAuth error");
    res.redirect("/?error=github_auth_failed");
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

let googleOidcConfig: oidc.Configuration | null = null;

async function getGoogleOidcConfig(): Promise<oidc.Configuration> {
  if (!googleOidcConfig) {
    googleOidcConfig = await oidc.discovery(
      new URL("https://accounts.google.com"),
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }
  return googleOidcConfig;
}

router.get("/auth/google", async (req: Request, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(503).json({ error: "Google auth is not configured" });
    return;
  }

  try {
    const config = await getGoogleOidcConfig();
    const callbackUrl = `${getOrigin(req)}/api/auth/google/callback`;
    const returnTo = getSafeReturnTo(req.query.returnTo);

    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    const redirectTo = oidc.buildAuthorizationUrl(config, {
      redirect_uri: callbackUrl,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
    });

    setOidcCookie(res, "google_code_verifier", codeVerifier);
    setOidcCookie(res, "google_nonce", nonce);
    setOidcCookie(res, "google_state", state);
    setOidcCookie(res, "return_to", returnTo);

    res.redirect(redirectTo.href);
  } catch (err) {
    req.log.error({ err }, "Google auth init error");
    res.redirect("/?error=google_auth_failed");
  }
});

router.get("/auth/google/callback", async (req: Request, res: Response) => {
  const codeVerifier = req.cookies?.google_code_verifier;
  const nonce = req.cookies?.google_nonce;
  const expectedState = req.cookies?.google_state;
  const returnTo = getSafeReturnTo(req.cookies?.return_to);

  res.clearCookie("google_code_verifier", { path: "/" });
  res.clearCookie("google_nonce", { path: "/" });
  res.clearCookie("google_state", { path: "/" });
  res.clearCookie("return_to", { path: "/" });

  if (!codeVerifier || !expectedState) {
    res.redirect("/?error=google_auth_failed");
    return;
  }

  try {
    const config = await getGoogleOidcConfig();
    const callbackUrl = `${getOrigin(req)}/api/auth/google/callback`;

    const currentUrl = new URL(
      `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
    );

    const tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState,
      idTokenExpected: true,
    });

    const claims = tokens.claims();
    if (!claims) {
      res.redirect("/?error=google_auth_failed");
      return;
    }

    const googleId = claims.sub;
    const email = claims.email as string | null ?? null;
    const firstName = (claims.given_name as string) || (claims.name as string)?.split(" ")[0] || null;
    const lastName = (claims.family_name as string) || null;
    const profileImageUrl = (claims.picture as string) || null;

    const existing = email
      ? await db.query.usersTable.findFirst({
          where: or(eq(usersTable.googleId, googleId), eq(usersTable.email, email)),
        })
      : await db.query.usersTable.findFirst({
          where: eq(usersTable.googleId, googleId),
        });

    let user;
    if (existing) {
      [user] = await db
        .update(usersTable)
        .set({ googleId, firstName: firstName ?? existing.firstName, lastName: lastName ?? existing.lastName, profileImageUrl: profileImageUrl ?? existing.profileImageUrl, updatedAt: new Date() })
        .where(eq(usersTable.id, existing.id))
        .returning();
      await ensureWelcomeNotification(user.id);
    } else {
      [user] = await db
        .insert(usersTable)
        .values({ googleId, email, firstName, lastName, profileImageUrl, coins: 100 })
        .returning();
      await createNotification(
        user.id,
        "success",
        "Welcome to ANONYMIKETECH! 🎉",
        "Your Google account is connected. You've received 100 free coins — deploy your first WhatsApp bot and go live in seconds!",
        "/bots"
      );
    }

    const sid = await buildSession(user);
    setSessionCookie(res, sid);
    res.redirect(returnTo);
  } catch (err) {
    req.log.error({ err }, "Google OAuth callback error");
    res.redirect("/?error=google_auth_failed");
  }
});

// ─── Mobile auth (Replit OIDC) ────────────────────────────────────────────────

router.post(
  "/mobile-auth/token-exchange",
  async (req: Request, res: Response) => {
    const parsed = ExchangeMobileAuthorizationCodeBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Missing or invalid required parameters" });
      return;
    }

    const { code, code_verifier, redirect_uri, state, nonce } = parsed.data;

    try {
      const config = await getOidcConfig();

      const callbackUrl = new URL(redirect_uri);
      callbackUrl.searchParams.set("code", code);
      callbackUrl.searchParams.set("state", state);
      callbackUrl.searchParams.set("iss", ISSUER_URL);

      const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
        pkceCodeVerifier: code_verifier,
        expectedNonce: nonce ?? undefined,
        expectedState: state,
        idTokenExpected: true,
      });

      const claims = tokens.claims();
      if (!claims) {
        res.status(401).json({ error: "No claims in ID token" });
        return;
      }

      const dbUser = await upsertReplitUser(claims as unknown as Record<string, unknown>);

      const now = Math.floor(Date.now() / 1000);
      const sessionData: SessionData = {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          profileImageUrl: dbUser.profileImageUrl,
        },
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
      };

      const sid = await createSession(sessionData);
      res.json(ExchangeMobileAuthorizationCodeResponse.parse({ token: sid }));
    } catch (err) {
      req.log.error({ err }, "Mobile token exchange error");
      res.status(500).json({ error: "Token exchange failed" });
    }
  },
);

router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) {
    await deleteSession(sid);
  }
  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

export default router;
