import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetMe } from "@/hooks/use-users";
import { Coins, LogOut, Bot, Plus, Menu, X, Store, UserCircle, Tag, LogIn, UserPlus } from "lucide-react";
import logoImg from "@assets/WhatsApp_Image_2025-06-30_at_3.43.38_PM_1776199339550.jpeg";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BuyCoinsModal } from "@/components/payments/buy-coins-modal";

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const { data: me, isLoading: meLoading } = useGetMe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [buyCoinsOpen, setBuyCoinsOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLink = (href: string, label: string) => (
    <Link href={href} className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors", location === href ? "text-foreground bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>{label}</Link>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group">
            <img src={logoImg} alt="Logo" className="h-9 sm:h-10 w-9 sm:w-10 object-contain rounded-xl group-hover:opacity-90 transition-opacity flex-shrink-0" style={{ imageRendering: "high-quality" }} />
            <div className="flex flex-col items-center leading-none">
              <span className="font-display font-bold tracking-widest text-foreground">
                <span className="text-sm sm:hidden">AMT</span>
                <span className="hidden sm:inline text-xl">ANONYMIKETECH</span>
              </span>
              <span className="text-[7px] sm:text-[9px] font-semibold tracking-[0.22em] text-primary/70 uppercase mt-0.5 whitespace-nowrap text-center w-full">Rock &amp; Roll</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLink("/pricing", "Pricing")}
            {isAuthenticated && navLink("/bots", "Marketplace")}
            {navLink("/partners", "Partners")}
          </div>
        </div>
      </nav>
      <BuyCoinsModal open={buyCoinsOpen} onOpenChange={setBuyCoinsOpen} />
    </>
  );
}
