import { Heart, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" />
          <span>by</span>
          <a
            href="https://anonymiketech.online"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            ANONYMIKETECH INC
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground/70">
          &copy; 2026 ANONYMIKETECH INC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
