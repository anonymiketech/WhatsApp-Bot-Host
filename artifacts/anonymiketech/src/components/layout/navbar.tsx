import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetMe } from "@/hooks/use-users";
import { Coins, LogOut, Bot, Plus, Menu, X, Store, UserCircle, Tag, LogIn, UserPlus } from "lucide-react";
import logoImg from "@assets/WhatsApp_Image_2025-06-30_at_3.43.38_PM_1776199339550.jpeg";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BuyCoinsModal } from "@/components/coins/buy-coins-modal";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { AuthModal } from "@/components/auth/auth-modal";

function UserAvatar({ src, name, size = 36 }: { src?: string | null; name?: string | null; size?: number }) {
  const initials = name ? name[0].toUpperCase() : "U";
  if (src) {
    return <img src={src} alt="Profile" className="rounded-full object-cover border-2 border-primary/20 flex-shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold border-2 border-primary/20 flex-shrink-0"
      style={{ width: size, height: size, background: "linear-gradient(135deg, rgba(0,229,153,0.2), rgba(34,211,238,0.2))", fontSize: size * 0.38, color: "#00e599" }}
    >
      {initials}
    </div>
  );
}

export function Navbar() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useGetMe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [buyCoinsOpen, setBuyCoinsOpen] = useState(false);
  const [authModal, setAuthModal] = useState<"sign-in" | "sign-up" | null>(null);
  const [location] = useLocation();

  useEffect(() => {
    const handler = (e: Event) => {
      const { mode } = (e as CustomEvent).detail ?? {};
      if (mode === "sign-in" || mode === "sign-up") setAuthModal(mode);
    };
    window.addEventListener("open-auth-modal", handler);
    return () => window.removeEventListener("open-auth-modal", handler);
  }, []);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 text-sm rounded-lg transition-colors font-medium",
        location === href
          ? "text-primary bg-primary/8"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      {label}
    </Link>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group">
            <img
              src={logoImg}
              alt="Logo"
              className="h-9 sm:h-10 w-9 sm:w-10 object-contain rounded-xl group-hover:opacity-90 transition-opacity flex-shrink-0"
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
          </Link>

          {/* Center nav (desktop) */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLink("/pricing", "Pricing")}
            {isAuthenticated && navLink("/bots", "Marketplace")}
            {isAuthenticated && navLink("/partners", "Partners")}
            {isAuthenticated && navLink("/dashboard", "Dashboard")}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Auth buttons (logged out, desktop) */}
            {!isLoading && !isAuthenticated && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setAuthModal("sign-in")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-semibold transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => setAuthModal("sign-up")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-background hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,229,153,0.3)] text-sm font-bold transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </button>
              </div>
            )}

            {/* Coins badge */}
            {isAuthenticated && (
              <button
                onClick={() => setBuyCoinsOpen(true)}
                className="flex items-center bg-secondary/50 rounded-full p-1 pr-2.5 sm:pr-4 border border-white/5 hover:border-primary/30 hover:bg-secondary/80 transition-all group"
                title="Buy Coins"
              >
                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-primary to-accent text-background group-hover:opacity-90 transition-opacity flex-shrink-0">
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <div className="flex items-center gap-1 ml-1.5 sm:ml-3">
                  <Coins className="w-3.5 h-3.5 text-primary" />
                  <span className={cn("font-mono font-bold text-xs sm:text-sm", isProfileLoading ? "opacity-0" : "opacity-100 transition-opacity")}>
                    {profile?.coins ?? 0}
                  </span>
                </div>
              </button>
            )}

            {/* Bell */}
            {isAuthenticated && <NotificationsBell />}

            {/* Avatar → Profile (desktop only) */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-3">
                <Link href="/profile" className="flex items-center gap-2.5 group" title="My Profile">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
                      {profile?.firstName || user?.firstName || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">{user?.email}</span>
                  </div>
                  <UserAvatar
                    src={profile?.profileImageUrl ?? user?.profileImageUrl}
                    name={profile?.firstName || user?.firstName}
                    size={36}
                  />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-destructive transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-out menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/8 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  Pricing
                </Link>

                {!isLoading && !isAuthenticated && (
                  <div className="flex flex-col gap-2 px-2 pt-1 pb-2 border-t border-white/5 mt-1">
                    <button
                      onClick={() => { setAuthModal("sign-in"); setMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </button>
                    <button
                      onClick={() => { setAuthModal("sign-up"); setMobileMenuOpen(false); }}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-primary text-background hover:bg-primary/90 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Get Started Free
                    </button>
                  </div>
                )}

                {isAuthenticated && (
                  <>
                    <Link
                      href="/bots"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      <Store className="w-4 h-4" />
                      Marketplace
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      <Bot className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => { setBuyCoinsOpen(true); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-colors w-full text-left"
                    >
                      <Coins className="w-4 h-4" />
                      Buy Coins
                    </button>

                    <div className="px-4 py-3 flex items-center gap-3 border-t border-white/5 mt-1">
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 flex-1">
                        <UserAvatar
                          src={profile?.profileImageUrl ?? user?.profileImageUrl}
                          name={profile?.firstName || user?.firstName}
                          size={36}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{profile?.firstName || user?.firstName || "User"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </Link>
                      <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                        <UserCircle className="w-4 h-4 text-muted-foreground" />
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="flex items-center gap-2 text-sm text-destructive/80 hover:text-destructive px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <BuyCoinsModal open={buyCoinsOpen} onClose={() => setBuyCoinsOpen(false)} />

      {authModal && (
        <AuthModal
          open={true}
          onOpenChange={(v) => { if (!v) setAuthModal(null); }}
          mode={authModal}
        />
      )}
    </>
  );
}
