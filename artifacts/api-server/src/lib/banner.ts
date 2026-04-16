const R = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const CYAN = "\x1b[96m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const MAGENTA = "\x1b[95m";
const BLUE = "\x1b[94m";
const WHITE = "\x1b[97m";
const RED = "\x1b[91m";
const ORANGE = "\x1b[38;5;208m";

const W = 62;

function pad(text: string, width: number, align: "left" | "right" | "center" = "left"): string {
  const visible = text.replace(/\x1b\[[0-9;]*m/g, "");
  const spaces = Math.max(0, width - visible.length);
  if (align === "right") return " ".repeat(spaces) + text;
  if (align === "center") {
    const left = Math.floor(spaces / 2);
    const right = spaces - left;
    return " ".repeat(left) + text + " ".repeat(right);
  }
  return text + " ".repeat(spaces);
}

function row(content: string): string {
  return `${DIM}║${R} ${pad(content, W - 2)} ${DIM}║${R}`;
}

function divider(): string {
  return `${DIM}╠${"═".repeat(W)}╣${R}`;
}

function kv(label: string, value: string, icon: string, valueColor = GREEN): string {
  const labelStr = `${DIM}${icon}  ${BOLD}${WHITE}${label.padEnd(13)}${R}`;
  const valueStr = `${valueColor}${value}${R}`;
  return row(`${labelStr}  ${DIM}│${R}  ${valueStr}`);
}

export const startTime = Date.now();

export function getUptime(): string {
  const ms = Date.now() - startTime;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function printBanner(port: number): void {
  const env = process.env["NODE_ENV"] ?? "development";
  const isProd = env === "production";
  const nodeVer = process.version;
  const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
  const started = new Date().toUTCString();
  const appUrl = process.env["APP_URL"] ?? `http://localhost:${port}`;

  const title =
    `${BOLD}${ORANGE}A${YELLOW}N${GREEN}O${CYAN}N${BLUE}Y${MAGENTA}M${RED}I${ORANGE}K${YELLOW}E${GREEN}T${CYAN}E${BLUE}C${MAGENTA}H${R}` +
    `  ${DIM}${WHITE}HOSTING PLATFORM${R}`;

  const lines = [
    `${DIM}╔${"═".repeat(W)}╗${R}`,
    row(""),
    row(pad(title, W - 2, "center")),
    row(pad(`${DIM}${WHITE}WhatsApp Bot Deployment & Management${R}`, W - 2 + 11, "center")),
    row(""),
    divider(),
    row(""),
    kv("Status", isProd ? "🟢  Online & Serving" : "🔵  Dev Mode", "✅", GREEN),
    kv("URL", appUrl, "🌍", CYAN),
    kv("Port", `${port}`, "🌐", CYAN),
    kv("Environment", env, "⚙️ ", isProd ? GREEN : YELLOW),
    kv("Node.js", nodeVer, "📦", BLUE),
    kv("Memory", `${mem} MiB`, "💾", MAGENTA),
    kv("Started", started, "🕐", DIM + WHITE),
    row(""),
    divider(),
    row(""),
    row(pad(`${DIM}All systems operational — ready to accept connections${R}`, W - 2 + 7, "center")),
    row(""),
    `${DIM}╚${"═".repeat(W)}╝${R}`,
  ];

  console.log("\n" + lines.join("\n") + "\n");
}
