import { useState } from "react";
import { useStartBot, useStopBot, useRestartBot, useRenewBot, useDeleteBot } from "@/hooks/use-bots";
import {
  Play, Square, RotateCcw, Loader2, Clock, Coins, Cpu,
  AlertTriangle, RefreshCw, CheckCircle2, Server, Trash2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    running:  "bg-primary",
    starting: "bg-yellow-400",
    stopping: "bg-orange-400",
    stopped:  "bg-muted-foreground",
  };
  const color = colors[status] ?? "bg-muted-foreground";
  const pulse = status === "running" || status === "starting" || status === "stopping";

  return (
    <span className="relative flex h-2 w-2">
      {pulse && (
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)} />
      )}
      <span className={cn("relative inline-flex rounded-full h-2 w-2", color)} />
    </span>
  );
}

function statusLabel(status: string, isExpired: boolean) {
  if (isExpired) return "Expired";
  const map: Record<string, string> = {
    running:  "Running",
    starting: "Starting…",
    stopping: "Stopping…",
    stopped:  "Stopped",
  };
  return map[status] ?? status;
}

function statusColor(status: string, isExpired: boolean) {
  if (isExpired) return "text-destructive";
  const map: Record<string, string> = {
    running:  "text-primary",
    starting: "text-yellow-400",
    stopping: "text-orange-400",
    stopped:  "text-muted-foreground",
  };
  return map[status] ?? "text-muted-foreground";
}

function DeleteConfirmDialog({
  botName,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  botName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute inset-0 z-10 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
      style={{ background: "rgba(10,10,10,0.96)", backdropFilter: "blur(8px)" }}
    >
      <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/25 flex items-center justify-center mb-4">
        <Trash2 className="w-5 h-5 text-destructive" />
      </div>
      <h4 className="font-bold text-base mb-1">Delete this bot?</h4>
      <p className="text-xs text-muted-foreground mb-5 max-w-[220px] leading-relaxed">
        <span className="font-semibold text-foreground">"{botName}"</span> will be permanently removed from your account and stopped on the hosting panel. This cannot be undone.
      </p>
      <div className="flex gap-2 w-full">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-secondary border border-white/8 hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive hover:text-white hover:border-transparent transition-all disabled:opacity-60"
        >
          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </motion.div>
  );
}

