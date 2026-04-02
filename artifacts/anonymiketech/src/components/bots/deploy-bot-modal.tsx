import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  ExternalLink, Copy, Check, Loader2, Zap, BookOpen, Github,
  Star, GitFork, AlertTriangle, CheckCircle2, XCircle, ScanSearch,
  Server, Sparkles, Gift, Terminal, ChevronRight,
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

interface LogLine {
  id: number;
  text: string;
  type: "info" | "success" | "warn" | "step";
}

// Steps shown in the log terminal during deployment
const DEPLOY_STEPS: Array<{ delay: number; text: string; type: LogLine["type"] }> = [
  { delay: 0,    text: "Validating your session key format…",             type: "step" },
  { delay: 800,  text: "Connecting to hosting panel (Pterodactyl)…",      type: "step" },
  { delay: 1800, text: "Injecting session into bot config file…",          type: "step" },
  { delay: 2800, text: "Sending start signal to bot server…",              type: "step" },
  { delay: 3800, text: "Waiting for server to come online…",               type: "info" },
  { delay: 5200, text: "Registering bot instance in database…",            type: "info" },
  { delay: 6000, text: "Sending deployment notification…",                 type: "info" },
];

function DeployLog({ logs }: { logs: LogLine[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div
      className="rounded-xl border border-white/8 overflow-hidden"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      {/* Terminal title bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-primary/60" />
        <span className="ml-2 text-[10px] text-muted-foreground font-mono">deploy.log</span>
      </div>

      <div className="p-3 space-y-1 font-mono text-[11px] min-h-[120px] max-h-[200px] overflow-y-auto">
        {logs.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2"
          >
            <span style={{ color: "#71717a" }} className="flex-shrink-0">
              {line.type === "success" ? "✓" : line.type === "warn" ? "!" : "›"}
            </span>
            <span style={{
              color: line.type === "success" ? "#00e599"
                : line.type === "warn" ? "#fb923c"
                : line.type === "step" ? "#e4e4e7"
                : "#a1a1aa"
            }}>
              {line.text}
            </span>
          </motion.div>
        ))}
        {/* Blinking cursor */}
        <div className="flex items-center gap-2 mt-1">
          <span style={{ color: "#71717a" }}>›</span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-1.5 h-3.5 rounded-sm"
            style={{ background: "#00e599" }}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
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
  const [isFirstBot, setIsFirstBot] = useState(false);
  const [sessionFormatHint, setSessionFormatHint] = useState<string | null>(null);
  const [sessionLinkOverride, setSessionLinkOverride] = useState<string | null>(null);
  const [pterodactylServerIdOverride, setPterodactylServerIdOverride] = useState<string | null>(null);
  const [deployLogs, setDeployLogs] = useState<LogLine[]>([]);
  const logIdRef = useRef(0);

  // NOTE: All hooks MUST be before any early return
  useEffect(() => {
    if (!open || !bot?.githubRepo) return;
    setRepoScan(null);
    setIsScanning(true);
    fetch(`/api/bots/check-repo?repoUrl=${encodeURIComponent(bot.githubRepo)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setRepoScan(data))
      .catch(() => {})
      .finally(() => setIsScanning(false));
  }, [open, bot?.githubRepo]);

  useEffect(() => {
    if (!open || !bot) return;
    fetch("/api/bots/my-bots", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setIsFirstBot((data?.bots?.length ?? 1) === 0))
      .catch(() => setIsFirstBot(false));
    fetch("/api/bots/catalog-settings", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const s = data?.settings?.[bot.id];
        setSessionFormatHint(s?.sessionFormat ?? null);
        setSessionLinkOverride(s?.sessionLinkOverride ?? null);
        setPterodactylServerIdOverride(s?.pterodactylServerIdOverride ?? null);
      })
      .catch(() => {
        setSessionFormatHint(null);
        setSessionLinkOverride(null);
        setPterodactylServerIdOverride(null);
      });
  }, [open, bot?.id]);

  // Early return AFTER all hooks
  if (!bot) return null;

  // Use admin overrides when set, fall back to catalog defaults
  const effectiveSessionLink = sessionLinkOverride || bot.sessionLink;
  const effectivePteroServerId = pterodactylServerIdOverride || bot.pterodactylServerId;

  const addLog = (text: string, type: LogLine["type"] = "info") => {
    setDeployLogs((prev) => [...prev, { id: logIdRef.current++, text, type }]);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(effectiveSessionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeploy = async () => {
    if (!sessionId.trim() || !botName.trim()) return;
    setError(null);
    setIsDeploying(true);
    setDeployLogs([]);
    logIdRef.current = 0;

    // Schedule log line animations
    const timers: ReturnType<typeof setTimeout>[] = [];
    DEPLOY_STEPS.forEach(({ delay, text, type }) => {
      timers.push(setTimeout(() => addLog(text, type), delay));
    });

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
          ...(effectivePteroServerId ? { pterodactylServerId: effectivePteroServerId } : {}),
        }),
      });

      const data = await res.json();
      timers.forEach(clearTimeout);

      if (!res.ok) {
        setError(data.error || "Deployment failed. Please try again.");
        setIsDeploying(false);
        addLog(`Error: ${data.error || "Deployment failed"}`, "warn");
        return;
      }

      addLog("Bot instance registered successfully!", "success");
      addLog(`${botName} is now live and running 🚀`, "success");

      setTimeout(() => {
        setDeployed(true);
        setTimeout(() => {
          onOpenChange(false);
          window.location.reload();
        }, 1800);
      }, 600);
    } catch {
      timers.forEach(clearTimeout);
      setError("Connection error. Please try again.");
      addLog("Connection error — please try again", "warn");
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
      setDeployLogs([]);
      setSessionLinkOverride(null);
      setPterodactylServerIdOverride(null);
    }
    onOpenChange(v);
  };

  const monthlyCost = bot.coinsPerDay * 30;
  const effectiveCost = isFirstBot ? 0 : monthlyCost;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[490px] p-0 overflow-hidden border border-white/10 bg-background shadow-2xl max-h-[92vh] flex flex-col">
        <DialogTitle className="sr-only">Deploy {bot.name}</DialogTitle>

        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: isFirstBot ? "linear-gradient(90deg, #00e59980, #00e599, #a78bfa)" : `linear-gradient(90deg, ${bot.accent}80, ${bot.accent}, ${bot.accent}80)` }} />

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
              <h3 className="text-xl font-bold">Bot is live!</h3>
              <p className="text-muted-foreground text-sm">
                <span style={{ color: bot.accent }} className="font-semibold">{botName}</span> is online and running. Check your dashboard.
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
              {/* FREE first bot banner */}
              {isFirstBot && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 border border-primary/25"
                  style={{ background: "linear-gradient(135deg, rgba(0,229,153,0.1), rgba(167,139,250,0.08))" }}
                >
                  <Gift className="w-5 h-5 flex-shrink-0" style={{ color: "#00e599" }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#00e599" }}>Your first bot is FREE! 🎉</p>
                    <p className="text-xs" style={{ color: "#a1a1aa" }}>No coins deducted for your first deployment. Enjoy!</p>
                  </div>
                  <span className="ml-auto text-xs font-black px-2 py-1 rounded-lg border border-primary/30" style={{ color: "#00e599", background: "rgba(0,229,153,0.1)" }}>
                    FREE
                  </span>
                </motion.div>
              )}

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
                    {isFirstBot ? (
                      <>
                        <span className="text-lg font-bold line-through opacity-40">{monthlyCost}</span>
                        <span className="text-lg font-black" style={{ color: "#00e599" }}>FREE</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-bold" style={{ color: bot.accent }}>{monthlyCost}</span>
                        <span className="text-sm text-muted-foreground font-medium">coins / 30 days</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between px-3.5 pb-3 text-xs text-muted-foreground border-t border-white/5 pt-2.5">
                  <span>Renews every 30 days from your deploy date</span>
                  <span>{isFirstBot ? "First bot free!" : `${bot.coinsPerDay} coins/day`}</span>
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
                  style={{ background: isFirstBot ? "#00e599" : bot.accent }}
                >
                  {isFirstBot ? <Gift className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {isFirstBot ? "Claim Your Free Bot" : "Deploy this Bot"}
                  <ChevronRight className="w-4 h-4" />
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
                onClick={() => { setStep("info"); setDeployLogs([]); setError(null); }}
                className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 transition-colors"
              >
                ← Back to bot info
              </button>

              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4" style={{ color: "#00e599" }} />
                  Pair & Deploy
                </h3>
                {isFirstBot && (
                  <span className="text-xs font-black px-2.5 py-1 rounded-full border border-primary/30 flex items-center gap-1.5" style={{ color: "#00e599", background: "rgba(0,229,153,0.1)" }}>
                    <Gift className="w-3 h-3" />
                    FREE
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                First, get your session key from the pairing page, then paste it below.
              </p>

              {/* Panel compatibility reminder */}
              {repoScan && !isDeploying && (
                <div className="mb-4">
                  <RepoScanBadge scan={repoScan} scanning={false} />
                </div>
              )}

              {/* Deployment log — shown while deploying */}
              <AnimatePresence>
                {isDeploying && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#00e599" }} />
                      Deployment in progress…
                    </p>
                    <DeployLog logs={deployLogs} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form — hidden while deploying */}
              <AnimatePresence>
                {!isDeploying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Step 1: Pairing link */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Step 1 — Get your session key
                      </p>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40 border border-white/10">
                        <code className="flex-1 text-xs text-muted-foreground truncate">{effectiveSessionLink}</code>
                        <button
                          onClick={handleCopyLink}
                          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href={effectiveSessionLink}
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
                      {sessionFormatHint && (
                        <div className="flex items-start gap-1.5 mt-2 px-2.5 py-2 rounded-lg border border-primary/20 bg-primary/5">
                          <span className="text-primary flex-shrink-0 mt-0.5">ℹ</span>
                          <p className="text-[11px] leading-relaxed" style={{ color: "#a1a1aa" }}>
                            <span className="font-semibold text-primary">Format:</span> {sessionFormatHint}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-4">
                  {error}
                </p>
              )}

              <button
                onClick={handleDeploy}
                disabled={isDeploying || !sessionId.trim() || !botName.trim()}
                className="w-full py-3 rounded-lg font-bold text-sm text-background transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: isFirstBot ? "#00e599" : bot.accent }}
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deploying {botName}…
                  </>
                ) : isFirstBot ? (
                  <>
                    <Gift className="w-4 h-4" />
                    Launch Free Bot Instance
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Launch Bot Instance
                  </>
                )}
              </button>

              {isFirstBot && !isDeploying && (
                <p className="text-center text-xs mt-2" style={{ color: "#71717a" }}>
                  No coins will be deducted for this deployment 🎉
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
