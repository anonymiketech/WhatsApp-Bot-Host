import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { Bot, Shield, Zap, ArrowRight, Server } from "lucide-react";
import { motion } from "framer-motion";
import { AuthModal } from "@/components/auth/auth-modal";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authModal, setAuthModal] = useState<"sign-in" | "sign-up" | null>(null);

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
    </div>
  );
}
