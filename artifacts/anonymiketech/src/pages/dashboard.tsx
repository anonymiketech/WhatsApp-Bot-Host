import { useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PairingGuide } from "@/components/bots/pairing-guide";
import { SaveBotForm } from "@/components/bots/save-bot-form";
import { BotCard } from "@/components/bots/bot-card";
import { SectionLoader } from "@/components/ui/section-loader";
import { useGetMyBots } from "@/hooks/use-bots";
import { Bot as BotIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: botsData, isLoading: isBotsLoading } = useGetMyBots();

  useEffect(() => {
    // If not authenticated and not loading auth, we let private routing or the page itself handle it.
    // We are trusting the navbar to show the login state, but dashboard should ideally be protected.
    // For this implementation, we just check isAuthenticated.
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
                    transition={{ duration: 0.4, delay: 0.3 + (idx * 0.1) }}
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
