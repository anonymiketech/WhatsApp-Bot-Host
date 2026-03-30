import { useAuth } from "@workspace/replit-auth-web";
import { Shield, Bot, LogOut, RefreshCw, Settings } from "lucide-react";
import { Link } from "wouter";

interface AdminNavbarProps {
  onRefresh?: () => void;
}

export function AdminNavbar({ onRefresh }: AdminNavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(8,8,12,0.95)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(248,113,113,0.15)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,229,153,0.1)", border: "1px solid rgba(0,229,153,0.25)" }}
            >
              <Bot className="w-3.5 h-3.5" style={{ color: "#00e599" }} />
            </div>
            <span
              className="font-display font-black tracking-widest text-xs hidden sm:block"
              style={{ color: "#a1a1aa" }}
            >
              ANONYMIKETECH
            </span>
          </Link>

          <div
            className="h-4 w-px hidden sm:block"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />

          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)" }}
            >
              <Shield className="w-3 h-3 text-red-400" />
            </div>
            <span className="font-bold text-sm text-foreground">Admin Panel</span>
            <span
              className="hidden sm:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest"
              style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}
            >
              Restricted
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.email && (
            <span
              className="hidden md:block text-xs px-3 py-1.5 rounded-lg"
              style={{ color: "#71717a", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {user.email}
            </span>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              title="Refresh data"
            >
              <RefreshCw className="w-3.5 h-3.5" style={{ color: "#71717a" }} />
            </button>
          )}

          <button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-red-500/10"
            style={{
              color: "#f87171",
              border: "1px solid rgba(248,113,113,0.2)",
            }}
            title="Sign out"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>

      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(to right, transparent, rgba(248,113,113,0.4), rgba(0,229,153,0.3), transparent)",
        }}
      />
    </header>
  );
}
