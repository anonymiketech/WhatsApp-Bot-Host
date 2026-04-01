import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Bot, Eye, EyeOff, Loader2, Mail, RotateCcw, CheckCircle2 } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "sign-in" | "sign-up";
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

function ReplitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c2.067 0 3.75 1.683 3.75 3.75S14.067 12 12 12 8.25 10.317 8.25 8.25 9.933 4.5 12 4.5zm0 15c-3.126 0-5.898-1.505-7.623-3.832C5.897 13.857 9.112 12.75 12 12.75s6.103 1.107 7.623 2.918C17.898 17.995 15.126 19.5 12 19.5z" />
    </svg>
  );
}

function CodeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = (value + "      ").slice(0, 6).split("");

  const handleChange = (i: number, ch: string) => {
    if (!/^\d*$/.test(ch)) return;
    const next = digits.slice();
    next[i] = ch.slice(-1) || " ";
    const joined = next.join("").trimEnd();
    onChange(joined);
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = digits.slice();
      if (next[i].trim()) {
        next[i] = " ";
      } else if (i > 0) {
        next[i - 1] = " ";
        inputs.current[i - 1]?.focus();
      }
      onChange(next.join("").trimEnd());
    }
    if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className="w-11 h-13 text-center text-xl font-bold rounded-xl border bg-secondary/50 focus:outline-none transition-all"
          style={{
            borderColor: d.trim() ? "rgba(0,229,153,0.5)" : "rgba(255,255,255,0.1)",
            color: d.trim() ? "#00e599" : "#e4e4e7",
            boxShadow: d.trim() ? "0 0 0 1px rgba(0,229,153,0.2)" : "none",
          }}
        />
      ))}
    </div>
  );
}

function VerifyStep({
  email,
  onSuccess,
  onBack,
}: {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (code.trim().length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed.");
        if (data.error?.includes("expired")) setCode("");
        return;
      }
      onSuccess();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    setResent(false);
    setError(null);
    try {
      await fetch("/api/auth/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      setResent(true);
      setCountdown(60);
      setCode("");
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex flex-col items-center text-center mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(0,229,153,0.1)", border: "1px solid rgba(0,229,153,0.25)" }}
        >
          <Mail className="w-7 h-7" style={{ color: "#00e599" }} />
        </div>
        <h2 className="text-lg font-display font-bold leading-tight">Check your email</h2>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-[260px]">
          We sent a 6-digit code to <span className="text-foreground font-semibold">{email}</span>
        </p>
      </div>

      <div className="mb-4">
        <CodeInput value={code} onChange={(v) => { setCode(v); setError(null); }} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-3 text-center"
          >
            {error}
          </motion.p>
        )}
        {resent && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 mb-3 text-center flex items-center justify-center gap-1.5"
            style={{ color: "#00e599" }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            New code sent! Check your inbox.
          </motion.p>
        )}
      </AnimatePresence>

      <button
        onClick={handleVerify}
        disabled={isLoading || code.trim().length !== 6}
        className="w-full py-2.5 rounded-lg bg-primary text-background font-bold text-sm hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,229,153,0.25)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Verify Email
      </button>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <button
          onClick={onBack}
          className="hover:text-foreground transition-colors"
        >
          ← Change email
        </button>
        <button
          onClick={handleResend}
          disabled={isResending || countdown > 0}
          className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3" />
          {countdown > 0 ? `Resend in ${countdown}s` : isResending ? "Sending…" : "Resend code"}
        </button>
      </div>

      <p className="mt-4 text-[10px] text-center text-muted-foreground border-t border-white/5 pt-4">
        Codes expire after 15 minutes. Check spam if you don't see it.
      </p>
    </motion.div>
  );
}

export function AuthModal({ open, onOpenChange, mode }: AuthModalProps) {
  const { login } = useAuth();
  const isSignUp = mode === "sign-up";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const endpoint = isSignUp ? "/api/auth/email/register" : "/api/auth/email/login";
      const body = isSignUp
        ? { email, password, firstName: firstName || undefined }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.needsVerification) {
        setVerifyEmail(email);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      onOpenChange(false);
      window.location.href = "/dashboard";
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHub = () => {
    onOpenChange(false);
    window.location.href = "/api/auth/github?returnTo=/dashboard";
  };

  const handleGoogle = () => {
    onOpenChange(false);
    window.location.href = "/api/auth/google?returnTo=/dashboard";
  };

  const handleReplit = () => {
    onOpenChange(false);
    login();
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setError(null);
    setShowPassword(false);
    setVerifyEmail(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border border-white/10 bg-background shadow-2xl">
        <DialogTitle className="sr-only">
          {verifyEmail ? "Verify your email" : isSignUp ? "Create your account" : "Sign in to your account"}
        </DialogTitle>

        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

        <div className="px-7 py-7">
          <AnimatePresence mode="wait">
            {verifyEmail ? (
              <VerifyStep
                key="verify"
                email={verifyEmail}
                onSuccess={() => {
                  resetForm();
                  onOpenChange(false);
                  window.location.href = "/dashboard";
                }}
                onBack={() => setVerifyEmail(null)}
              />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold leading-tight">
                      {isSignUp ? "Create your account" : "Welcome back"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {isSignUp ? "Start hosting WhatsApp bots today" : "Sign in to your dashboard"}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-3 mb-4">
                  <AnimatePresence>
                    {isSignUp && (
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
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-secondary/50 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={isSignUp ? "Password (min. 8 characters)" : "Password"}
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
                        className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
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
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isSignUp ? "Create Account" : "Sign In"}
                  </button>
                </form>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-muted-foreground">or continue with</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <button
                    onClick={handleGitHub}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-secondary/50 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-medium transition-all"
                  >
                    <GitHubIcon className="w-4 h-4" />
                    GitHub
                  </button>
                  <button
                    onClick={handleGoogle}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-secondary/50 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-medium transition-all"
                  >
                    <GoogleIcon className="w-4 h-4" />
                    Google
                  </button>
                </div>

                <button
                  onClick={handleReplit}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ReplitIcon className="w-3.5 h-3.5" />
                  Continue with Replit
                </button>

                <p className="mt-4 text-xs text-center text-muted-foreground border-t border-white/5 pt-4">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    onClick={() => {
                      resetForm();
                      onOpenChange(false);
                      setTimeout(() => {
                        const evt = new CustomEvent("open-auth-modal", {
                          detail: { mode: isSignUp ? "sign-in" : "sign-up" },
                        });
                        window.dispatchEvent(evt);
                      }, 100);
                    }}
                    className="text-primary hover:underline font-semibold"
                  >
                    {isSignUp ? "Sign in" : "Sign up for free"}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
