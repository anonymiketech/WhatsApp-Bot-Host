import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, Bell, Power, Send, AlertTriangle, CheckCircle2,
  Megaphone, Info, XCircle, Loader2, Lock, RefreshCw, Bot,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

interface AdminStatus {
  maintenance: boolean;
  userCount: number;
  notifCount: number;
  recentUsers: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    coins: number;
    createdAt: string;
  }[];
}

const TYPE_OPTIONS = [
  { value: "info", label: "Info", icon: Info, color: "#22d3ee" },
  { value: "success", label: "Success", icon: CheckCircle2, color: "#00e599" },
  { value: "warning", label: "Warning", icon: AlertTriangle, color: "#facc15" },
  { value: "error", label: "Error", icon: XCircle, color: "#f87171" },
  { value: "update", label: "Update", icon: Megaphone, color: "#a78bfa" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const [maintenance, setMaintenance] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  const [notifType, setNotifType] = useState("info");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifLink, setNotifLink] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifResult, setNotifResult] = useState<{ success: boolean; msg: string } | null>(null);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/admin/status", { credentials: "include" });
      if (res.status === 403) { setIsAdminUser(false); setLoadingStatus(false); return; }
      if (!res.ok) throw new Error("Failed");
      const data: AdminStatus = await res.json();
      setStatus(data);
      setMaintenance(data.maintenance);
      setIsAdminUser(true);
    } catch {
      setIsAdminUser(false);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) fetchStatus();
    else if (!isAuthLoading && !isAuthenticated) setLoadingStatus(false);
  }, [isAuthenticated, isAuthLoading]);

  const toggleMaintenance = async () => {
    setTogglingMaintenance(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enabled: !maintenance }),
      });
      if (res.ok) {
        const data = await res.json();
        setMaintenance(data.maintenance);
        if (status) setStatus({ ...status, maintenance: data.maintenance });
      }
    } finally {
      setTogglingMaintenance(false);
    }
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setSendingNotif(true);
    setNotifResult(null);
    try {
      const res = await fetch("/api/admin/notify-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: notifType,
          title: notifTitle.trim(),
          message: notifMessage.trim(),
          link: notifLink.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotifResult({ success: true, msg: `Sent to ${data.sentTo} user${data.sentTo !== 1 ? "s" : ""}` });
        setNotifTitle("");
        setNotifMessage("");
        setNotifLink("");
        fetchStatus();
      } else {
        setNotifResult({ success: false, msg: data.error || "Failed to send" });
      }
    } catch {
      setNotifResult({ success: false, msg: "Network error" });
    } finally {
      setSendingNotif(false);
    }
  };

  if (isAuthLoading || loadingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdminUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-display font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          This panel is restricted. If you're the admin, make sure you're signed in with the correct account and <code className="text-primary text-xs">ADMIN_EMAIL</code> is configured.
        </p>
        <a href="/" className="mt-2 text-sm text-primary hover:underline">← Back to site</a>
      </div>
    );
  }

  const selectedType = TYPE_OPTIONS.find((t) => t.value === notifType) ?? TYPE_OPTIONS[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black">Admin Panel</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 uppercase tracking-widest">
                Restricted
              </span>
            </div>
            <p className="text-sm text-muted-foreground ml-12">ANONYMIKETECH control center · {user?.email}</p>
          </div>
          <button
            onClick={fetchStatus}
            className="p-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { icon: Users, label: "Total Users", value: status?.userCount ?? 0, color: "#22d3ee" },
            { icon: Bell, label: "Total Notifications", value: status?.notifCount ?? 0, color: "#a78bfa" },
            { icon: Bot, label: "Platform", value: "LIVE", color: "#00e599" },
            { icon: Power, label: "Maintenance", value: maintenance ? "ON" : "OFF", color: maintenance ? "#f87171" : "#00e599" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-display font-black" style={{ color }}>{value}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Maintenance Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border p-6"
            style={{
              borderColor: maintenance ? "rgba(248,113,113,0.3)" : "rgba(255,255,255,0.08)",
              background: maintenance
                ? "linear-gradient(135deg, rgba(248,113,113,0.07), transparent)"
                : "rgba(255,255,255,0.02)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: maintenance ? "rgba(248,113,113,0.15)" : "rgba(0,229,153,0.10)", border: `1px solid ${maintenance ? "rgba(248,113,113,0.3)" : "rgba(0,229,153,0.2)"}` }}
              >
                <Power className="w-5 h-5" style={{ color: maintenance ? "#f87171" : "#00e599" }} />
              </div>
              <div>
                <h2 className="font-bold text-base">Maintenance Mode</h2>
                <p className="text-xs text-muted-foreground">Locks the site for all non-admin users</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {maintenance ? (
                <motion.div
                  key="on"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 mb-5 text-sm"
                  style={{ color: "#fca5a5" }}
                >
                  Site is currently <strong>LOCKED</strong>. All visitors see the maintenance page.
                </motion.div>
              ) : (
                <motion.div
                  key="off"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 mb-5 text-sm text-muted-foreground"
                >
                  Site is <strong className="text-foreground">live and accessible</strong> to all users.
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={toggleMaintenance}
              disabled={togglingMaintenance}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{
                background: maintenance ? "rgba(248,113,113,0.15)" : "rgba(248,113,113,0.9)",
                color: maintenance ? "#f87171" : "#fff",
                border: maintenance ? "1px solid rgba(248,113,113,0.3)" : "none",
              }}
            >
              {togglingMaintenance ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              {maintenance ? "Deactivate Maintenance" : "Activate Maintenance"}
            </button>
          </motion.div>

          {/* Broadcast Notification */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/8 bg-white/[0.02] p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="font-bold text-base">Broadcast Notification</h2>
                <p className="text-xs text-muted-foreground">Send to all {status?.userCount ?? 0} users</p>
              </div>
            </div>

            <form onSubmit={sendNotification} className="space-y-3">
              {/* Type selector */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Type</label>
                <div className="flex gap-1.5 flex-wrap">
                  {TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNotifType(opt.value)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                        style={{
                          borderColor: notifType === opt.value ? `${opt.color}50` : "rgba(255,255,255,0.08)",
                          background: notifType === opt.value ? `${opt.color}15` : "transparent",
                          color: notifType === opt.value ? opt.color : "#71717a",
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Notification title..."
                  maxLength={120}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.03] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Message</label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Write your message..."
                  rows={3}
                  maxLength={500}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.03] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Link <span className="font-normal opacity-60">(optional)</span></label>
                <input
                  type="text"
                  value={notifLink}
                  onChange={(e) => setNotifLink(e.target.value)}
                  placeholder="/bots or https://..."
                  className="w-full px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.03] text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>

              <AnimatePresence>
                {notifResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                    style={{
                      background: notifResult.success ? "rgba(0,229,153,0.10)" : "rgba(248,113,113,0.10)",
                      color: notifResult.success ? "#00e599" : "#f87171",
                      border: `1px solid ${notifResult.success ? "rgba(0,229,153,0.20)" : "rgba(248,113,113,0.20)"}`,
                    }}
                  >
                    {notifResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {notifResult.msg}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={sendingNotif || !notifTitle.trim() || !notifMessage.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                style={{ background: selectedType?.color, color: "#0a0a0f" }}
              >
                {sendingNotif ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send to All Users
              </button>
            </form>
          </motion.div>
        </div>

        {/* Recent Users */}
        {status && status.recentUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">Recent Users</h2>
              <span className="text-xs text-muted-foreground ml-auto">{status.userCount} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-muted-foreground">User</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Email</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">Coins</th>
                    <th className="text-right px-5 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {status.recentUsers.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 inline-flex items-center justify-center mr-2 text-xs font-bold text-primary">
                          {(u.firstName?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
                        </div>
                        <span className="font-medium">{u.firstName ?? "—"} {u.lastName ?? ""}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell truncate max-w-[160px]">{u.email ?? "—"}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-xs" style={{ color: "#00e599" }}>{u.coins}</td>
                      <td className="px-5 py-3 text-right text-xs text-muted-foreground hidden md:table-cell">{timeAgo(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
