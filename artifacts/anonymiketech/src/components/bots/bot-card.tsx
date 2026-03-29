import { useEffect, useState } from "react";
import type { Bot } from "@workspace/api-client-react";
import { useStartBot, useStopBot } from "@/hooks/use-bots";
import { Play, Square, Loader2, Clock, Zap, Cpu, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotCardProps {
  bot: Bot;
}

export function BotCard({ bot }: BotCardProps) {
  const { mutate: startBot, isPending: isStarting } = useStartBot();
  const { mutate: stopBot, isPending: isStopping } = useStopBot();
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--");
  const [isExpired, setIsExpired] = useState(false);

  const isRunning = bot.status === "running";
  const isBusy = isStarting || isStopping;

  // Countdown timer logic
  useEffect(() => {
    if (!isRunning || !bot.expiresAt) {
      setTimeLeft("--:--:--");
      setIsExpired(false);
      return;
    }

    const expiryTime = new Date(bot.expiresAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        setIsExpired(true);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [bot.status, bot.expiresAt]);

  const handleToggle = () => {
    if (isRunning) {
      stopBot({ botId: bot.id });
    } else {
      startBot({ botId: bot.id });
    }
  };

  return (
    <div className={cn(
      "glass-panel rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden",
      isRunning ? "border-primary/30 shadow-[0_4px_30px_rgba(0,229,153,0.05)]" : "border-white/5 hover:border-white/10"
    )}>
      
      {/* Background glow if running */}
      {isRunning && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl border transition-colors",
            isRunning ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground border-white/5 group-hover:text-foreground"
          )}>
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-foreground tracking-wide leading-tight line-clamp-1">{bot.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                {isRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isRunning ? "bg-primary" : "bg-muted-foreground"
                )}></span>
              </span>
              <span className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                isRunning ? "text-primary" : "text-muted-foreground"
              )}>
                {bot.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-secondary/50 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Cost</span>
          </div>
          <p className="text-sm font-bold text-foreground">
            {bot.coins} <span className="text-xs font-normal text-muted-foreground">Coins/24h</span>
          </p>
        </div>
        
        <div className="bg-secondary/50 rounded-xl p-3 border border-white/5 relative overflow-hidden">
          {isRunning && !isExpired && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-primary animate-[pulse_2s_ease-in-out_infinite]" style={{width: '100%'}} />
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Remaining</span>
          </div>
          <p className={cn(
            "text-sm font-mono font-bold",
            isExpired ? "text-destructive" : "text-foreground"
          )}>
            {timeLeft}
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={isBusy || (isRunning && isExpired)}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold tracking-wide transition-all duration-200",
          isBusy ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0",
          isRunning 
            ? "bg-secondary text-foreground hover:bg-destructive/20 hover:text-destructive border border-white/5 hover:border-destructive/30" 
            : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-background hover:shadow-[0_0_15px_rgba(0,229,153,0.3)]"
        )}
      >
        {isBusy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isRunning ? (
          <Square className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current" />
        )}
        
        {isBusy 
          ? (isRunning ? "Stopping..." : "Starting...") 
          : (isRunning ? "Stop Instance" : "Start Instance")
        }
      </button>
      
      {!isRunning && (
        <p className="text-center text-[10px] text-muted-foreground mt-3 font-medium">
          Starting consumes {bot.coins} coins for 24 hours
        </p>
      )}
    </div>
  );
}
