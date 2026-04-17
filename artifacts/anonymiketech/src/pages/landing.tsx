import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link, useLocation } from "wouter";
import { Shield, Zap, ArrowRight, Server, Coins, Star, CheckCircle2, Users, Code2, Quote, GitBranch, Activity, Play, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { AuthModal } from "@/components/auth/auth-modal";
import { DeployBotModal } from "@/components/bots/deploy-bot-modal";
import { Footer } from "@/components/layout/footer";
import { PartnerCTASection } from "@/components/layout/partner-cta-section";
import logoImg from "@assets/WhatsApp_Image_2025-06-30_at_3.43.38_PM_1776199339550.jpeg";
import collaboratorImg from "@assets/image_1776260401563.png";
import { FEATURED_BOT, OTHER_BOTS, type BotDefinition } from "@/data/bots-catalog";

const COIN_PACKAGES = [
  { name: "Starter", coins: 100, kesAmount: 50, popular: false, color: "#94a3b8" },
  { name: "Popular", coins: 300, kesAmount: 100, popular: true, color: "#00e599" },
  { name: "Value", coins: 700, kesAmount: 200, popular: false, color: "#38bdf8" },
  { name: "Mega", coins: 2000, kesAmount: 500, popular: false, color: "#a78bfa" },
];

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [authModal, setAuthModal] = useState<"sign-in" | "sign-up" | null>(null);
  const [selectedBot, setSelectedBot] = useState<BotDefinition | null>(null);
  const [deployOpen, setDeployOpen] = useState(false);

  const handleDeploy = (bot: BotDefinition) => {
    if (!isAuthenticated) { setAuthModal("sign-up"); return; }
    setSelectedBot(bot);
    setDeployOpen(true);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const { mode } = (e as CustomEvent).detail ?? {};
      if (mode === "sign-in" || mode === "sign-up") setAuthModal(mode);
    };
    window.addEventListener("open-auth-modal", handler);
    return () => window.removeEventListener("open-auth-modal", handler);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Background Effects — contained, not overflowing */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Tech background"
          className="w-full h-full object-cover opacity-20 object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* All page content in z-10 layer (including footer) */}
      <div className="relative z-10 flex flex-col flex-1">

        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 w-full h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img
              src={logoImg}
              alt="Logo"
              className="h-9 sm:h-10 w-9 sm:w-10 object-contain rounded-xl flex-shrink-0"
              style={{ imageRendering: "high-quality" }}
            />
            <div className="flex flex-col items-center leading-none">
              <span className="font-display font-bold tracking-widest text-foreground">
                <span className="text-sm sm:hidden">AMT</span>
                <span className="hidden sm:inline text-xl">ANONYMIKETECH</span>
              </span>
              <span className="text-[7px] sm:text-[9px] font-semibold tracking-[0.22em] text-primary/70 uppercase mt-0.5 whitespace-nowrap text-center">
                Rock &amp; Roll
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Pricing</Link>
            {isAuthenticated && (
              <Link href="/bots" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Marketplace</Link>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {!isLoading && (
              isAuthenticated ? (
                <Link href="/dashboard" className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-background hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,229,153,0.3)] rounded-lg text-sm font-bold transition-all whitespace-nowrap">
                  Dashboard
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setAuthModal("sign-in")}
                    className="hidden sm:block px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthModal("sign-up")}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 bg-primary text-background hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,229,153,0.3)] rounded-lg text-sm font-bold transition-all whitespace-nowrap"
                  >
                    Sign Up
                  </button>
                </>
              )
            )}
          </div>
        </nav>

        {/* Hero */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-10 sm:pt-20 pb-16 sm:pb-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-white/10 text-sm font-medium text-muted-foreground mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Platform Engine v2.0 is Live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6 max-w-4xl text-glow"
          >
            Host Your WhatsApp Bots with <span className="tech-gradient-text">Absolute Ease</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
          >
            Pair your device, securely save your session, and deploy powerful automated bots in seconds. Pay as you go with our coin-based engine.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            {!isLoading && (
              isAuthenticated ? (
                <Link href="/dashboard" className="px-8 py-4 bg-primary text-background hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,229,153,0.4)] rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                  Launch Console <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setAuthModal("sign-up")}
                    className="px-8 py-4 bg-primary text-background hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,229,153,0.4)] rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    Start Hosting Free <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setAuthModal("sign-in")}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    Sign In
                  </button>
                </>
              )
            )}
          </motion.div>

          {/* Feature grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full"
          >
            {[
              { icon: Shield, title: "Secure Sessions", desc: "Enterprise-grade encryption for your WhatsApp pairings. Your data stays yours." },
              { icon: Zap, title: "Instant Deployment", desc: "Start and stop your bots instantly. No cold-starts, no waiting." },
              { icon: Server, title: "24/7 Uptime", desc: "Reliable hosting infrastructure keeping your autoresponders active around the clock." },
            ].map((feat, idx) => (
              <div key={idx} className="glass-panel p-8 rounded-2xl text-left border border-white/5 hover:border-primary/20 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </motion.div>
        </main>

        {/* Bot Showcase */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full pb-16 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Bot Marketplace</p>
                <h2 className="text-3xl md:text-4xl font-display font-black">
                  Deploy the right bot, <span className="tech-gradient-text">instantly</span>
                </h2>
              </div>
              <Link href="/bots" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                View all 9 bots <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* TRUTH featured card */}
            <div
              className="relative rounded-2xl border border-primary/20 p-6 md:p-8 mb-5 overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(0,229,153,0.07) 0%, rgba(0,0,0,0) 55%)" }}
            >
              <div className="absolute top-0 left-0 w-[350px] h-[180px] bg-primary/8 blur-[90px] rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-lg">🤖</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-xl">{FEATURED_BOT.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">Official</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{FEATURED_BOT.tagline}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-lg">{FEATURED_BOT.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {FEATURED_BOT.features.slice(0, 4).map((f) => (
                      <span key={f} className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
                  <div className="flex flex-col items-start md:items-end">
                    <div className="flex items-center gap-2 text-sm">
                      <Coins className="w-4 h-4 text-primary" />
                      <span className="font-bold text-xl">{FEATURED_BOT.coinsPerDay * 30}</span>
                      <span className="text-muted-foreground">coins/month</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{FEATURED_BOT.coinsPerDay} coins/day</span>
                  </div>
                  <button
                    onClick={() => handleDeploy(FEATURED_BOT)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-background font-bold text-sm hover:bg-primary/90 hover:shadow-[0_0_28px_rgba(0,229,153,0.35)] transition-all"
                  >
                    <Zap className="w-4 h-4" /> Deploy TRUTH
                  </button>
                </div>
              </div>
            </div>

            {/* Other bots preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {OTHER_BOTS.slice(0, 4).map((bot, i) => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + i * 0.07 }}
                  className="group relative flex flex-col rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all overflow-hidden cursor-pointer p-4"
                  onClick={() => handleDeploy(bot)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: `linear-gradient(180deg, transparent, ${bot.accent}, transparent)` }} />
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤖</span>
                      <span className="font-bold text-sm">{bot.name}</span>
                    </div>
                    {bot.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${bot.accent}20`, color: bot.accent }}>
                        {bot.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 flex-1">{bot.tagline}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: bot.accent }}>{bot.coinsPerDay * 30} coins/mo</span>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
                      Deploy <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
              <Link href="/bots" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors">
                View all 9 bots in the marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── Pricing Teaser ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full pb-20">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
          >
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Pricing</p>
              <h2 className="text-3xl md:text-4xl font-display font-black mb-3">
                Simple, transparent <span className="tech-gradient-text">coin-based</span> pricing
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                No subscriptions. Buy coins once, run any bot, any time. New accounts get <span className="text-primary font-bold">100 free coins</span> — no card needed.
              </p>
            </div>

            {/* Free tier callout */}
            <div
              className="rounded-2xl border border-primary/20 p-5 sm:p-6 mb-8 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background: "linear-gradient(135deg, rgba(0,229,153,0.07), rgba(0,0,0,0))" }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-base sm:text-lg">Every new account starts with <span style={{ color: "#00e599" }}>100 free coins</span></p>
                <p className="text-sm text-muted-foreground mt-0.5">Enough to run most bots for ~3 days. No credit card required.</p>
              </div>
              <button
                onClick={() => setAuthModal("sign-up")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-background flex-shrink-0 hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ background: "#00e599" }}
              >
                <Zap className="w-4 h-4" /> Claim Free Coins
              </button>
            </div>

            {/* Coin packages */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {COIN_PACKAGES.map((pkg, i) => (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 + i * 0.07 }}
                  className="relative rounded-2xl border p-4 sm:p-5 flex flex-col"
                  style={{
                    borderColor: pkg.popular ? `${pkg.color}40` : "rgba(255,255,255,0.08)",
                    background: pkg.popular
                      ? "linear-gradient(145deg, rgba(0,229,153,0.07) 0%, rgba(0,0,0,0) 100%)"
                      : "rgba(255,255,255,0.02)",
                  }}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold text-background whitespace-nowrap" style={{ background: "#00e599" }}>
                      <Star className="w-2.5 h-2.5" /> Most Popular
                    </div>
                  )}
                  <div className="flex items-baseline gap-1.5 mb-1 mt-2">
                    <Coins className="w-4 h-4 mb-0.5 flex-shrink-0" style={{ color: pkg.color }} />
                    <span className="text-3xl font-display font-black" style={{ color: pkg.color }}>
                      {pkg.coins.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">coins</span>
                  </div>
                  <p className="font-semibold text-xs mb-3" style={{ color: "#71717a" }}>{pkg.name}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-display font-black">KES {pkg.kesAmount}</span>
                    <button
                      onClick={() => setAuthModal("sign-up")}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all hover:opacity-90"
                      style={{
                        background: pkg.popular ? pkg.color : `${pkg.color}20`,
                        color: pkg.popular ? "#0a0a0f" : pkg.color,
                      }}
                    >
                      Buy
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Features included */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {[
                "100 free coins on signup",
                "Pay only for runtime",
                "9 bots available",
                "Instant M-Pesa crediting",
                "No monthly fees",
                "Cancel anytime",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2.5 p-3 rounded-xl border border-white/6 bg-white/[0.025]">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#00e599" }} />
                  <span className="text-xs sm:text-sm">{feat}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                View full pricing details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── How It Works ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full pb-20">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Visual Workflow</p>
              <h2 className="text-3xl md:text-4xl font-display font-black mb-3">
                From zero to <span className="tech-gradient-text">live bot</span> in 3 steps
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                No servers, no config nightmares. Just click, deploy, go.
              </p>
            </div>

            <div className="relative">
              {/* Connector line — desktop */}
              <div className="hidden lg:block absolute top-[52px] left-[calc(16.66%+40px)] right-[calc(16.66%+40px)] h-[2px]" style={{ background: "linear-gradient(90deg, #00e59940, #a78bfa40, #38bdf840)" }} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
                {[
                  {
                    step: "01",
                    icon: Users,
                    color: "#00e599",
                    bg: "rgba(0,229,153,0.1)",
                    title: "Create Your Account",
                    desc: "Sign up free in under 30 seconds. You instantly receive 100 coins — no card needed.",
                    tag: "100 Free Coins",
                    tagColor: "#00e599",
                    detail: ["Email or OAuth login", "Instant coin grant", "No credit card"],
                  },
                  {
                    step: "02",
                    icon: GitBranch,
                    color: "#a78bfa",
                    bg: "rgba(167,139,250,0.1)",
                    title: "Browse & Choose a Bot",
                    desc: "Pick from 9 powerful WhatsApp bots in the marketplace. Each bot is cloud-hosted, ready to run.",
                    tag: "9 Bots Available",
                    tagColor: "#a78bfa",
                    detail: ["TRUTH-MD, X-Bot & more", "View features & pricing", "Deploy any time"],
                  },
                  {
                    step: "03",
                    icon: Play,
                    color: "#38bdf8",
                    bg: "rgba(56,189,248,0.1)",
                    title: "Deploy & Go Live",
                    desc: "Paste your Session ID, name your instance, and your bot starts running 24/7 instantly.",
                    tag: "< 60 Seconds",
                    tagColor: "#38bdf8",
                    detail: ["Pair via QR or code", "Paste session ID", "Bot runs 24/7"],
                  },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                      className="relative flex flex-col"
                    >
                      {/* Step number + icon */}
                      <div className="flex items-center gap-4 mb-5">
                        <div className="relative">
                          <div className="w-[104px] h-[104px] rounded-3xl flex items-center justify-center border border-white/10 z-10 relative" style={{ background: s.bg }}>
                            <Icon className="w-10 h-10" style={{ color: s.color }} />
                          </div>
                          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 z-20" style={{ background: "#0a0a0f", color: s.color, borderColor: s.color }}>
                            {s.step}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ color: s.tagColor, borderColor: `${s.tagColor}40`, background: `${s.tagColor}12` }}>
                          {s.tag}
                        </span>
                      </div>

                      {/* Card body */}
                      <div className="flex-1 rounded-2xl border border-white/8 p-5" style={{ background: "rgba(255,255,255,0.015)" }}>
                        <h3 className="text-lg font-display font-black mb-2" style={{ color: s.color }}>{s.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                        <div className="space-y-2">
                          {s.detail.map((d) => (
                            <div key={d} className="flex items-center gap-2 text-xs" style={{ color: "#a1a1aa" }}>
                              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Live activity simulation */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-10 rounded-2xl border border-white/8 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.015)" }}
            >
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/6" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">anonymiketech — cloud-deploy — live</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-[10px] text-primary font-semibold">LIVE</span>
                </div>
              </div>
              <div className="p-5 font-mono text-[11px] space-y-1.5" style={{ color: "#71717a" }}>
                {[
                  { prefix: "$", text: "session paired → TRUTH-MD:~eyJhbGci...", color: "#00e599" },
                  { prefix: "✓", text: "instance created → my-bot-01 (running)", color: "#00e599" },
                  { prefix: "→", text: "coins deducted → 30 / 900 used this month", color: "#a78bfa" },
                  { prefix: "●", text: "uptime: 14d 03h 22m  |  status: healthy", color: "#38bdf8" },
                  { prefix: "$", text: "auto-renew queued → next renewal in 16 days", color: "#71717a" },
                ].map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 + i * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="font-bold" style={{ color: line.color }}>{line.prefix}</span>
                    <span>{line.text}</span>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 1.5 }}
                  className="flex items-center gap-1 pt-1"
                >
                  <span className="text-primary">▋</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Loved by Developers in Town ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full pb-20">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Community</p>
              <h2 className="text-3xl md:text-4xl font-display font-black mb-3">
                Loved by <span className="tech-gradient-text">developers in town</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Trusted builders powering real bots on ANONYMIKETECH.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              {[
                {
                  name: "Samson Courtney",
                  handle: "@scourtney",
                  role: "Full-Stack Developer",
                  gradient: "linear-gradient(135deg, #4f46e5, #9333ea)",
                  quote: "ANONYMIKETECH completely changed how I manage client WhatsApp automation. The coin system is genius — I only pay for what actually runs.",
                  stars: 5,
                  badge: "Verified Developer",
                  badgeColor: "#a78bfa",
                },
                {
                  name: "DevBot Pro",
                  handle: "@devbotpro",
                  role: "Bot Developer & Reseller",
                  gradient: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                  quote: "Deployed 3 bots for my clients in under 10 minutes. The platform is rock-solid, no downtime in 60+ days. This is the real deal.",
                  stars: 5,
                  badge: "Top Reseller",
                  badgeColor: "#00e599",
                },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                  className="relative rounded-2xl border border-white/8 p-6 flex flex-col gap-4"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <Quote className="absolute top-5 right-5 w-8 h-8 opacity-[0.06]" />
                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: t.stars }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-current" style={{ color: "#f59e0b" }} />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm leading-relaxed" style={{ color: "#d4d4d8" }}>"{t.quote}"</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-2 border-t border-white/6">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ background: t.gradient }}
                    >
                      {t.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{t.name}</p>
                      <p className="text-[11px]" style={{ color: "#71717a" }}>{t.role}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0" style={{ color: t.badgeColor, borderColor: `${t.badgeColor}40`, background: `${t.badgeColor}12` }}>
                      {t.badge}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/8 p-5" style={{ background: "rgba(255,255,255,0.015)" }}>
              {[
                { value: "200+", label: "Bots Deployed", color: "#00e599" },
                { value: "99.9%", label: "Uptime SLA", color: "#38bdf8" },
                { value: "24/7", label: "Always Running", color: "#a78bfa" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-display font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Meet the Developers ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full pb-20">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Trusted by Devs</p>
              <h2 className="text-3xl md:text-4xl font-display font-black mb-3">
                Meet the <span className="tech-gradient-text">developers</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
                Main panel owner, collaborator, and bot builder spotlight.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Samson Courtney — first */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="group relative rounded-2xl border border-white/8 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                {/* Top gradient accent */}
                <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #4f46e5, #9333ea, #ec4899)" }} />
                <div className="p-6 flex flex-col items-center text-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={collaboratorImg}
                      alt="Courtney"
                      className="w-24 h-24 rounded-3xl object-cover border-2 border-white/10 group-hover:border-purple-500/40 transition-colors shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                    />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-green-500 border-2 flex items-center justify-center" style={{ borderColor: "#0a0a0f" }}>
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-black">Courtney</h3>
                    <p className="text-sm text-muted-foreground">Collaborator · Bot Developer</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ color: "#a78bfa", borderColor: "rgba(167,139,250,0.3)", background: "rgba(167,139,250,0.1)" }}>
                        Collaborator
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ color: "#00e599", borderColor: "rgba(0,229,153,0.3)", background: "rgba(0,229,153,0.1)" }}>
                        Bot Developer
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Courtney is the platform collaborator and bot developer. He helps shape the bot experience and build automation that runs smoothly for users.
                  </p>
                  <div className="flex items-center gap-3 w-full pt-3 border-t border-white/6">
                    <div className="flex-1 flex flex-col items-center">
                      <Code2 className="w-4 h-4 mb-1" style={{ color: "#a78bfa" }} />
                      <span className="text-[10px] text-muted-foreground">Collaborator</span>
                    </div>
                    <div className="w-px h-8 bg-white/8" />
                    <div className="flex-1 flex flex-col items-center">
                      <Activity className="w-4 h-4 mb-1" style={{ color: "#00e599" }} />
                      <span className="text-[10px] text-muted-foreground">Bot Dev</span>
                    </div>
                    <div className="w-px h-8 bg-white/8" />
                    <div className="flex-1 flex flex-col items-center">
                      <Server className="w-4 h-4 mb-1" style={{ color: "#38bdf8" }} />
                      <span className="text-[10px] text-muted-foreground">Platform</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Main panel owner */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.42 }}
                className="group relative rounded-2xl border border-white/8 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #00e599, #a78bfa, #38bdf8)" }} />
                <div className="p-6 flex flex-col items-center text-center justify-center gap-4 min-h-[320px]">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white/10 shadow-[0_0_30px_rgba(0,229,153,0.15)]">
                    <img src={logoImg} alt="ANONYMIKETECH" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold">Main Dev</h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">Platform Owner · Product Lead</p>
                  </div>
                  <p className="text-xs text-muted-foreground/70 leading-relaxed max-w-[220px]">
                    You lead the platform, product direction, and overall experience. Courtney is the collaborator and bot developer.
                  </p>
                  <Link
                    href="/partners?tab=developer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold hover:bg-white/5 transition-colors"
                    style={{ color: "#a78bfa" }}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    Platform Owner
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Partner CTA */}
        <PartnerCTASection />

        {/* Footer always inside z-10 so it's visible */}
        <Footer />
      </div>

      {/* Modals */}
      <AuthModal
        open={authModal === "sign-in"}
        onOpenChange={(open) => setAuthModal(open ? "sign-in" : null)}
        mode="sign-in"
      />
      <AuthModal
        open={authModal === "sign-up"}
        onOpenChange={(open) => setAuthModal(open ? "sign-up" : null)}
        mode="sign-up"
      />
      <DeployBotModal
        bot={selectedBot}
        open={deployOpen}
        onOpenChange={setDeployOpen}
      />
    </div>
  );
}
