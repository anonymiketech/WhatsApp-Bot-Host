import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle, Megaphone, ExternalLink, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
  useDeleteAllNotifications,
  type AppNotification,
} from "@/hooks/use-notifications";
import { Link } from "wouter";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_CONFIG: Record<AppNotification["type"], { Icon: typeof Info; color: string; bg: string }> = {
  success: { Icon: CheckCircle2, color: "#00e599", bg: "rgba(0,229,153,0.10)" },
  info:    { Icon: Info,         color: "#22d3ee", bg: "rgba(34,211,238,0.10)" },
  warning: { Icon: AlertTriangle,color: "#facc15", bg: "rgba(250,204,21,0.10)" },
  error:   { Icon: XCircle,      color: "#f87171", bg: "rgba(248,113,113,0.10)" },
  update:  { Icon: Megaphone,    color: "#a78bfa", bg: "rgba(167,139,250,0.10)" },
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteOne = useDeleteNotification();
  const deleteAll = useDeleteAllNotifications();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNotifClick = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.link) setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/8 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5">
            <span className="relative flex h-3 w-3">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "#00e599" }}
              />
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ background: "#00e599" }}
              />
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
            style={{ background: "hsl(240 10% 6%)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" style={{ color: "#00e599" }} />
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(0,229,153,0.15)", color: "#00e599" }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-white/8 transition-colors"
                    style={{ color: "#a1a1aa" }}
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">All read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => deleteAll.mutate()}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                    style={{ color: "#71717a" }}
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/8 transition-colors" style={{ color: "#71717a" }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                  <Bell className="w-8 h-8 opacity-20" />
                  <p className="text-sm font-medium">No notifications</p>
                  <p className="text-xs" style={{ color: "#71717a" }}>
                    You'll be notified when bots are deployed, payments complete, or account changes happen.
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((n) => {
                    const { Icon, color, bg } = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
                    const inner = (
                      <div
                        className="flex gap-3 px-4 py-3 group/item transition-colors hover:bg-white/4 border-b border-white/5 last:border-0"
                        style={!n.read ? { background: "rgba(255,255,255,0.02)" } : {}}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: bg }}
                        >
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleNotifClick(n)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold leading-tight">{n.title}</p>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#00e599" }} />
                            )}
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#a1a1aa" }}>{n.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px]" style={{ color: "#71717a" }}>{timeAgo(n.createdAt)}</span>
                            {n.link && (
                              <span className="text-[10px] flex items-center gap-0.5" style={{ color: "#00e599" }}>
                                View <ExternalLink className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Dismiss button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteOne.mutate(n.id); }}
                          className="opacity-0 group-hover/item:opacity-100 flex-shrink-0 p-1 rounded-lg hover:bg-red-500/15 transition-all self-start mt-0.5"
                          style={{ color: "#71717a" }}
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );

                    return n.link ? (
                      <Link key={n.id} href={n.link}>{inner}</Link>
                    ) : (
                      <div key={n.id}>{inner}</div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
