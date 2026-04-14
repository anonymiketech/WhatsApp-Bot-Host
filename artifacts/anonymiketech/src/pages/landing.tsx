import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link, useLocation } from "wouter";
import { Shield, Zap, ArrowRight, Server, Coins, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { AuthModal } from "@/components/auth/auth-modal";
import { DeployBotModal } from "@/components/bots/deploy-bot-modal";
import { Footer } from "@/components/layout/footer";
import { PartnerCTASection } from "@/components/layout/partner-cta-section";
import logoImg from "@assets/WhatsApp_Image_2025-06-30_at_3.43.38_PM_1776199339550.jpeg";
import { FEATURED_BOT, OTHER_BOTS, type BotDefinition } from "@/data/bots-catalog";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [selectedBot, setSelectedBot] = useState<BotDefinition | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative z-10 flex flex-col flex-1">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 w-full h-16 sm:h-20 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group">
            <img src={logoImg} alt="Logo" className="h-9 sm:h-10 w-9 sm:w-10 object-contain rounded-xl flex-shrink-0" style={{ imageRendering: "high-quality" }} />
            <div className="flex flex-col items-center leading-none">
              <span className="font-display font-bold tracking-widest text-foreground">
                <span className="text-sm sm:hidden">AMT</span>
                <span className="hidden sm:inline text-xl">ANONYMIKETECH</span>
              </span>
              <span className="text-[7px] sm:text-[9px] font-semibold tracking-[0.22em] text-primary/70 uppercase mt-0.5 whitespace-nowrap text-center w-full">Rock &amp; Roll</span>
            </div>
          </Link>
        </nav>
      </div>
      <Footer />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <DeployBotModal bot={selectedBot} open={!!selectedBot} onOpenChange={(open) => !open && setSelectedBot(null)} />
    </div>
  );
}
