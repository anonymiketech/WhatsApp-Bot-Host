import { Link } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { useGetMe, useAddCoins } from "@/hooks/use-users";
import { Coins, LogOut, Loader2, Bot as BotIcon, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useGetMe();
  const { mutate: addCoins, isPending: isAddingCoins } = useAddCoins();
  const [showAddSuccess, setShowAddSuccess] = useState(false);

  const handleAddCoins = () => {
    addCoins({ amount: 100 }, {
      onSuccess: () => {
        setShowAddSuccess(true);
        setTimeout(() => setShowAddSuccess(false), 2000);
      }
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 group-hover:border-primary/60 transition-colors">
            <BotIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display font-bold text-xl tracking-widest text-foreground hidden sm:block">
            ANONYMIKETECH
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/bots" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors font-medium">
            Marketplace
          </Link>
        </div>

        {/* User Actions */}
        {isAuthenticated && (
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Coins Display */}
            <div className="flex items-center bg-secondary/50 rounded-full p-1 pr-4 border border-white/5">
              <button 
                onClick={handleAddCoins}
                disabled={isAddingCoins}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent text-background hover:opacity-90 transition-opacity disabled:opacity-50 relative"
                title="Add 100 Coins (Test)"
              >
                {isAddingCoins ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                
                {showAddSuccess && (
                  <span className="absolute -top-8 text-primary text-xs font-bold animate-in slide-in-from-bottom-2 fade-in whitespace-nowrap">
                    +100
                  </span>
                )}
              </button>
              
              <div className="flex items-center gap-2 ml-3">
                <Coins className="w-4 h-4 text-primary" />
                <span className={cn(
                  "font-mono font-bold text-sm", 
                  isProfileLoading ? "opacity-0" : "opacity-100 transition-opacity"
                )}>
                  {profile?.coins ?? 0}
                </span>
              </div>
            </div>

            {/* Profile Menu */}
            <div className="flex items-center gap-3 border-l border-white/10 pl-4 sm:pl-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-foreground">{user?.firstName || 'User'}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="Profile" className="w-10 h-10 rounded-full border-2 border-primary/20" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border-2 border-primary/20">
                  {(user?.firstName?.[0] || 'U').toUpperCase()}
                </div>
              )}
              
              <button 
                onClick={logout}
                className="ml-2 p-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-destructive transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
          </div>
        )}
      </div>
    </nav>
  );
}
