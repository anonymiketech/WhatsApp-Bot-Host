import { useState, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, Bell, Power, Send, AlertTriangle, CheckCircle2,
  Megaphone, Info, XCircle, Loader2, Lock, RefreshCw, Bot,
  Eye, EyeOff, LogOut,
} from "lucide-react";
import { AdminNavbar } from "@/components/layout/admin-navbar";

const ALLOWED_ADMIN_EMAILS = [
  "anonymiketech@gmail.com",
  "admin@anonymiketech.online",
];

function isAllowedAdminEmail(email: string): boolean {
  return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AdminLoginPanel() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAllowedAdminEmail(email)) {
      setError("This email is not authorized for admin access.");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        mode === "sign-up"
          ? "/api/auth/email/register"
          : "/api/auth/email/login";
      const body =
        mode === "sign-up"
          ? { email, password, firstName: firstName || undefined }
          : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed. Please try again.");
        return;
      }

      window.location.reload();
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHub = () => {
    window.location.href = "/api/auth/github?returnTo=/1admin1";
  };

  const handleGoogle = () => {
    window.location.href = "/api/auth/google?returnTo=/1admin1";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-black tracking-tight">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Restricted to authorized administrators only
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden shadow-2xl">
          <div className="h-0.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="p-6">
            <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5">
              {(["sign-in", "sign-up"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); }}
                  className="flex-1 py-2 text-sm font-semibold transition-all"
                  style={{
                    background: mode === m ? "rgba(0,229,153,0.12)" : "transparent",
                    color: mode === m ? "#00e599" : "#71717a",
                  }}
                >
                  {m === "sign-in" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mb-4">
              <AnimatePresence>
                {mode === "sign-up" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <input
                      type="text"
                      placeholder="First name (optional)"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-secondary/50 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                type="email"
                placeholder="Admin email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                required
                className="w-full px-3.5 py-2.5 rounded-lg bg-secondary/50 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "sign-up" ? "Password (min. 8 characters)" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-secondary/50 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-primary text-background font-bold text-sm hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,229,153,0.25)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {mode === "sign-in" ? "Sign In to Admin" : "Create Admin Account"}
              </button>
            </form>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleGitHub}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-secondary/50 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-medium transition-all"
              >
                <GitHubIcon className="w-4 h-4" />
                GitHub
              </button>
              <button
                type="button"
                onClick={handleGoogle}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-secondary/50 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-medium transition-all"
              >
                <GoogleIcon className="w-4 h-4" />
                Google
              </button>
            </div>

            <p className="mt-5 text-[11px] text-center text-muted-foreground border-t border-white/5 pt-4">
              Access is restricted to whitelisted administrator accounts only.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          <a href="/" className="hover:text-primary transition-colors">← Back to site</a>
        </p>
      </motion.div>
    </div>
  );
}

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
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
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

  if (!isAuthenticated) {
    return <AdminLoginPanel />;
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-2">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-display font-bold">Not Authorized</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          The account <span className="text-foreground font-medium">{user?.email}</span> is not an authorized administrator.
        </p>
        <button
          onClick={() => logout()}
          className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out and try again
        </button>
        <a href="/" className="text-sm text-primary hover:underline">← Back to site</a>
      </div>
    );
  }

  const selectedType = TYPE_OPTIONS.find((t) => t.value === notifType) ?? TYPE_OPTIONS[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavbar onRefresh={fetchStatus} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black leading-none">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">ANONYMIKETECH control center</p>
          </div>
        </motion.div>

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
              {togglingMaintenance ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
              {maintenance ? "Deactivate Maintenance" : "Activate Maintenance"}
            </button>
          </motion.div>

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
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  Link <span className="font-normal opacity-60">(optional)</span>
                </label>
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
