import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { Bot, Shield, Zap, ArrowRight, Server, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { AuthModal } from "@/components/auth/auth-modal";
import { DeployBotModal } from "@/components/bots/deploy-bot-modal";
import { FEATURED_BOT, OTHER_BOTS, type BotDefinition } from "@/data/bots-catalog";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
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

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Tech background" 
          className="w-full h-full object-cover opacity-20 object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background to-background" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-widest text-foreground">
              ANONYMIKETECH
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {!isLoading && (
              isAuthenticated ? (
                <Link href="/dashboard" className="px-6 py-2.5 bg-primary text-background hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,229,153,0.3)] rounded-lg text-sm font-bold transition-all">
                  Dashboard
                </Link>
              ) : (
                <>
                  <button 
                    onClick={() => setAuthModal("sign-in")}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setAuthModal("sign-up")}
                    className="px-5 py-2.5 bg-primary text-background hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,229,153,0.3)] rounded-lg text-sm font-bold transition-all"
                  >
                    Sign Up
                  </button>
                </>
              )
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
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
                    Start Hosting Now <ArrowRight className="w-5 h-5" />
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

          {/* Feature Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full"
          >
            {[
              { icon: Shield, title: "Secure Sessions", desc: "Enterprise-grade encryption for your WhatsApp pairings. Your data stays yours." },
              { icon: Zap, title: "Instant Deployment", desc: "Start and stop your bots instantly. No cold-starts, no waiting." },
              { icon: Server, title: "24/7 Uptime", desc: "Reliable hosting infrastructure keeping your autoresponders active around the clock." }
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

        {/* ── Bot Showcase ── */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            {/* Section header */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Bot Marketplace</p>
                <h2 className="text-3xl md:text-4xl font-display font-black">
                  Deploy the right bot,{" "}
                  <span className="tech-gradient-text">instantly</span>
                </h2>
              </div>
              <Link
                href="/bots"
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                View all {8} bots <ArrowRight className="w-4 h-4" />
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
                  <div className="flex items-center gap-2 text-sm">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="font-bold text-xl">{FEATURED_BOT.coinsPerDay}</span>
                    <span className="text-muted-foreground">coins/day</span>
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

            {/* Other bots preview — first 4 */}
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
                    <span className="text-xs font-bold" style={{ color: bot.accent }}>
                      {bot.coinsPerDay} coins/day
                    </span>
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
                      Deploy <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
              <Link
                href="/bots"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                View all 8 bots in the marketplace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Auth Modals */}
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
