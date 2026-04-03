import { motion } from "framer-motion";
import { Coins, Zap, CheckCircle2, Star, Bot, Shield, Clock, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BuyCoinsModal } from "@/components/coins/buy-coins-modal";
import { useAuth } from "@workspace/replit-auth-web";
import { useState } from "react";
import { Link } from "wouter";

const COIN_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    coins: 100,
    kesAmount: 50,
    popular: false,
    perCoin: 0.50,
    color: "#94a3b8",
    description: "Just getting started? This gives you 3 days of bot runtime.",
    badge: null,
    bestFor: "Testing & exploration",
  },
  {
    id: "popular",
    name: "Popular Pack",
    coins: 300,
    kesAmount: 100,
    popular: true,
    perCoin: 0.33,
    color: "#00e599",
    description: "10 days of runtime — most chosen by our community.",
    badge: "Most Popular",
    bestFor: "Regular users",
  },
  {
    id: "value",
    name: "Value Pack",
    coins: 700,
    kesAmount: 200,
    popular: false,
    perCoin: 0.29,
    color: "#38bdf8",
    description: "23 days of uninterrupted bot uptime at the best rate.",
    badge: "Best Value",
    bestFor: "Power users",
  },
  {
    id: "mega",
    name: "Mega Pack",
    coins: 2000,
    kesAmount: 500,
    popular: false,
    perCoin: 0.25,
    color: "#a78bfa",
    description: "60+ days of runtime. Never worry about coins again.",
    badge: "Max Savings",
    bestFor: "Heavy usage",
  },
];

const BOT_COSTS = [
  { name: "TRUTH (Official)", coinsPerDay: 30, accent: "#00e599" },
  { name: "King MD Bot", coinsPerDay: 30, accent: "#a78bfa" },
  { name: "Cypher X", coinsPerDay: 30, accent: "#38bdf8" },
  { name: "BWM-XMD-GO", coinsPerDay: 30, accent: "#34d399" },
  { name: "Atassa Cloud", coinsPerDay: 50, accent: "#fb923c" },
  { name: "DAVE-X", coinsPerDay: 30, accent: "#f472b6" },
  { name: "Wolf Bot", coinsPerDay: 30, accent: "#94a3b8" },
  { name: "Keith MD Bot", coinsPerDay: 30, accent: "#fbbf24" },
  { name: "Truth MD Bot", coinsPerDay: 30, accent: "#818cf8" },
];

const FAQS = [
  {
    q: "What are coins and how do they work?",
    a: "Coins are the currency on ANONYMIKETECH. Every bot uses coins per day to stay running. When a bot starts, coins are deducted from your balance daily until the 30-day subscription period ends or you stop the bot.",
  },
  {
    q: "Do I get any free coins?",
    a: "Yes! Every new account automatically receives 100 free coins — enough to run most bots for about 3 days and explore the platform.",
  },
  {
    q: "Can I run multiple bots at once?",
    a: "Yes. You can deploy as many bots as you want. Each bot deducts its own coins per day from your shared balance, so make sure your coin balance covers all running bots.",
  },
  {
    q: "What happens when I run out of coins?",
    a: "Running bots will automatically stop when your coin balance reaches zero. You can top up at any time and restart your bots from the dashboard.",
  },
  {
    q: "How long does a subscription last?",
    a: "Each bot deployment creates a 30-day subscription period. After 30 days the bot stops and you can renew it for another 30 days.",
  },
  {
    q: "Is M-Pesa the only payment method?",
    a: "Currently yes — M-Pesa (Kenya) is supported. International payment options including Visa, Mastercard, and PayPal are coming soon.",
  },
  {
    q: "Are coins refundable?",
    a: "Coins are non-refundable once purchased. If you have any payment issues please contact support.",
  },
];

