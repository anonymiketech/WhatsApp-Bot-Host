import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Copy, Check, Loader2, Zap, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BotDefinition } from "@/data/bots-catalog";

interface DeployBotModalProps {
  bot: BotDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeployBotModal({ bot, open, onOpenChange }: DeployBotModalProps) {
  const [step, setStep] = useState<"info" | "session">("info");
  const [sessionId, setSessionId] = useState("");
  const [botName, setBotName] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!bot) return null;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(bot.sessionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeploy = async () => {
    if (!sessionId.trim() || !botName.trim()) return;
    setError(null);
    setIsDeploying(true);

    try {
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: botName,
          sessionId: sessionId.trim(),
          botType: bot.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Deployment failed. Please try again.");
        return;
      }

      setDeployed(true);
      setTimeout(() => {
        onOpenChange(false);
        window.location.reload();
      }, 1800);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setStep("info");
      setSessionId("");
      setBotName("");
      setError(null);
      setDeployed(false);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-white/10 bg-background shadow-2xl">
        <DialogTitle className="sr-only">Deploy {bot.name}</DialogTitle>

        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${bot.accent}80, ${bot.accent}, ${bot.accent}80)` }} />

        <AnimatePresence mode="wait">
          {deployed ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-8 py-10 flex flex-col items-center text-center gap-4"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: `${bot.accent}20`, border: `1px solid ${bot.accent}40` }}
              >
                🚀
              </div>
              <h3 className="text-xl font-bold">Bot is deploying!</h3>
              <p className="text-muted-foreground text-sm">
                <span style={{ color: bot.accent }} className="font-semibold">{botName}</span> is starting up. You'll see it in your dashboard shortly.
              </p>
            </motion.div>
          ) : step === "info" ? (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="px-7 py-6"
            >
              {/* Bot header */}
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
                  style={{ background: bot.accentBg, borderColor: `${bot.accent}30` }}
                >
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold">{bot.name}</h2>
                    {bot.badge && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${bot.accent}20`, color: bot.accent }}
                      >
                        {bot.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{bot.tagline}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{bot.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {bot.features.map((f) => (
                  <span
                    key={f}
                    className="text-xs px-2.5 py-1 rounded-full border"
                    style={{ color: bot.accent, borderColor: `${bot.accent}30`, background: `${bot.accent}10` }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Cost */}
              <div className="rounded-xl bg-secondary/40 border border-white/5 mb-6 overflow-hidden">
                <div className="flex items-center justify-between p-3.5">
                  <span className="text-sm text-muted-foreground">Monthly subscription</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold" style={{ color: bot.accent }}>{bot.coinsPerDay * 30}</span>
                    <span className="text-sm text-muted-foreground font-medium">coins / 30 days</span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-3.5 pb-3 text-xs text-muted-foreground border-t border-white/5 pt-2.5">
                  <span>Renews every 30 days from your deploy date</span>
                  <span>{bot.coinsPerDay} coins/day</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <a
                  href={bot.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary/50 border border-white/10 text-sm hover:bg-white/10 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Docs
                </a>
                <button
                  onClick={() => setStep("session")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm text-background transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: bot.accent, boxShadow: `0 0 0 0 ${bot.accent}00` }}
                >
                  <Zap className="w-4 h-4" />
                  Deploy this Bot
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="session"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="px-7 py-6"
            >
              <button
                onClick={() => setStep("info")}
                className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back to bot info
              </button>

              <h3 className="text-lg font-bold mb-1">Pair & Deploy</h3>
              <p className="text-sm text-muted-foreground mb-5">
                First, get your session key from the pairing page, then paste it below.
              </p>

              {/* Step 1: Pairing link */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Step 1 — Get your session key
                </p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40 border border-white/10">
                  <code className="flex-1 text-xs text-muted-foreground truncate">{bot.sessionLink}</code>
                  <button
                    onClick={handleCopyLink}
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={bot.sessionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Step 2: Bot name */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Step 2 — Name your instance
                </p>
                <input
                  type="text"
                  placeholder={`e.g. My ${bot.name}`}
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-secondary/50 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>

              {/* Step 3: Session ID */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Step 3 — Paste your session key
                </p>
                <textarea
                  placeholder="Paste your WhatsApp session key here..."
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-secondary/50 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none font-mono text-xs"
                />
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-4">
                  {error}
                </p>
              )}

              <button
                onClick={handleDeploy}
                disabled={isDeploying || !sessionId.trim() || !botName.trim()}
                className="w-full py-3 rounded-lg font-bold text-sm text-background transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: bot.accent }}
              >
                {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isDeploying ? "Deploying..." : "Launch Bot Instance"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
