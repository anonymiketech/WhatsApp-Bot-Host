import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetMe } from "@/hooks/use-users";
import { Coins, LogOut, Bot as BotIcon, Plus, Menu, X, Store } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BuyCoinsModal } from "@/components/coins/buy-coins-modal";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useGetMe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [buyCoinsOpen, setBuyCoinsOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 group-hover:border-primary/60 transition-colors">
              <BotIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-display font-bold tracking-widest text-foreground">
              <span className="text-sm sm:hidden">AMT</span>
              <span className="hidden sm:inline text-xl">ANONYMIKETECH</span>
            </span>
          </Link>

          {/* Center nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <Link
              href="/bots"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors font-medium"
            >
              Marketplace
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors font-medium"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Coins Display + Buy (authenticated) */}
            {isAuthenticated && (
              <button
                onClick={() => setBuyCoinsOpen(true)}
                className="flex items-center bg-secondary/50 rounded-full p-1 pr-3 sm:pr-4 border border-white/5 hover:border-primary/30 hover:bg-secondary/80 transition-all group"
                title="Buy Coins"
              >
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-primary to-accent text-background group-hover:opacity-90 transition-opacity flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 ml-2 sm:ml-3">
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className={cn(
                    "font-mono font-bold text-xs sm:text-sm",
                    isProfileLoading ? "opacity-0" : "opacity-100 transition-opacity"
                  )}>
                    {profile?.coins ?? 0}
                  </span>
                </div>
              </button>
            )}

            {/* Avatar + logout (desktop, authenticated) */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground leading-tight">{user?.firstName || 'User'}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.email}</span>
                </div>
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-9 h-9 rounded-full border-2 border-primary/20 flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border-2 border-primary/20 flex-shrink-0">
                    {(user?.firstName?.[0] || 'U').toUpperCase()}
                  </div>
                )}
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

        {/* Mobile dropdown menu */}
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
                  href="/bots"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <Store className="w-4 h-4" />
                  Marketplace
                </Link>

                {isAuthenticated && (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      <BotIcon className="w-4 h-4" />
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
                      {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" className="w-9 h-9 rounded-full border-2 border-primary/20" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border-2 border-primary/20">
                          {(user?.firstName?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.firstName || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
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
    </>
  );
}
