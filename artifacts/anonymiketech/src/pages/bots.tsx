import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Zap, Coins, Search, CheckCircle2, AlertTriangle, Github, Star } from "lucide-react";
import { BOT_CATALOG, FEATURED_BOT, type BotDefinition } from "@/data/bots-catalog";
import { BotCatalogCard } from "@/components/bots/bot-catalog-card";
import { DeployBotModal } from "@/components/bots/deploy-bot-modal";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@workspace/replit-auth-web";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const CATEGORIES = [
  { id: "all", label: "All Bots" },
  { id: "official", label: "Official" },
  { id: "ai", label: "AI" },
  { id: "group", label: "Group" },
  { id: "media", label: "Media" },
  { id: "advanced", label: "Advanced" },
];

export default function BotsPage() {
  const { isAuthenticated } = useAuth();
  const [selectedBot, setSelectedBot] = useState<BotDefinition | null>(null);
  const [deployOpen, setDeployOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"sign-in" | "sign-up" | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const handleDeploy = (bot: BotDefinition) => {
    if (!isAuthenticated) { setAuthModal("sign-up"); return; }
    setSelectedBot(bot);
    setDeployOpen(true);
  };

  const filtered = BOT_CATALOG.filter((b) => {
    const matchSearch =
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.tagline.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || b.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-primary/4 blur-[120px] rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
              <Bot className="w-3.5 h-3.5" />
              {BOT_CATALOG.length} bots available
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black mb-2 sm:mb-3">
              Bot <span className="tech-gradient-text">Marketplace</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl">
              Pick a bot, pair your WhatsApp, and deploy in under 2 minutes.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* TRUTH Featured Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-2xl sm:rounded-3xl border border-primary/20 overflow-hidden mb-8 sm:mb-12"
          style={{ background: "linear-gradient(135deg, rgba(0,229,153,0.06) 0%, rgba(0,0,0,0) 60%)" }}
        >
          <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] h-[180px] sm:h-[200px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 p-5 sm:p-8 md:p-10">
            {/* Header */}
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h2 className="text-xl sm:text-2xl font-display font-black">{FEATURED_BOT.name}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">Official</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{FEATURED_BOT.tagline}</p>
              </div>
              {/* Coin badge top-right on desktop */}
              <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="font-bold text-foreground">{FEATURED_BOT.coinsPerDay * 30}</span>
                  <span>coins/month</span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5">{FEATURED_BOT.coinsPerDay} coins/day</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">{FEATURED_BOT.description}</p>

            {/* Feature pills on mobile, grid on desktop */}
            <div className="flex flex-wrap gap-2 sm:hidden mb-5">
              {FEATURED_BOT.features.map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                  {f}
                </span>
              ))}
            </div>
            <div className="hidden sm:grid grid-cols-2 gap-2 mb-6">
              {FEATURED_BOT.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white/4 border border-white/8">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground/90">{f}</span>
                </div>
              ))}
            </div>

            {/* Action row */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <button
                onClick={() => handleDeploy(FEATURED_BOT)}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-primary text-background font-bold text-sm hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,229,153,0.3)] transition-all"
              >
                <Zap className="w-4 h-4" />
                Deploy TRUTH
              </button>
              {/* Coin badge on mobile */}
              <div className="flex sm:hidden items-center gap-1.5 text-sm text-muted-foreground">
                <Coins className="w-4 h-4 text-primary" />
                <span className="font-bold text-foreground">{FEATURED_BOT.coinsPerDay * 30}</span>
                <span>coins/mo</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search + Filter */}
        <div className="flex flex-col gap-3 mb-6 sm:mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bots..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          {/* Category pills — horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap flex-shrink-0 ${
                  category === cat.id
                    ? "bg-primary text-background border-primary font-bold"
                    : "bg-secondary/50 border-white/10 text-muted-foreground hover:bg-white/8 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl border border-yellow-500/15 p-4 mb-6 flex gap-3"
          style={{ background: "rgba(234,179,8,0.04)" }}
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ca8a04" }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-0.5" style={{ color: "#ca8a04" }}>Third-Party Bot Notice</p>
            <p className="text-xs leading-relaxed" style={{ color: "#a16207" }}>
              Bots listed on this marketplace (except the official TRUTH bot) are developed and maintained by independent developers.
              Any downtime, pairing issues, or bugs with a bot's pairing site or functionality are solely the responsibility of that bot's developer — not ANONYMIKETECH.
              If you encounter issues, please be patient and wait for the developer to resolve them.
            </p>
          </div>
        </motion.div>

        {/* GitHub shoutout */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-white/8 p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3"
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
              <Github className="w-4 h-4" style={{ color: "#94a3b8" }} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Support the developers ⭐</p>
              <p className="text-xs mt-0.5" style={{ color: "#71717a" }}>Each bot is an open-source project. Show some love by starring &amp; forking the repos on GitHub.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {BOT_CATALOG.filter((b) => b.githubRepo).map((b) => (
              <a
                key={b.id}
                href={b.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
                style={{ color: "#cbd5e1" }}
              >
                <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                {b.name}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Bot Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-muted-foreground">
            <Bot className="w-10 h-10 mb-3 opacity-30" />
            <p>No bots match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((bot, i) => (
              <BotCatalogCard key={bot.id} bot={bot} index={i} onDeploy={handleDeploy} />
            ))}
          </div>
        )}
      </div>

      <DeployBotModal bot={selectedBot} open={deployOpen} onOpenChange={setDeployOpen} />
      <AuthModal open={authModal === "sign-in"} onOpenChange={(o) => setAuthModal(o ? "sign-in" : null)} mode="sign-in" />
      <AuthModal open={authModal === "sign-up"} onOpenChange={(o) => setAuthModal(o ? "sign-up" : null)} mode="sign-up" />
      <Footer />
    </div>
  );
}
