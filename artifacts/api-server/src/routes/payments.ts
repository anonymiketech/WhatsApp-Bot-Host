import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, transactionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "../lib/notify";

const router: IRouter = Router();

const PAYFLOW_API_KEY = process.env.PAYFLOW_API_KEY!;
const PAYFLOW_API_SECRET = process.env.PAYFLOW_API_SECRET!;
const PAYFLOW_ACCOUNT_ID = parseInt(process.env.PAYFLOW_ACCOUNT_ID ?? "1", 10);
const PAYFLOW_BASE = "https://payflow.top/api/v2";

export const COIN_PACKAGES = [
  { id: "starter",  name: "Starter",  coins: 100,  kesAmount: 50,  popular: false, perCoin: 0.50 },
  { id: "popular",  name: "Popular",  coins: 300,  kesAmount: 100, popular: true,  perCoin: 0.33 },
  { id: "value",    name: "Value",    coins: 700,  kesAmount: 200, popular: false, perCoin: 0.29 },
  { id: "mega",     name: "Mega",     coins: 2000, kesAmount: 500, popular: false, perCoin: 0.25 },
] as const;

async function payflowPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${PAYFLOW_BASE}${path}`, {
    method: "POST",
    headers: {
      "X-API-Key": PAYFLOW_API_KEY,
      "X-API-Secret": PAYFLOW_API_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<Record<string, unknown>>;
}

router.get("/payments/packages", (_req, res) => {
  res.json({ packages: COIN_PACKAGES });
});

router.post("/payments/initiate", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { phone, packageId } = req.body as { phone?: string; packageId?: string };

  if (!phone || !packageId) {
    res.status(400).json({ error: "phone and packageId are required" });
    return;
  }

  const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    res.status(400).json({ error: "Invalid package" });
    return;
  }

  let cleanPhone = phone.replace(/[\s\-()]/g, "");
  // Normalize: +254XXXXXXXXX → 254XXXXXXXXX, 07XXXXXXXX or 01XXXXXXXX → 254XXXXXXXXX
  if (cleanPhone.startsWith("+")) cleanPhone = cleanPhone.slice(1);
  if (cleanPhone.startsWith("0")) cleanPhone = "254" + cleanPhone.slice(1);
  if (!/^254\d{9}$/.test(cleanPhone)) {
    res.status(400).json({ error: "Enter a valid Kenyan phone: 07XXXXXXXX, 01XXXXXXXX, 254XXXXXXXXX or +254XXXXXXXXX" });
    return;
  }

  const reference = `AMT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const pfResult = await payflowPost("/stkpush.php", {
    payment_account_id: PAYFLOW_ACCOUNT_ID,
    phone: cleanPhone,
    amount: pkg.kesAmount,
    reference,
    description: `ANONYMIKETECH ${pkg.coins} Coins`,
  }) as { success?: boolean; message?: string; checkout_request_id?: string };

  if (!pfResult.success) {
    res.status(502).json({ error: pfResult.message ?? "Payment gateway error" });
    return;
  }

  const [txn] = await db.insert(transactionsTable).values({
    userId: req.user!.id,
    checkoutRequestId: pfResult.checkout_request_id,
    phone: cleanPhone,
    kesAmount: pkg.kesAmount,
    coinsAmount: pkg.coins,
    packageName: pkg.name,
    status: "pending",
    reference,
  }).returning();

  res.json({
    success: true,
    transactionId: txn.id,
    checkoutRequestId: pfResult.checkout_request_id,
    message: "STK Push sent to your phone. Enter your M-Pesa PIN to complete payment.",
  });
});

router.post("/payments/check-status", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { transactionId } = req.body as { transactionId?: string };
  if (!transactionId) {
    res.status(400).json({ error: "transactionId is required" });
    return;
  }

  const [txn] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, transactionId));
  if (!txn || txn.userId !== req.user!.id) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  if (txn.status === "completed") {
    res.json({ status: "completed", coins: txn.coinsAmount });
    return;
  }
  if (txn.status === "failed") {
    res.json({ status: "failed" });
    return;
  }

  if (!txn.checkoutRequestId) {
    res.json({ status: "pending" });
    return;
  }

  const pfStatus = await payflowPost("/status.php", {
    checkout_request_id: txn.checkoutRequestId,
  }) as { success?: boolean; status?: string; transaction_code?: string; message?: string };

  if (!pfStatus.success) {
    res.json({ status: "pending" });
    return;
  }

  const payStatus = pfStatus.status as string;

  if (payStatus === "completed") {
    await db.update(transactionsTable).set({
      status: "completed",
      transactionCode: pfStatus.transaction_code,
    }).where(eq(transactionsTable.id, transactionId));

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
    if (user) {
      const newCoins = user.coins + txn.coinsAmount;
      await db.update(usersTable).set({ coins: newCoins }).where(eq(usersTable.id, user.id));
      await createNotification(
        user.id,
        "success",
        `${txn.coinsAmount} coins added 💰`,
        `Your M-Pesa payment of KES ${txn.kesAmount} was successful. You now have ${newCoins} coins.`,
        "/dashboard"
      );
    }

    res.json({ status: "completed", coins: txn.coinsAmount, transactionCode: pfStatus.transaction_code });
    return;
  }

  if (payStatus === "failed") {
    await db.update(transactionsTable).set({ status: "failed" }).where(eq(transactionsTable.id, transactionId));
    res.json({ status: "failed" });
    return;
  }

  res.json({ status: "pending" });
});

export default router;