export function BotCard({ bot }: BotCardProps) {
  const { mutate: startBot, isPending: isStarting } = useStartBot();
  const { mutate: stopBot,  isPending: isStopping  } = useStopBot();
  const { mutate: restartBot, isPending: isRestarting } = useRestartBot();
  const { mutate: renewBot, isPending: isRenewing } = useRenewBot();
  const { mutate: deleteBot, isPending: isDeleting } = useDeleteBot();
  const [renewError, setRenewError] = useState<string | null>(null);
  const [renewSuccess, setRenewSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isRunning = bot.status === "running";
  const isTransitioning = bot.status === "starting" || bot.status === "stopping";
  const isBusy = isStarting || isStopping || isRestarting || isTransitioning;
  const hasPtero = Boolean(bot.pterodactylServerId);
  const daysLeft = getDaysRemaining(bot.expiresAt);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 5;

  const onAction = (
    fn: (args: { botId: string }, opts?: { onError?: (e: Error) => void }) => void,
    botId: string,
  ) => {
    setActionError(null);
    fn({ botId }, {
      onError: (e) => setActionError(e.message || "Action failed. Try again."),
    });
  };

  const handleRenew = () => {
    setRenewError(null);
    renewBot({ botId: bot.id }, {
      onSuccess: () => {
        setRenewSuccess(true);
        setTimeout(() => setRenewSuccess(false), 3000);
      },
      onError: (err) => setRenewError(err.message || "Failed to renew. Check your coin balance."),
    });
  };

  const handleDeleteConfirm = () => {
    deleteBot({ botId: bot.id });
  };

  const cardBorder =
    isExpired        ? "border-destructive/20" :
    isRunning        ? "border-primary/30 shadow-[0_4px_30px_rgba(0,229,153,0.06)]" :
    isTransitioning  ? "border-yellow-500/20" :
    "border-white/5 hover:border-white/10";

  return (
    <div className={cn(
      "glass-panel rounded-2xl p-6 transition-all duration-300 relative group overflow-hidden flex flex-col gap-5",
      cardBorder,
    )}>
      {isRunning && !isExpired && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
      )}

      {/* Delete confirm overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirmDialog
            botName={bot.name}
            isDeleting={isDeleting}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "p-2.5 rounded-xl border transition-colors flex-shrink-0",
            isExpired        ? "bg-destructive/10 text-destructive border-destructive/20" :
            isRunning        ? "bg-primary/10 text-primary border-primary/20" :
            isTransitioning  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
            "bg-secondary text-muted-foreground border-white/5 group-hover:text-foreground",
          )}>
            <Cpu className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-base text-foreground leading-tight truncate">{bot.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <StatusDot status={bot.status} />
              <span className={cn("text-xs font-semibold uppercase tracking-wider", statusColor(bot.status, isExpired))}>
                {statusLabel(bot.status, isExpired)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Pterodactyl badge */}
          {hasPtero && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/60 border border-white/5">
              <Server className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">Panel</span>
            </div>
          )}
          {/* Delete button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete this bot"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
          isExpired      ? "bg-destructive/5 border-destructive/20" :
          isExpiringSoon ? "bg-yellow-500/5 border-yellow-500/20" :
          "bg-secondary/50 border-white/5",
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
            isExpired      ? "text-destructive" :
            isExpiringSoon ? "text-yellow-400" : "text-foreground",
          )}>
            {bot.expiresAt ? (daysLeft !== null && daysLeft > 0 ? `${daysLeft}d left` : "Expired") : "—"}
          </p>
          {bot.expiresAt && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{formatExpiry(bot.expiresAt)}</p>
          )}
        </div>
      </div>

      {/* Expiry warning */}
      {(isExpiringSoon || isExpired) && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
            isExpired
              ? "bg-destructive/10 border border-destructive/20 text-destructive"
              : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400",
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {isExpired
            ? "Subscription expired. Renew to keep your bot running."
            : `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — renew before it stops.`}
        </motion.div>
      )}

      {/* Action error */}
      {actionError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
        >
          {actionError}
        </motion.p>
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

      {/* Action buttons */}
      <div className="flex flex-col gap-2 mt-auto">
        {/* Renew — when expired or expiring soon */}
        {(isExpired || isExpiringSoon) && (
          <button
            onClick={handleRenew}
            disabled={isRenewing}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-primary/10 text-primary border border-primary/25 hover:bg-primary hover:text-background hover:border-transparent transition-all hover:shadow-[0_0_18px_rgba(0,229,153,0.3)] disabled:opacity-60"
          >
            {isRenewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isRenewing ? "Renewing…" : `Renew (${bot.coinsPerMonth} coins / 30 days)`}
          </button>
        )}

        {/* Start / Stop / Restart row */}
        {!isExpired && (
          <div className="flex gap-2">
            {/* Start button — when stopped */}
            {!isRunning && (
              <button
                onClick={() => onAction(startBot, bot.id)}
                disabled={isBusy}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all",
                  isBusy
                    ? "opacity-60 cursor-not-allowed bg-secondary border border-white/5"
                    : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-background hover:shadow-[0_0_15px_rgba(0,229,153,0.3)] hover:-translate-y-0.5 active:translate-y-0",
                )}
              >
                {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {isStarting ? "Starting…" : "Start"}
              </button>
            )}

            {/* Stop button — when running */}
            {isRunning && (
              <button
                onClick={() => onAction(stopBot, bot.id)}
                disabled={isBusy}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all border",
                  isBusy
                    ? "opacity-60 cursor-not-allowed bg-secondary border-white/5"
                    : "bg-secondary text-foreground border-white/5 hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 hover:-translate-y-0.5 active:translate-y-0",
                )}
              >
                {isStopping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-current" />}
                {isStopping ? "Stopping…" : "Stop"}
              </button>
            )}

            {/* Restart button — only when running AND has Pterodactyl */}
            {isRunning && hasPtero && (
              <button
                onClick={() => onAction(restartBot, bot.id)}
                disabled={isBusy}
                title="Restart bot on panel"
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border",
                  isBusy
                    ? "opacity-60 cursor-not-allowed bg-secondary border-white/5"
                    : "bg-secondary/80 text-muted-foreground border-white/5 hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/25 hover:-translate-y-0.5 active:translate-y-0",
                )}
              >
                {isRestarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                {isRestarting ? "Restarting…" : "Restart"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