function openAuthModal(mode: "sign-in" | "sign-up") {
  window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode } }));
}

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const [buyOpen, setBuyOpen] = useState(false);

  const handleBuy = () => {
    if (!isAuthenticated) { openAuthModal("sign-up"); return; }
    setBuyOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-primary/6 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
              <Coins className="w-3.5 h-3.5" />
              Simple coin-based pricing
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black mb-3">
              Pay only for what<br />
              <span className="tech-gradient-text">you actually use</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              No monthly subscriptions. Buy coins once, spend them on any bot, any time.
              New accounts get <span className="text-primary font-bold">100 free coins</span> to start.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full">

        {/* Free tier banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-primary/20 p-5 sm:p-6 mb-10 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ background: "linear-gradient(135deg, rgba(0,229,153,0.07), rgba(0,0,0,0))" }}
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-base sm:text-lg">Every new account gets <span className="text-primary">100 free coins</span></p>
            <p className="text-sm text-muted-foreground mt-0.5">No credit card needed. Enough to run most bots for ~3 days and explore the platform.</p>
          </div>
          {!isAuthenticated && (
            <button
              onClick={() => openAuthModal("sign-up")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-background flex-shrink-0 hover:opacity-90 transition-opacity"
              style={{ background: "#00e599" }}
            >
              <Zap className="w-4 h-4" />
              Get Started Free
            </button>
          )}
        </motion.div>

        {/* Coin packages */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-black mb-2">Coin Packages</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Top up your balance — bigger packs save more per coin.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COIN_PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                className="relative rounded-2xl border flex flex-col overflow-hidden"
                style={{
                  borderColor: pkg.popular ? `${pkg.color}40` : "rgba(255,255,255,0.08)",
                  background: pkg.popular
                    ? `linear-gradient(145deg, rgba(0,229,153,0.07) 0%, rgba(0,0,0,0) 100%)`
                    : "rgba(255,255,255,0.02)",
                }}
              >
                {pkg.badge && (
                  <div
                    className="absolute top-0 left-0 right-0 text-center py-1.5 text-[11px] font-bold"
                    style={{
                      background: pkg.popular ? pkg.color : `${pkg.color}20`,
                      color: pkg.popular ? "#0a0a0f" : pkg.color,
                    }}
                  >
                    {pkg.popular && <Star className="w-3 h-3 inline mr-1 mb-0.5" />}
                    {pkg.badge}
                  </div>
                )}

                <div className={`p-5 sm:p-6 flex flex-col flex-1 ${pkg.badge ? "pt-10" : ""}`}>
                  <p className="text-xs font-semibold mb-3" style={{ color: "#71717a" }}>{pkg.bestFor}</p>

                  <div className="flex items-baseline gap-1.5 mb-1">
                    <Coins className="w-5 h-5 mb-0.5" style={{ color: pkg.color }} />
                    <span className="text-4xl font-display font-black" style={{ color: pkg.color }}>
                      {pkg.coins.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">coins</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{pkg.description}</p>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/8">
                      <span className="text-2xl font-display font-black">KES {pkg.kesAmount}</span>
                      <span className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: `${pkg.color}15`, color: pkg.color }}>
                        KES {pkg.perCoin.toFixed(2)}/coin
                      </span>
                    </div>

                    <button
                      onClick={handleBuy}
                      className="w-full py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                      style={{
                        background: pkg.popular ? pkg.color : `${pkg.color}20`,
                        color: pkg.popular ? "#0a0a0f" : pkg.color,
                        border: pkg.popular ? "none" : `1px solid ${pkg.color}30`,
                      }}
                    >
                      Buy {pkg.name}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bot costs table */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-black mb-2">What Does Each Bot Cost?</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Each bot has a fixed coin rate per day. 30 days = one subscription cycle.</p>
          </div>

          <div className="rounded-2xl border border-white/8 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 px-5 py-3 border-b border-white/8" style={{ background: "rgba(255,255,255,0.03)" }}>
              <span className="text-xs font-semibold col-span-2" style={{ color: "#71717a" }}>BOT</span>
              <span className="text-xs font-semibold text-center" style={{ color: "#71717a" }}>COINS/DAY</span>
              <span className="text-xs font-semibold text-center" style={{ color: "#71717a" }}>30-DAY TOTAL</span>
            </div>

            {BOT_COSTS.map((bot, i) => (
              <div
                key={bot.name}
                className="grid grid-cols-4 px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors items-center"
              >
                <div className="col-span-2 flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-6 rounded-full flex-shrink-0"
                    style={{ background: bot.accent }}
                  />
                  <span className="text-sm font-medium">{bot.name}</span>
                  {bot.coinsPerDay === 50 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold hidden sm:inline"
                      style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}>
                      Premium
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Coins className="w-3.5 h-3.5" style={{ color: bot.accent }} />
                  <span className="font-bold text-sm" style={{ color: bot.accent }}>{bot.coinsPerDay}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-bold text-sm">{bot.coinsPerDay * 30}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-center mt-3" style={{ color: "#52525b" }}>
            Coins are deducted daily from your shared balance. Running multiple bots multiplies the daily cost.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-black mb-2">How It Works</h2>
            <p className="text-muted-foreground text-sm">Simple 4-step process to get your bot online.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, step: "01", title: "Sign Up Free", desc: "Create an account and receive 100 free coins instantly — no card required.", color: "#00e599" },
              { icon: Coins, step: "02", title: "Buy Coins", desc: "Top up via M-Pesa. Coins are instantly credited to your account.", color: "#38bdf8" },
              { icon: Bot, step: "03", title: "Pick a Bot", desc: "Browse the marketplace, grab your session key from the bot's pairing site.", color: "#a78bfa" },
              { icon: CheckCircle2, step: "04", title: "Go Live", desc: "Paste your session key, name your bot, hit Deploy — it's online in seconds.", color: "#fb923c" },
            ].map(({ icon: Icon, step, title, desc, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: "#52525b" }}>STEP {step}</span>
                </div>
                <p className="font-bold text-sm mb-1.5">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features included */}
        <div className="mb-14 rounded-2xl border border-white/8 bg-white/[0.02] p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-display font-black mb-6 text-center">Everything Included — No Hidden Fees</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: Shield, text: "Secure, isolated bot containers" },
              { icon: Clock, text: "30-day subscription per deploy" },
              { icon: Bot, text: "9 bots available to deploy" },
              { icon: Zap, text: "100 free coins on signup" },
              { icon: CheckCircle2, text: "Instant coin crediting via M-Pesa" },
              { icon: MessageCircle, text: "WhatsApp pairing support" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.025] border border-white/6">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-black mb-2">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQS.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="group rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden"
              >
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none select-none hover:bg-white/[0.03] transition-colors">
                  <span className="font-semibold text-sm sm:text-base pr-4">{faq.q}</span>
                  <span className="text-muted-foreground text-lg leading-none flex-shrink-0 group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center rounded-2xl border border-primary/15 p-8 sm:p-12"
          style={{ background: "linear-gradient(135deg, rgba(0,229,153,0.06), rgba(34,211,238,0.03))" }}
        >
          <h2 className="text-2xl sm:text-3xl font-display font-black mb-3">Ready to deploy your first bot?</h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">Start free. No card needed. 100 coins waiting for you.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {isAuthenticated ? (
              <button
                onClick={() => setBuyOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-background hover:opacity-90 transition-opacity"
                style={{ background: "#00e599" }}
              >
                <Coins className="w-4 h-4" />
                Buy Coins
              </button>
            ) : (
              <button
                onClick={() => openAuthModal("sign-up")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-background hover:opacity-90 transition-opacity"
                style={{ background: "#00e599" }}
              >
                <Zap className="w-4 h-4" />
                Create Free Account
              </button>
            )}
            <Link href="/bots" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-white/15 hover:bg-white/5 transition-colors">
              <Bot className="w-4 h-4" />
              Browse Bots
            </Link>
          </div>
        </motion.div>
      </div>

      <BuyCoinsModal open={buyOpen} onClose={() => setBuyOpen(false)} />
      <Footer />
    </div>
  );
}
