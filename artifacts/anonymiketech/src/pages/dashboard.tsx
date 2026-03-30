import { useEffect, useState } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PairingGuide } from "@/components/bots/pairing-guide";
import { SaveBotForm } from "@/components/bots/save-bot-form";
import { BotCard } from "@/components/bots/bot-card";
import { SectionLoader } from "@/components/ui/section-loader";
import { BuyCoinsModal } from "@/components/coins/buy-coins-modal";
import { useGetMyBots } from "@/hooks/use-bots";
import { Bot as BotIcon, Plus, X, Store, Coins, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

function SpeedDial() {
  const [open, setOpen] = useState(false);
  const [buyCoinsOpen, setBuyCoinsOpen] = useState(false);

  const actions = [
    {
      icon: Store,
      label: "Browse Marketplace",
      href: "/bots",
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.12)",
    },
    {
      icon: Coins,
      label: "Buy Coins",
      color: "#00e599",
      bg: "rgba(0,229,153,0.12)",
      onClick: () => { setOpen(false); setBuyCoinsOpen(true); },
    },
    {
      icon: Zap,
      label: "Deploy a Bot",
      href: "/bots",
      color: "#38bdf8",
      bg: "rgba(56,189,248,0.12)",
    },
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
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/10"
                      style={{ background: "hsl(240 10% 8%)", color: "#e4e4e7" }}
                    >
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
                  <Link key={action.label} href={action.href} onClick={() => setOpen(false)}>
                    {inner}
                  </Link>
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

export default function Dashboard() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: botsData, isLoading: isBotsLoading } = useGetMyBots();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SectionLoader label="Loading your dashboard…" size="lg" />
      </div>
    );
  }

  const bots = botsData?.bots || [];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Management */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-display mb-2">Control Panel</h1>
              <p className="text-muted-foreground text-sm">Deploy and manage your WhatsApp bots.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <PairingGuide />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SaveBotForm />
            </motion.div>
          </div>

          {/* Right Column: Active Bots */}
          <div className="lg:col-span-7 space-y-6">
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
              </h2>
              <SpeedDial />
            </motion.div>

            {isBotsLoading ? (
              <div className="glass-panel rounded-2xl flex items-center justify-center">
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
                <p className="text-muted-foreground max-w-sm">
                  You don't have any WhatsApp bots running yet. Pair your device and save a session to get started.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bots.map((bot, idx) => (
                  <motion.div
                    key={bot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                  >
                    <BotCard bot={bot} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
