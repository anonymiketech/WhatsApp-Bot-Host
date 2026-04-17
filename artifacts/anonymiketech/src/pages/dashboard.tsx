import { useEffect, useState } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BotCard } from "@/components/bots/bot-card";
import { SectionLoader } from "@/components/ui/section-loader";
import { BuyCoinsModal } from "@/components/coins/buy-coins-modal";
import { DeployBotModal } from "@/components/bots/deploy-bot-modal";
import { useGetMyBots } from "@/hooks/use-bots";
import {
  Bot as BotIcon, Plus, X, Store, Coins, Zap, Activity,
  TrendingUp, Clock, Sparkles, ChevronRight, MessageSquare,
  Shield, RefreshCw, AlertTriangle, ExternalLink, Star, Server,
  CheckCircle2, Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { BOT_CATALOG } from "@/data/bots-catalog";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function SpeedDial() {
  const [open, setOpen] = useState(false);
  const [buyCoinsOpen, setBuyCoinsOpen] = useState(false);

  const actions = [
    { icon: Store, label: "Browse Marketplace", href: "/bots", color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
    { icon: Coins, label: "Buy Coins", color: "#00e599", bg: "rgba(0,229,153,0.12)", onClick: () => { setOpen(false); setBuyCoinsOpen(true); } },
    { icon: Zap, label: "Deploy a Bot", href: "/bots", color: "#38bdf8", bg: "rgba(56,189,248,0.12)" },
  ];

  return (
    <>
      <div className="relative flex flex-col items-end gap-2">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 8 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2 items-end"
            >
              {actions.map((action, i) => {
                const Icon = action.icon;
                const inner = (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.12, delay: i * 0.04 }}
                    className="flex items-center gap-2.5"
                  >
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/10" style={{ background: "hsl(240 10% 8%)", color: "#e4e4e7" }}>
                      {action.label}
                    </span>
                    <button
                      className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 hover:scale-105 transition-transform"
                      style={{ background: action.bg }}
                      onClick={action.onClick}
                    >
                      <Icon className="w-4 h-4" style={{ color: action.color }} />
                    </button>
                  </motion.div>
                );
                return action.href ? (
                  <Link key={action.label} href={action.href} onClick={() => setOpen(false)}>{inner}</Link>
                ) : (
                  <div key={action.label}>{inner}</div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen((v) => !v)}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 hover:border-primary/40 transition-all hover:scale-105"
          style={{ background: open ? "rgba(0,229,153,0.15)" : "rgba(255,255,255,0.05)" }}
          title="Quick actions"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-4 h-4" style={{ color: "#00e599" }} />
              </motion.span>
            ) : (
              <motion.span key="plus" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <BuyCoinsModal open={buyCoinsOpen} onClose={() => setBuyCoinsOpen(false)} />
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  sub?: string;
  color: string;
  bg: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-white/8 p-4 flex flex-col gap-3"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "#71717a" }}>{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-display font-black" style={{ color }}>{value}</div>
        {sub && <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>{sub}</p>}
      </div>
    </motion.div>
  );
}

function QuickActions({ onBuyCoins }: { onBuyCoins: () => void }) {
  const actions = [
    { icon: Store, label: "Browse Bots", desc: "Explore the marketplace", href: "/bots", color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
    { icon: Coins, label: "Buy Coins", desc: "Top up your balance", onClick: onBuyCoins, color: "#00e599", bg: "rgba(0,229,153,0.08)" },
    { icon: Shield, label: "Profile & Security", desc: "Manage your account", href: "/profile", color: "#38bdf8", bg: "rgba(56,189,248,0.08)" },
    { icon: MessageSquare, label: "Contact Support", desc: "Get help from our team", href: "/contact", color: "#fb923c", bg: "rgba(251,146,60,0.08)" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((a, i) => {
        const Icon = a.icon;
        const inner = (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-white/8 hover:border-white/15 hover:bg-white/[0.03] transition-all cursor-pointer group"
            style={{ background: "rgba(255,255,255,0.015)" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.bg }}>
              <Icon className="w-4 h-4" style={{ color: a.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground leading-none mb-0.5">{a.label}</p>
              <p className="text-[11px] truncate" style={{ color: "#71717a" }}>{a.desc}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </motion.div>
        );

        return a.href ? (
          <Link key={a.label} href={a.href}>{inner}</Link>
        ) : (
          <div key={a.label} onClick={a.onClick}>{inner}</div>
        );
      })}
    </div>
  );
}

const TRUTH_BOT = BOT_CATALOG.find((b) => b.id === "truth")!;

function TruthBotFeatureCard({ onDeploy }: { onDeploy: () => void }) {
  const features = ["200+ Commands", "Auto-Reply", "Media Tools", "Group Management", "AI Chat"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl border border-primary/25 overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, rgba(0,229,153,0.06), rgba(10,10,10,0.8))" }}
    >
      {/* Glowing top accent */}
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, transparent, #00e599, transparent)" }} />

      {/* Shimmer overlay */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />

      <div className="p-5 relative">
        {/* Featured label */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary/30 text-[10px] font-bold tracking-wider" style={{ color: "#00e599", background: "rgba(0,229,153,0.08)" }}>
            <Star className="w-2.5 h-2.5 fill-current" />
            FEATURED BOT
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/60 border border-white/5">
            <Server className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium">Cloud Hosted</span>
          </div>
        </div>

        {/* Bot identity */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl border border-primary/20 flex-shrink-0" style={{ background: "rgba(0,229,153,0.1)" }}>
            🤖
          </div>
          <div>
            <h3 className="text-lg font-display font-black" style={{ color: "#00e599" }}>TRUTH-MD</h3>
            <p className="text-xs" style={{ color: "#71717a" }}>The most powerful multi-device WhatsApp bot</p>
          </div>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {features.map((f) => (
            <span key={f} className="text-[10px] px-2 py-1 rounded-full border border-primary/20 font-medium" style={{ color: "#00e599", background: "rgba(0,229,153,0.08)" }}>
              {f}
            </span>
          ))}
        </div>

        {/* What you get */}
        <div className="space-y-1.5 mb-4">
          {[
            "Your own dedicated WhatsApp session",
            "Runs 24/7 on our cloud servers",
            "Full TRUTH-MD feature set out of the box",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs" style={{ color: "#a1a1aa" }}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#00e599" }} />
              {item}
            </div>
          ))}
        </div>

        {/* Cost chip */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-white/8 mb-4" style={{ background: "rgba(255,255,255,0.02)" }}>
          <span className="text-xs text-muted-foreground">Monthly subscription</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black" style={{ color: "#00e599" }}>900</span>
            <span className="text-xs text-muted-foreground">coins / 30 days</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={TRUTH_BOT.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold border border-white/10 bg-secondary/50 hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Source
          </a>
          <button
            onClick={onDeploy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-background transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(0,229,153,0.35)] hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: "#00e599" }}
          >
            <Zap className="w-4 h-4" />
            Deploy TRUTH Bot
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DeploymentTips() {
  const tips = [
    { icon: Terminal, text: "Visit the pairing site, scan the QR or enter the pair code", color: "#00e599" },
    { icon: Zap, text: "Copy your Session ID — it starts with TRUTH-MD:~eyJ…", color: "#a78bfa" },
    { icon: CheckCircle2, text: "Paste it in the deploy modal and name your instance", color: "#38bdf8" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.38 }}
      className="rounded-2xl border border-white/8 p-4"
      style={{ background: "rgba(255,255,255,0.015)" }}
    >
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
        <Zap className="w-3.5 h-3.5" style={{ color: "#00e599" }} />
        How to get your session key
      </h3>
      <div className="space-y-2.5">
        {tips.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/8" style={{ background: `${tip.color}15` }}>
                <Icon className="w-2.5 h-2.5" style={{ color: tip.color }} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#a1a1aa" }}>
                <span className="font-semibold text-foreground">{i + 1}.</span> {tip.text}
              </p>
            </div>
          );
        })}
      </div>
      <a
        href={TRUTH_BOT.sessionLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 mt-4 py-2 rounded-xl text-xs font-bold border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
        style={{ color: "#00e599" }}
      >
        <ExternalLink className="w-3 h-3" />
        Open TRUTH-MD Pairing Portal
      </a>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: botsData, isLoading: isBotsLoading } = useGetMyBots();
  const [buyCoinsOpen, setBuyCoinsOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isAuthLoading]);

  const BASE_URL = import.meta.env.BASE_URL ?? "/";

  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${BASE_URL}api/users/me`, { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setCoins(d?.user?.coins ?? null))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SectionLoader label="Loading your dashboard…" size="lg" />
      </div>
    );
  }

  const bots = botsData?.bots || [];
  const activeBots = bots.filter((b) => b.status === "running" || b.status === "starting");
  const expiringBots = bots.filter((b) => {
    const d = daysUntil(b.expiresAt);
    return d !== null && d >= 0 && d <= 3;
  });
  const firstExpiry = bots
    .filter((b) => b.expiresAt)
    .map((b) => new Date(b.expiresAt!).getTime())
    .sort((a, z) => a - z)[0];
  const daysToRenewal = firstExpiry ? Math.ceil((firstExpiry - Date.now()) / 86400000) : null;

  const displayName = user?.firstName ?? user?.email?.split("@")[0] ?? "there";

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" style={{ color: "#00e599" }} />
                <span className="text-sm font-medium" style={{ color: "#00e599" }}>{greeting()}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-black">{displayName} 👋</h1>
              <p className="text-sm mt-1" style={{ color: "#71717a" }}>
                {bots.length === 0
                  ? "Welcome! Deploy your first WhatsApp bot to get started."
                  : `You have ${bots.length} bot${bots.length !== 1 ? "s" : ""} — ${activeBots.length} currently running.`}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10" style={{ background: "rgba(0,229,153,0.05)" }}>
              <Coins className="w-4 h-4" style={{ color: "#00e599" }} />
              <span className="font-display font-black text-lg" style={{ color: "#00e599" }}>
                {coins !== null ? coins : "—"}
              </span>
              <span className="text-xs" style={{ color: "#71717a" }}>coins</span>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={BotIcon} label="Active Bots" value={activeBots.length} sub={`of ${bots.length} total`} color="#00e599" bg="rgba(0,229,153,0.1)" delay={0.1} />
          <StatCard icon={Activity} label="Total Bots" value={bots.length} sub="all instances" color="#38bdf8" bg="rgba(56,189,248,0.1)" delay={0.15} />
          <StatCard icon={Coins} label="Coin Balance" value={coins !== null ? coins : "—"} sub="available to spend" color="#a78bfa" bg="rgba(167,139,250,0.1)" delay={0.2} />
          <StatCard
            icon={Clock}
            label="Next Renewal"
            value={daysToRenewal !== null ? (daysToRenewal <= 0 ? "Expired" : `${daysToRenewal}d`) : "—"}
            sub={daysToRenewal !== null && daysToRenewal <= 3 ? "⚠️ Renew soon!" : "until first renewal"}
            color={daysToRenewal !== null && daysToRenewal <= 3 ? "#fb923c" : "#e4e4e7"}
            bg={daysToRenewal !== null && daysToRenewal <= 3 ? "rgba(251,146,60,0.1)" : "rgba(255,255,255,0.05)"}
            delay={0.25}
          />
        </div>

        {/* Expiry alerts */}
        <AnimatePresence>
          {expiringBots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="rounded-2xl border border-orange-500/20 px-4 py-3 flex items-center gap-3"
                style={{ background: "rgba(251,146,60,0.06)" }}>
                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <p className="text-sm" style={{ color: "#e4e4e7" }}>
                  <span className="font-semibold text-orange-400">{expiringBots.length} bot{expiringBots.length !== 1 ? "s" : ""}</span> expiring soon —{" "}
                  <span style={{ color: "#a1a1aa" }}>
                    {expiringBots.map((b) => b.name).join(", ")}. Renew from the bot card to keep them running.
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: TRUTH Bot + Quick Actions */}
          <div className="lg:col-span-5 space-y-6">

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: "#00e599" }} />
                Quick Actions
              </h2>
              <QuickActions onBuyCoins={() => setBuyCoinsOpen(true)} />
            </motion.div>

            {/* TRUTH Bot Feature Card */}
            <div>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" style={{ color: "#00e599" }} />
                Featured Bot
              </h2>
              <TruthBotFeatureCard onDeploy={() => setDeployOpen(true)} />
            </div>

            {/* How to get session key */}
            <DeploymentTips />
          </div>

          {/* Right Column: My Instances */}
          <div className="lg:col-span-7 space-y-5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-2xl font-display flex items-center gap-3">
                My Instances
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-sm font-sans font-medium text-muted-foreground border border-white/5">
                  {bots.length}
                </span>
                {activeBots.length > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
                    style={{ color: "#00e599", borderColor: "rgba(0,229,153,0.25)", background: "rgba(0,229,153,0.08)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {activeBots.length} live
                  </span>
                )}
              </h2>
              <SpeedDial />
            </motion.div>

            {isBotsLoading ? (
              <div className="glass-panel rounded-2xl flex items-center justify-center py-16">
                <SectionLoader label="Loading instances…" size="md" />
              </div>
            ) : bots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center border-dashed border-white/10"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 border border-white/5">
                  <BotIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-display mb-2">No Bots Deployed</h3>
                <p className="text-muted-foreground max-w-sm text-sm mb-5">
                  You don't have any WhatsApp bots running yet. Deploy the featured TRUTH bot or browse the marketplace.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeployOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "#00e599", color: "#000" }}
                  >
                    <Zap className="w-4 h-4" />
                    Deploy TRUTH Bot
                  </button>
                  <Link href="/bots">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/10 bg-secondary hover:bg-white/10 transition-colors">
                      <Store className="w-4 h-4" />
                      Browse
                    </div>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-5">
                {/* Running bots first */}
                {[...bots]
                  .sort((a, b) => {
                    const order: Record<string, number> = { running: 0, starting: 1, stopping: 2, stopped: 3 };
                    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
                  })
                  .map((bot, idx) => (
                    <motion.div
                      key={bot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + idx * 0.08 }}
                    >
                      <BotCard bot={bot} />
                    </motion.div>
                  ))}

                {/* Explore more CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <Link href="/bots">
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors cursor-pointer">
                      <Plus className="w-4 h-4" />
                      Deploy another bot
                    </div>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <BuyCoinsModal open={buyCoinsOpen} onClose={() => setBuyCoinsOpen(false)} />
      <DeployBotModal bot={TRUTH_BOT} open={deployOpen} onOpenChange={setDeployOpen} />
    </div>
  );
}
