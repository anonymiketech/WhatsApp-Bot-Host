export interface BotFeature {
  label: string;
}

export interface BotDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  featured: boolean;
  accent: string;
  accentBg: string;
  coinsPerDay: number;
  badge?: string;
  features: string[];
  sessionLink: string;
  docsUrl: string;
  category: "official" | "ai" | "group" | "media" | "advanced";
}

export const BOT_CATALOG: BotDefinition[] = [
  {
    id: "truth",
    name: "TRUTH",
    tagline: "The Official AnonymikeTech Bot",
    description:
      "The flagship WhatsApp automation bot — built and maintained by AnonymikeTech. Battle-tested, always-on, and packed with the most complete feature set on the platform.",
    featured: true,
    accent: "#00E599",
    accentBg: "rgba(0,229,153,0.08)",
    coinsPerDay: 30,
    badge: "Official",
    features: [
      "AI-powered auto replies",
      "Group management & anti-delete",
      "Media downloads & stickers",
      "Custom commands & plugins",
      "Multi-device support",
      "24/7 always-on uptime",
    ],
    sessionLink: "https://session.anonymiketech.online/truth",
    docsUrl: "https://docs.anonymiketech.online/truth",
    category: "official",
  },
  {
    id: "king-md",
    name: "King MD Bot",
    tagline: "Specialized multi-device bot for power users",
    description:
      "Advanced WhatsApp MD bot with country code support. Powerful automation, AI replies, and rock-solid group management.",
    featured: false,
    accent: "#a78bfa",
    accentBg: "rgba(167,139,250,0.08)",
    coinsPerDay: 30,
    badge: "Trending",
    features: [
      "Country code support",
      "AI-powered auto replies",
      "Group management",
      "Media downloads",
      "Admin controls",
    ],
    sessionLink: "https://session.anonymiketech.online/king-md",
    docsUrl: "https://docs.anonymiketech.online/king-md",
    category: "ai",
  },
  {
    id: "cypher-x",
    name: "Cypher X",
    tagline: "The most advanced WhatsApp automation bot",
    description:
      "Supports AI replies, group management, media tools, custom commands, and multi-owner configuration right out of the box.",
    featured: false,
    accent: "#38bdf8",
    accentBg: "rgba(56,189,248,0.08)",
    coinsPerDay: 30,
    features: [
      "AI-powered auto replies",
      "Group management & anti-delete",
      "Media downloads & stickers",
      "Custom commands",
      "Multi-owner support",
    ],
    sessionLink: "https://session.anonymiketech.online/cypher-x",
    docsUrl: "https://docs.anonymiketech.online/cypher-x",
    category: "advanced",
  },
  {
    id: "bwm-xmd-go",
    name: "BWM-XMD-GO",
    tagline: "Go-powered bot built for speed & reliability",
    description:
      "High-performance Go-based WhatsApp bot with blazing fast container deployment. Built for reliability on dedicated infrastructure.",
    featured: false,
    accent: "#34d399",
    accentBg: "rgba(52,211,153,0.08)",
    coinsPerDay: 30,
    features: [
      "Go-powered high performance",
      "Real-time log streaming",
      "Auto media handling",
      "Group & sticker tools",
      "Fast boot time",
    ],
    sessionLink: "https://session.anonymiketech.online/bwm-xmd-go",
    docsUrl: "https://docs.anonymiketech.online/bwm-xmd-go",
    category: "advanced",
  },
  {
    id: "atassa-cloud",
    name: "Atassa Cloud",
    tagline: "Secure cloud-hosted bot for business automation",
    description:
      "Automated port allocation and encrypted deployment. Ideal for group admins and business-grade WhatsApp automation at scale.",
    featured: false,
    accent: "#fb923c",
    accentBg: "rgba(251,146,60,0.08)",
    coinsPerDay: 50,
    badge: "Premium",
    features: [
      "Auto port allocation",
      "Encrypted secure containers",
      "Live console log streaming",
      "Group automation",
      "Always-on uptime",
    ],
    sessionLink: "https://session.anonymiketech.online/atassa-cloud",
    docsUrl: "https://docs.anonymiketech.online/atassa-cloud",
    category: "advanced",
  },
  {
    id: "dave-x",
    name: "DAVE-X",
    tagline: "Feature-rich bot by Dave Tech",
    description:
      "AI tools, full group control, media handling, and custom plugins — deployed fresh on our infrastructure in seconds.",
    featured: false,
    accent: "#f472b6",
    accentBg: "rgba(244,114,182,0.08)",
    coinsPerDay: 30,
    features: [
      "AI tools & smart auto replies",
      "Full group control & moderation",
      "Media downloads & sticker tools",
      "Custom commands & plugins",
      "Baileys multi-device",
    ],
    sessionLink: "https://session.anonymiketech.online/dave-x",
    docsUrl: "https://docs.anonymiketech.online/dave-x",
    category: "ai",
  },
  {
    id: "wolf-bot",
    name: "Wolf Bot",
    tagline: "Stealthy, powerful automation by Silent Wolf",
    description:
      "AI chat, group management, media tools, and predator-level automation. Silently always watching, always running.",
    featured: false,
    accent: "#94a3b8",
    accentBg: "rgba(148,163,184,0.08)",
    coinsPerDay: 30,
    features: [
      "AI-powered auto replies",
      "Group management & anti-delete",
      "Media downloads & sticker tools",
      "Custom commands & plugins",
      "Baileys v7 multi-device",
    ],
    sessionLink: "https://session.anonymiketech.online/wolf-bot",
    docsUrl: "https://docs.anonymiketech.online/wolf-bot",
    category: "group",
  },
  {
    id: "keith-md",
    name: "Keith MD Bot",
    tagline: "Powerful multi-device bot by Keith",
    description:
      "Feature-rich with AI replies, media tools, and advanced group management. Custom prefix support for daily automation.",
    featured: false,
    accent: "#fbbf24",
    accentBg: "rgba(251,191,36,0.08)",
    coinsPerDay: 30,
    features: [
      "AI-powered auto replies",
      "Group management & anti-delete",
      "Media downloads & sticker tools",
      "Custom prefix & plugins",
      "Baileys multi-device",
    ],
    sessionLink: "https://session.anonymiketech.online/keith-md",
    docsUrl: "https://docs.anonymiketech.online/keith-md",
    category: "media",
  },
];

export const FEATURED_BOT = BOT_CATALOG.find((b) => b.featured)!;
export const OTHER_BOTS = BOT_CATALOG.filter((b) => !b.featured);
