import { Heart, ExternalLink, Code2, Users, Mail, Phone, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-white/8 mt-auto" style={{ background: "hsl(240 10% 4%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Top links grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                <span className="text-xs font-black" style={{ color: "#00e599" }}>A</span>
              </div>
              <span className="font-bold text-sm" style={{ color: "#e4e4e7" }}>ANONYMIKETECH</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#71717a" }}>
              Kenya's leading WhatsApp bot hosting platform. Deploy, manage, and scale bots effortlessly.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#a1a1aa" }}>Platform</p>
            <div className="space-y-2">
              {[
                { label: "Bot Marketplace", href: "/bots" },
                { label: "Pricing", href: "/pricing" },
                { label: "Partners", href: "/partners" },
                { label: "Contact Us", href: "/contact" },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="block text-xs hover:opacity-80 transition-opacity" style={{ color: "#71717a" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#a1a1aa" }}>Contact</p>
            <div className="space-y-2">
              <a href="https://wa.me/254782829321" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity" style={{ color: "#71717a" }}>
                <MessageSquare className="w-3 h-3" style={{ color: "#25d366" }} />
                +254 782 829 321
              </a>
              <a href="mailto:admin@anonymiketech.online"
                className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity" style={{ color: "#71717a" }}>
                <Mail className="w-3 h-3" style={{ color: "#00e599" }} />
                admin@anonymiketech.online
              </a>
              <a href="mailto:support@anonymiketech.online"
                className="flex items-center gap-2 text-xs hover:opacity-80 transition-opacity" style={{ color: "#71717a" }}>
                <Mail className="w-3 h-3" style={{ color: "#a78bfa" }} />
                support@anonymiketech.online
              </a>
            </div>
          </div>
        </div>

        {/* Partner action links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link
            href="/partners"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
            style={{ color: "#00e599" }}
          >
            <Users className="w-3.5 h-3.5" />
            Become a Reseller Partner
          </Link>
          <Link
            href="/partners?tab=developer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 bg-white/4 hover:bg-white/8 transition-colors"
            style={{ color: "#a1a1aa" }}
          >
            <Code2 className="w-3.5 h-3.5" />
            Submit Your Bot
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "#a1a1aa" }}>
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" />
            <span>by</span>
            <a
              href="https://anonymiketech.online"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "#00e599" }}
            >
              ANONYMIKETECH INC
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
          <p className="text-xs" style={{ color: "#71717a" }}>
            &copy; 2026 ANONYMIKETECH INC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
