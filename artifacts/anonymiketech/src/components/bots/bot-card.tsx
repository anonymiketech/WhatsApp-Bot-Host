import { useState } from "react";
import { useStartBot, useStopBot, useRenewBot } from "@/hooks/use-bots";
import {
  Play, Square, Loader2, Clock, Coins, Cpu,
  AlertTriangle, RefreshCw, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Bot } from "@/types/bots";

export type { Bot };

interface BotCardProps {
  bot: Bot;
}

function getDaysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "—";
  return new Date(expiresAt).toLocaleDateString("en-KE", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function BotCard({ bot }: BotCardProps) {
  const { mutate: startBot, isPending: isStarting } = useStartBot();
  const { mutate: stopBot, isPending: isStopping } = useStopBot();
  const { mutate: renewBot, isPending: isRenewing } = useRenewBot();
  const [renewError, setRenewError] = useState<string | null>(null);
  const [renewSuccess, setRenewSuccess] = useState(false);

  const isRunning = bot.status === "running";
  const isBusy = isStarting || isStopping;
  const daysLeft = getDaysRemaining(bot.expiresAt);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 5;

  const handleToggle = () => {
    if (isRunning) {
      stopBot({ botId: bot.id });
    } else {
      startBot({ botId: bot.id });
    }
  };

  const handleRenew = () => {
    setRenewError(null);
    renewBot({ botId: bot.id }, {
      onSuccess: () => {
        setRenewSuccess(true);
        setTimeout(() => setRenewSuccess(false), 3000);
      },
      onError: (err) => {
        setRenewError(err.message || "Failed to renew. Check your coin balance.");
      },
    });
  };

  return (
    <div className={cn(
      "glass-panel rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden flex flex-col gap-5",
      isExpired ? "border-destructive/20" :
      isRunning ? "border-primary/30 shadow-[0_4px_30px_rgba(0,229,153,0.05)]" :
      "border-white/5 hover:border-white/10"
    )}>

      {isRunning && !isExpired && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl border transition-colors",
            isExpired ? "bg-destructive/10 text-destructive border-destructive/20" :
            isRunning ? "bg-primary/10 text-primary border-primary/20" :
            "bg-secondary text-muted-foreground border-white/5 group-hover:text-foreground"
          )}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground leading-tight line-clamp-1">{bot.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                {isRunning && !isExpired && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                )}
                <span className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  isExpired ? "bg-destructive" :
                  isRunning ? "bg-primary" : "bg-muted-foreground"
                )} />
              </span>
              <span className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                isExpired ? "text-destructive" :
                isRunning ? "text-primary" : "text-muted-foreground"
              )}>
                {isExpired ? "Expired" : bot.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Coins className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Monthly</span>
          </div>
          <p className="text-sm font-bold text-foreground">
            {bot.coinsPerMonth} <span className="text-xs font-normal text-muted-foreground">coins</span>
          </p>
        </div>

        <div className={cn(
          "rounded-xl p-3 border relative overflow-hidden",
          isExpired ? "bg-destructive/5 border-destructive/20" :
          isExpiringSoon ? "bg-yellow-500/5 border-yellow-500/20" :
          "bg-secondary/50 border-white/5"
        )}>
          {isRunning && !isExpired && !isExpiringSoon && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-primary animate-pulse w-full" />
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">Expires</span>
          </div>
          <p className={cn(
            "text-xs font-bold",
            isExpired ? "text-destructive" :
            isExpiringSoon ? "text-yellow-400" : "text-foreground"
          )}>
            {bot.expiresAt ? (
              daysLeft !== null && daysLeft > 0
                ? `${daysLeft}d left`
                : "Expired"
            ) : "—"}
          </p>
          {bot.expiresAt && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{formatExpiry(bot.expiresAt)}</p>
          )}
        </div>
      </div>

      {/* Expiry warning banner */}
      {(isExpiringSoon || isExpired) && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
            isExpired
              ? "bg-destructive/10 border border-destructive/20 text-destructive"
              : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {isExpired
            ? "Subscription expired. Renew to keep your bot running."
            : `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — renew before it stops.`}
        </motion.div>
      )}

      {/* Renew error */}
      {renewError && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {renewError}
        </p>
      )}

      {/* Renew success */}
      {renewSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2"
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Renewed for 30 days!
        </motion.div>
      )}

      {/* Actions */}
      <div className={cn("flex gap-2 mt-auto", (isExpiringSoon || isExpired) ? "flex-col" : "flex-row")}>
        {/* Renew button — shown when expired or expiring soon */}
        {(isExpired || isExpiringSoon) && (
          <button
            onClick={handleRenew}
            disabled={isRenewing}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-primary/10 text-primary border border-primary/25 hover:bg-primary hover:text-background hover:border-transparent transition-all hover:shadow-[0_0_18px_rgba(0,229,153,0.3)] disabled:opacity-60"
          >
            {isRenewing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isRenewing ? "Renewing…" : `Renew (${bot.coinsPerMonth} coins / 30 days)`}
          </button>
        )}

        {/* Start / Stop button */}
        {!isExpired && (
          <button
            onClick={handleToggle}
            disabled={isBusy}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200",
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
              ? (isRunning ? "Stopping…" : "Starting…")
              : (isRunning ? "Stop Bot" : "Start Bot")}
          </button>
        )}
      </div>
    </div>
  );
}
