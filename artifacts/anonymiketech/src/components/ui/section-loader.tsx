interface SectionLoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function SectionLoader({ label, size = "md" }: SectionLoaderProps) {
  const dim = size === "sm" ? 48 : size === "lg" ? 96 : 72;
  const stroke = size === "sm" ? 1.5 : 2;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
      <div className="relative" style={{ width: dim, height: dim }}>
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-primary/25"
          style={{
            border: `${stroke}px solid`,
            animation: "orbital-outer 3s linear infinite",
            boxShadow: "0 0 8px rgba(0,229,153,0.15)",
          }}
        />
        {/* Mid dashed ring */}
        <div
          className="absolute rounded-full border-primary/40"
          style={{
            inset: dim * 0.1,
            border: `${stroke}px dashed`,
            animation: "orbital-mid 2s linear infinite reverse",
          }}
        />
        {/* Inner solid ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: dim * 0.22,
            border: `${stroke}px solid rgba(0,229,153,0.6)`,
            animation: "orbital-outer 1.5s linear infinite",
            boxShadow: "0 0 12px rgba(0,229,153,0.3)",
          }}
        />
        {/* Core dot */}
        <div
          className="absolute bg-primary rounded-full"
          style={{
            inset: dim * 0.38,
            boxShadow: "0 0 16px rgba(0,229,153,0.8)",
            animation: "orbital-pulse 1.5s ease-in-out infinite",
          }}
        />
      </div>
      {label && <p className="text-xs tracking-wide animate-pulse">{label}</p>}
    </div>
  );
}
