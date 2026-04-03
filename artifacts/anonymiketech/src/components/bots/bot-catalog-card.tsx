import { Zap, Coins, Github, Star, AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";
import type { BotDefinition } from "@/data/bots-catalog";

interface BotCatalogCardProps {
  bot: BotDefinition;
  index?: number;
  onDeploy: (bot: BotDefinition) => void;
  compact?: boolean;
  disabled?: boolean;
  disableMessage?: string | null;
}

export function BotCatalogCard({ bot, index = 0, onDeploy, compact, disabled, disableMessage }: BotCatalogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.055] hover:border-white/15 transition-all overflow-hidden"
      style={disabled ? { opacity: 0.75 } : undefined}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all group-hover:w-1"
        style={{ background: disabled ? "linear-gradient(180deg, #f8717100, #f87171, #f8717100)" : `linear-gradient(180deg, ${bot.accent}00, ${bot.accent}, ${bot.accent}00)` }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 border"
              style={{ background: bot.accentBg, borderColor: `${bot.accent}25` }}
            >
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm leading-tight">{bot.name}</span>
                {disabled ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                    Unavailable
                  </span>
                ) : bot.badge ? (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${bot.accent}20`, color: bot.accent }}
                  >
                    {bot.badge}
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{bot.tagline}</p>
            </div>
          </div>

          {/* Coin badge */}
          <div className="flex flex-col items-end flex-shrink-0">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold"
              style={{ background: `${bot.accent}15`, color: bot.accent }}
            >
              <Coins className="w-3 h-3" />
              {bot.coinsPerDay * 30}/mo
            </div>
          </div>
        </div>

        {!compact && (
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">{bot.description}</p>
        )}

        {/* Disabled message */}
        {disabled && (
          <div className="flex items-start gap-2 mb-3 px-3 py-2.5 rounded-xl border border-red-500/15 bg-red-500/5">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: "#fca5a5" }}>
              {disableMessage || "This bot is temporarily unavailable. Please check back soon."}
            </p>
          </div>
        )}

        {/* Feature pills */}
        {!disabled && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {bot.features.slice(0, compact ? 3 : 4).map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded-full border"
                style={{ color: `${bot.accent}cc`, borderColor: `${bot.accent}20`, background: `${bot.accent}08` }}
              >
                {f}
              </span>
            ))}
            {bot.features.length > (compact ? 3 : 4) && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground">
                +{bot.features.length - (compact ? 3 : 4)} more
              </span>
            )}
          </div>
        )}

        {/* Action row */}
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={() => !disabled && onDeploy(bot)}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border disabled:cursor-not-allowed disabled:opacity-50"
            style={disabled ? {
              color: "#71717a",
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
            } : {
              color: bot.accent,
              borderColor: `${bot.accent}35`,
              background: `${bot.accent}10`,
            }}
            onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = `${bot.accent}22`; }}
            onMouseLeave={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = `${bot.accent}10`; }}
          >
            <Zap className="w-3.5 h-3.5" />
            {disabled ? "Unavailable" : "Deploy Bot"}
          </button>

          {bot.githubRepo && (
            <a
              href={bot.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              title="Star on GitHub"
              className="flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex-shrink-0"
              style={{ color: "#e2e8f0" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Github className="w-3.5 h-3.5" />
              <Star className="w-3 h-3 text-yellow-400" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
