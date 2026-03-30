import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Wrench, Bot, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const ADMIN_PATH = "/1admin1";

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [maintenance, setMaintenance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/maintenance-status", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setMaintenance(d.maintenance ?? false);
        setIsAdmin(d.isAdmin ?? false);
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [location]);

  if (!checked) return null;

  const isAdminRoute = location === ADMIN_PATH || location.startsWith(ADMIN_PATH + "/");

  if (maintenance && !isAdmin && !isAdminRoute) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
        style={{ background: "hsl(240 10% 4%)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          {/* Animated icon */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="relative w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Wrench className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-black tracking-widest text-lg">ANONYMIKETECH</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-black mb-3">
            Under <span style={{ color: "#00e599" }}>Maintenance</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
            We're upgrading the platform to bring you an even better experience.
            Your bots are safe and will resume once we're back online.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Work in progress — check back soon
          </div>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-white/10 hover:bg-white/5 transition-colors"
            style={{ color: "#a1a1aa" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh page
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
