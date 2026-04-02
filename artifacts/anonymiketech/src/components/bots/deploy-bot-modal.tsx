import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ExternalLink, Copy, Check, Loader2, Zap, BookOpen, Github,
  Star, GitFork, AlertTriangle, CheckCircle2, XCircle, ScanSearch,
  Container, Server,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BotDefinition } from "@/data/bots-catalog";

interface DeployBotModalProps {
  bot: BotDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RepoScan {
  compatible: boolean;
  reason: string;
  files: string[];
  runtime?: string;
}

function RepoScanBadge({ scan, scanning }: { scan: RepoScan | null; scanning: boolean }) {
  if (scanning) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-lg bg-secondary/40 border border-white/8">
        <ScanSearch className="w-3.5 h-3.5 animate-pulse" />
        Scanning repository for panel compatibility…
      </div>
    );
  }
  if (!scan) return null;

  if (scan.compatible) {
    return (
      <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-primary/8 border border-primary/20 text-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-primary">Panel-compatible — {scan.runtime}</p>
          <p className="text-muted-foreground mt-0.5">{scan.reason}</p>
          {scan.files.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {scan.files.map((f) => (
                <span key={f} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/15">
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-yellow-500/8 border border-yellow-500/20 text-xs">
      <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-yellow-400">Panel deployment may not be supported</p>
        <p className="text-muted-foreground mt-0.5">{scan.reason}</p>
        <p className="text-muted-foreground mt-0.5">You can still deploy — your session will be managed by our platform.</p>
      </div>
    </div>
  );
}

export function DeployBotModal({ bot, open, onOpenChange }: DeployBotModalProps) {
  const [step, setStep] = useState<"info" | "session">("info");
  const [sessionId, setSessionId] = useState("");
  const [botName, setBotName] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [repoScan, setRepoScan] = useState<RepoScan | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  if (!bot) return null;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(bot.sessionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scanRepo = async () => {
    if (!bot.githubRepo) return;
    setIsScanning(true);
    setRepoScan(null);
    try {
      const res = await fetch(`/api/bots/check-repo?repoUrl=${encodeURIComponent(bot.githubRepo)}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRepoScan(data);
      }
    } catch {
      // silently fail — don't block deployment
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (open && bot.githubRepo) {
      setRepoScan(null);
      scanRepo();
    }
  }, [open, bot.githubRepo]);

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
          coinsPerDay: bot.coinsPerDay,
          ...(bot.pterodactylServerId ? { pterodactylServerId: bot.pterodactylServerId } : {}),
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
      <DialogContent className="sm:max-w-[490px] p-0 overflow-hidden border border-white/10 bg-background shadow-2xl max-h-[92vh] flex flex-col">
        <DialogTitle className="sr-only">Deploy {bot.name}</DialogTitle>

        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${bot.accent}80, ${bot.accent}, ${bot.accent}80)` }} />

        <div className="overflow-y-auto flex-1">
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
                    {/* Pterodactyl badge */}
                    {bot.pterodactylServerId && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Server className="w-2.5 h-2.5" />
                        Panel Hosted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{bot.tagline}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{bot.description}</p>

              {/* Repo scan result */}
              {bot.githubRepo && (
                <div className="mb-5">
                  <RepoScanBadge scan={repoScan} scanning={isScanning} />
                </div>
              )}

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-5">
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
              <div className="rounded-xl bg-secondary/40 border border-white/5 mb-5 overflow-hidden">
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

              {/* GitHub support section */}
              {bot.githubRepo && (
                <div
                  className="rounded-xl border border-white/8 p-3.5 mb-5 flex items-center gap-3"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <Github className="w-4 h-4 flex-shrink-0" style={{ color: "#94a3b8" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight">Love this bot? Support the developer</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#71717a" }}>Star & fork the repo to show appreciation</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a
                      href={bot.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      style={{ color: "#e2e8f0" }}
                    >
                      <Star className="w-3 h-3 text-yellow-400" />
                      Star
                    </a>
                    <a
                      href={`${bot.githubRepo}/fork`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      style={{ color: "#94a3b8" }}
                    >
                      <GitFork className="w-3 h-3" />
                      Fork
                    </a>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div
                className="rounded-xl border border-yellow-500/15 p-3 mb-5 flex gap-2.5"
                style={{ background: "rgba(234,179,8,0.04)" }}
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#ca8a04" }} />
                <p className="text-[11px] leading-relaxed" style={{ color: "#a16207" }}>
                  <span className="font-semibold" style={{ color: "#ca8a04" }}>Note:</span>{" "}
                  Any downtime or issues with the bot's pairing site or functionality are the responsibility of the bot's developer, not ANONYMIKETECH.
                </p>
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
                  style={{ background: bot.accent }}
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

              {/* Panel compatibility reminder */}
              {repoScan && (
                <div className="mb-4">
                  <RepoScanBadge scan={repoScan} scanning={false} />
                </div>
              )}

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
                <p className="text-[10px] mt-1.5 flex items-start gap-1" style={{ color: "#71717a" }}>
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#ca8a04" }} />
                  If this link is down, it's a temporary issue on the developer's end. Please try again later.
                </p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
