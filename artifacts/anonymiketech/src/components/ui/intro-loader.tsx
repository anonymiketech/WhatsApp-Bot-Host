import { useEffect, useState } from "react";

const RINGS = [1, 2, 3, 4];
const DOTS = Array.from({ length: 20 }, (_, i) => i + 1);

export function IntroLoader() {
  const [phase, setPhase] = useState<"visible" | "fading" | "done">("visible");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), 2200);
    const doneTimer = setTimeout(() => setPhase("done"), 2800);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden"
      style={{ transition: "opacity 0.6s ease", opacity: phase === "fading" ? 0 : 1 }}
    >
      {/* Spiral animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-0 h-0">
          {RINGS.map((r) => (
            <div
              key={r}
              className="intro-loader-ring"
              style={{ "--r": r } as React.CSSProperties}
            >
              {DOTS.map((i) => (
                <span
                  key={i}
                  className="intro-loader-dot"
                  style={{ "--i": i } as React.CSSProperties}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Center branding */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-3xl shadow-[0_0_40px_rgba(0,229,153,0.25)]">
          🤖
        </div>
        <div className="text-center">
          <p className="font-display font-black text-xl tracking-widest text-primary" style={{ textShadow: "0 0 30px rgba(0,229,153,0.6)" }}>
            ANONYMIKETECH
          </p>
          <p className="text-xs text-muted-foreground mt-1 tracking-wider">WhatsApp Bot Platform</p>
        </div>
        {/* Subtle pulsing bar */}
        <div className="flex gap-1 mt-2">
          {[0, 0.15, 0.3, 0.15, 0].map((delay, idx) => (
            <div
              key={idx}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{ animation: `intro-pulse 1s ease-in-out infinite`, animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
