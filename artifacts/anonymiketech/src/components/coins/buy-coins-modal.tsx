import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Coins, Smartphone, CheckCircle2, XCircle,
  Loader2, Globe, ChevronRight, Zap, Star
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  kesAmount: number;
  popular: boolean;
  perCoin: number;
}

interface BuyCoinsModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "packages" | "phone" | "waiting" | "success" | "failed";

const BASE_URL = import.meta.env.BASE_URL ?? "/";

async function apiPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return res.json();
}

export function BuyCoinsModal({ open, onClose }: BuyCoinsModalProps) {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<CoinPackage | null>(null);
  const [step, setStep] = useState<Step>("packages");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [resultCoins, setResultCoins] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    fetch(`${BASE_URL}api/payments/packages`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPackages(d.packages ?? []));
  }, [open]);

  useEffect(() => {
    if (!open) {
      if (pollRef.current) clearTimeout(pollRef.current);
      setStep("packages");
      setSelectedPkg(null);
      setPhone("");
      setPhoneError("");
      setTransactionId(null);
      setPollCount(0);
    }
  }, [open]);

  useEffect(() => {
    if (step !== "waiting" || !transactionId) return;
    if (pollCount >= 24) {
      setStep("failed");
      return;
    }
    pollRef.current = setTimeout(async () => {
      const data = await apiPost("payments/check-status", { transactionId });
      if (data.status === "completed") {
        setResultCoins(data.coins ?? 0);
        setStep("success");
        queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      } else if (data.status === "failed") {
        setStep("failed");
      } else {
        setPollCount((c) => c + 1);
      }
    }, 5000);
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [step, transactionId, pollCount, queryClient]);

  const validatePhone = (v: string) => {
    const clean = v.replace(/\D/g, "");
    if (!clean) return "Phone number is required";
    if (!/^2547\d{8}$/.test(clean)) return "Format: 2547XXXXXXXX (e.g. 254712345678)";
    return "";
  };

  const handleInitiate = async () => {
    const err = validatePhone(phone);
    if (err) { setPhoneError(err); return; }
    if (!selectedPkg) return;
    setIsSubmitting(true);
    const data = await apiPost("payments/initiate", {
      phone: phone.replace(/\D/g, ""),
      packageId: selectedPkg.id,
    });
    setIsSubmitting(false);
    if (data.error) { setPhoneError(data.error); return; }
    setTransactionId(data.transactionId);
    setPollCount(0);
    setStep("waiting");
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative z-10 w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg leading-none">Buy Coins</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Power your bots with M-Pesa</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">

              {/* ── Step: Packages ── */}
              {step === "packages" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPkg(pkg)}
                        className={`relative flex flex-col rounded-xl border p-4 text-left transition-all ${
                          selectedPkg?.id === pkg.id
                            ? "border-primary/60 bg-primary/8 shadow-[0_0_18px_rgba(0,229,153,0.12)]"
                            : "border-white/8 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-background text-[10px] font-bold">
                            <Star className="w-2.5 h-2.5" /> Most Popular
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mb-2">
                          <Coins className="w-4 h-4 text-primary" />
                          <span className="font-display font-black text-2xl text-primary">{pkg.coins.toLocaleString()}</span>
                        </div>
                        <p className="font-bold text-sm text-foreground">{pkg.name}</p>
                        <p className="text-xl font-black mt-1">KES {pkg.kesAmount}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">KES {pkg.perCoin.toFixed(2)}/coin</p>
                      </button>
                    ))}
                  </div>

                  {/* International coming soon */}
                  <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 flex items-start gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">International Payments</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Visa, Mastercard, and PayPal support is on its way. For now, M-Pesa (Kenya) is available.
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={!selectedPkg}
                    onClick={() => setStep("phone")}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-background font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(0,229,153,0.3)]"
                  >
                    Continue with {selectedPkg ? `${selectedPkg.coins} Coins` : "—"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── Step: Phone ── */}
              {step === "phone" && selectedPkg && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-primary/25 bg-primary/[0.05] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-primary" />
                      <span className="font-bold text-primary">{selectedPkg.coins} coins</span>
                      <span className="text-muted-foreground text-sm">for KES {selectedPkg.kesAmount}</span>
                    </div>
                    <button onClick={() => setStep("packages")} className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary" />
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                      placeholder="2547XXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-primary/50 focus:outline-none focus:bg-white/[0.06] text-sm transition-all placeholder:text-muted-foreground/50 font-mono"
                    />
                    {phoneError && (
                      <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {phoneError}
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      Format: 254712345678 — include country code, no spaces or dashes
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5 text-[11px] text-muted-foreground leading-relaxed">
                    You'll receive an <strong className="text-foreground">M-Pesa STK Push</strong> prompt on your phone.
                    Enter your PIN to confirm the payment of <strong className="text-foreground">KES {selectedPkg.kesAmount}</strong>.
                    Coins will be credited automatically once payment is verified.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setStep("packages")}
                      className="py-3 rounded-xl border border-white/10 text-sm font-semibold hover:bg-white/5 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleInitiate}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-background font-bold text-sm transition-all disabled:opacity-60 hover:bg-primary/90"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Send STK Push</>}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step: Waiting ── */}
              {step === "waiting" && (
                <div className="py-4 flex flex-col items-center text-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0d1117] border-2 border-primary/40 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl mb-2">Check Your Phone</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                      An M-Pesa STK Push has been sent to <strong className="text-foreground font-mono">{phone}</strong>.
                      Enter your PIN to confirm.
                    </p>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${Math.min((pollCount / 24) * 100, 95)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verifying payment… ({Math.floor((24 - pollCount) * 5 / 60)}m {((24 - pollCount) * 5) % 60}s remaining)
                  </p>
                  <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
                    Close (payment will still be tracked)
                  </button>
                </div>
              )}

              {/* ── Step: Success ── */}
              {step === "success" && (
                <div className="py-4 flex flex-col items-center text-center gap-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-display font-bold text-2xl text-primary mb-1">Payment Successful!</h3>
                    <p className="text-muted-foreground text-sm">Your coins have been credited</p>
                  </div>
                  <div className="w-full rounded-xl border border-primary/25 bg-primary/[0.06] p-4 flex items-center justify-center gap-3">
                    <Coins className="w-6 h-6 text-primary" />
                    <span className="font-display font-black text-3xl text-primary">+{resultCoins}</span>
                    <span className="text-foreground font-semibold">coins added</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-3.5 rounded-xl bg-primary text-background font-bold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* ── Step: Failed ── */}
              {step === "failed" && (
                <div className="py-4 flex flex-col items-center text-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl mb-2">Payment Failed</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                      The payment was not completed. This could be due to an incorrect PIN, insufficient funds,
                      or a timeout.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button
                      onClick={() => { setStep("packages"); setTransactionId(null); setPollCount(0); }}
                      className="py-3 rounded-xl bg-primary text-background font-bold text-sm hover:bg-primary/90 transition-colors"
                    >
                      Try Again
                    </button>
                    <button onClick={onClose} className="py-3 rounded-xl border border-white/10 text-sm font-semibold hover:bg-white/5 transition-colors">
                      Close
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
