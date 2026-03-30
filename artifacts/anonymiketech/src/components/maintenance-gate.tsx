import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Wrench, Bot, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const ADMIN_PATH = "/1admin1";

const MATRIX_COLS = Array.from({ length: 40 });
const MATRIX_PATTERNS = Array.from({ length: 5 });

const MATRIX_POSITIONS = [
  { left: 0,   delay: -2.5, dur: 3   },
  { left: 25,  delay: -3.2, dur: 4   },
  { left: 50,  delay: -1.8, dur: 2.5 },
  { left: 75,  delay: -2.9, dur: 3.5 },
  { left: 100, delay: -1.5, dur: 3   },
  { left: 125, delay: -3.8, dur: 4.5 },
  { left: 150, delay: -2.1, dur: 2.8 },
  { left: 175, delay: -2.7, dur: 3.2 },
  { left: 200, delay: -3.4, dur: 3.8 },
  { left: 225, delay: -1.9, dur: 2.7 },
  { left: 250, delay: -3.6, dur: 4.2 },
  { left: 275, delay: -2.3, dur: 3.1 },
  { left: 300, delay: -3.1, dur: 3.6 },
  { left: 325, delay: -2.6, dur: 2.9 },
  { left: 350, delay: -3.7, dur: 4.1 },
  { left: 375, delay: -2.8, dur: 3.3 },
  { left: 400, delay: -3.3, dur: 3.7 },
  { left: 425, delay: -2.2, dur: 2.6 },
  { left: 450, delay: -3.9, dur: 4.3 },
  { left: 475, delay: -2.4, dur: 3.4 },
  { left: 500, delay: -1.7, dur: 2.4 },
  { left: 525, delay: -3.5, dur: 3.9 },
  { left: 550, delay: -2.0, dur: 3.0 },
  { left: 575, delay: -4.0, dur: 4.4 },
  { left: 600, delay: -1.6, dur: 2.3 },
  { left: 625, delay: -3.0, dur: 3.5 },
  { left: 650, delay: -3.8, dur: 4.0 },
  { left: 675, delay: -2.5, dur: 2.8 },
  { left: 700, delay: -3.2, dur: 3.6 },
  { left: 725, delay: -2.7, dur: 3.2 },
  { left: 750, delay: -1.8, dur: 2.7 },
  { left: 775, delay: -3.6, dur: 4.1 },
  { left: 800, delay: -2.1, dur: 3.1 },
  { left: 825, delay: -3.4, dur: 3.7 },
  { left: 850, delay: -2.8, dur: 2.9 },
  { left: 875, delay: -3.7, dur: 4.2 },
  { left: 900, delay: -2.3, dur: 3.3 },
  { left: 925, delay: -1.9, dur: 2.5 },
  { left: 950, delay: -3.5, dur: 3.8 },
  { left: 975, delay: -2.6, dur: 3.4 },
];

function MatrixBackground() {
  return (
    <>
      <style>{`
        @keyframes matrix-fall {
          0%   { transform: translateY(-10%); opacity: 1; }
          100% { transform: translateY(200%); opacity: 0; }
        }
        .mx-col {
          position: absolute;
          top: -100%;
          width: 20px;
          height: 100%;
          font-size: 15px;
          line-height: 18px;
          font-weight: bold;
          animation: matrix-fall linear infinite;
          white-space: nowrap;
        }
        .mx-col::before {
          position: absolute;
          top: 0;
          left: 0;
          background: linear-gradient(
            to bottom,
            #ffffff 0%,
            #ffffff 5%,
            #00ff41 10%,
            #00ff41 20%,
            #00dd33 30%,
            #00bb22 40%,
            #009911 50%,
            #007700 60%,
            #005500 70%,
            #003300 80%,
            rgba(0,255,65,0.5) 90%,
            transparent 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          writing-mode: vertical-lr;
          letter-spacing: 1px;
        }
        .mx-col:nth-child(odd)::before  { content: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン123456789"; }
        .mx-col:nth-child(even)::before { content: "ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴァィゥェォャュョッABCDEFGHIJKLMNOPQRSTUVWXYZ"; }
        .mx-col:nth-child(3n)::before   { content: "アカサタナハマヤラワイキシチニヒミリウクスツヌフムユルエケセテネヘメレオコソトノホモヨロヲン0987654321"; }
        .mx-col:nth-child(4n)::before   { content: "ンヲロヨモホノトソコオレメヘネテセケエルユムフヌツスクウリミヒニチシキイワラヤマハナタサカア"; }
        .mx-col:nth-child(5n)::before   { content: "ガザダバパギジヂビピグズヅブプゲゼデベペゴゾドボポヴァィゥェォャュョッ!@#$%^&*()_+-=[]{}|;:,.<>?"; }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {MATRIX_PATTERNS.map((_, pi) => (
          <div
            key={pi}
            style={{ position: "relative", width: 1000, height: "100%", flexShrink: 0 }}
          >
            {MATRIX_POSITIONS.map((pos, ci) => (
              <div
                key={ci}
                className="mx-col"
                style={{
                  left: pos.left,
                  animationDelay: `${pos.delay}s`,
                  animationDuration: `${pos.dur}s`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </>
  );
}

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
      <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
        <MatrixBackground />

        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              maxWidth: 440,
              width: "100%",
              background: "rgba(0,0,0,0.75)",
              border: "1px solid rgba(0,229,153,0.2)",
              borderRadius: 24,
              padding: "2.5rem 2rem",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 60px rgba(0,229,153,0.06), 0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 2rem" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(0,229,153,0.15)",
                  animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
                }}
              />
              <div
                style={{
                  position: "relative",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(0,229,153,0.1)",
                  border: "1px solid rgba(0,229,153,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Wrench style={{ width: 36, height: 36, color: "#00e599" }} />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(0,229,153,0.1)",
                  border: "1px solid rgba(0,229,153,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot style={{ width: 15, height: 15, color: "#00e599" }} />
              </div>
              <span
                style={{
                  fontFamily: "inherit",
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  fontSize: 13,
                  color: "#e4e4e7",
                  textTransform: "uppercase",
                }}
              >
                ANONYMIKETECH
              </span>
            </div>

            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: 10, color: "#fff", letterSpacing: "-0.01em" }}>
              Under{" "}
              <span style={{ color: "#00e599" }}>Maintenance</span>
            </h1>

            <p style={{ color: "#a1a1aa", fontSize: 14, lineHeight: 1.65, marginBottom: 28 }}>
              We're upgrading the platform to bring you an even better experience.
              Your bots are safe and will resume once we're back online.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 12,
                color: "#71717a",
                marginBottom: 24,
              }}
            >
              <span style={{ position: "relative", display: "flex", width: 8, height: 8 }}>
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#00e599",
                    opacity: 0.75,
                    animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                  }}
                />
                <span
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#00e599",
                  }}
                />
              </span>
              Work in progress — check back soon
            </div>

            <button
              onClick={() => window.location.reload()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.05)",
                color: "#a1a1aa",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "#e4e4e7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLButtonElement).style.color = "#a1a1aa";
              }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} />
              Refresh page
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
