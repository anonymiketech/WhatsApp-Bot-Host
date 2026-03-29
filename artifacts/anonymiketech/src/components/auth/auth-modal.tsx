import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Bot, Shield, Zap, Server, ArrowRight } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { motion } from "framer-motion";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "sign-in" | "sign-up";
}

const SIGN_UP_PERKS = [
  { icon: Shield, text: "Secure, encrypted WhatsApp sessions" },
  { icon: Zap, text: "Instant bot deployment & management" },
  { icon: Server, text: "24/7 uptime with 100 free coins" },
];

const SIGN_IN_PERKS = [
  { icon: Bot, text: "Access your deployed bots instantly" },
  { icon: Zap, text: "Monitor and control your instances" },
  { icon: Shield, text: "Your sessions are safe and persistent" },
];

export function AuthModal({ open, onOpenChange, mode }: AuthModalProps) {
  const { login } = useAuth();

  const isSignUp = mode === "sign-up";
  const perks = isSignUp ? SIGN_UP_PERKS : SIGN_IN_PERKS;

  const handleContinue = () => {
    onOpenChange(false);
    login();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-white/10 bg-background shadow-2xl">
        <DialogTitle className="sr-only">
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </DialogTitle>

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]" />

        <div className="px-8 py-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-lg tracking-widest text-foreground">
              ANONYMIKETECH
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-display font-bold mb-1">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? "Join thousands of developers hosting their WhatsApp bots."
                : "Sign in to manage your bots and sessions."}
            </p>
          </motion.div>

          {/* Perks */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-3 mb-8"
          >
            {perks.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                {text}
              </li>
            ))}
          </motion.ul>

          {/* CTA button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl bg-primary text-background font-bold text-sm hover:bg-primary/90 hover:shadow-[0_0_25px_rgba(0,229,153,0.3)] transition-all group"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c2.067 0 3.75 1.683 3.75 3.75S14.067 12 12 12 8.25 10.317 8.25 8.25 9.933 4.5 12 4.5zm0 15c-3.126 0-5.898-1.505-7.623-3.832C5.897 13.857 9.112 12.75 12 12.75s6.103 1.107 7.623 2.918C17.898 17.995 15.126 19.5 12 19.5z" />
            </svg>
            Continue with Replit
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-5 text-xs text-center text-muted-foreground"
          >
            {isSignUp
              ? "Already have an account? "
              : "Don't have an account? "}
            <button
              onClick={handleContinue}
              className="text-primary hover:underline font-medium"
            >
              {isSignUp ? "Sign in instead" : "Sign up for free"}
            </button>
          </motion.p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
