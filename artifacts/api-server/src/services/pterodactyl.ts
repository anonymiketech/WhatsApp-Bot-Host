import { logger } from "../lib/logger";

const BASE = process.env.PTERODACTYL_URL?.replace(/\/$/, "");
const KEY  = process.env.PTERODACTYL_API_KEY;

// Supports both Application API (ptla_) and Client API (ptlc_)
// Application API  → /api/application  — uses server internal UUID for power actions
// Client API       → /api/client       — uses short identifier
function isAppKey() {
  return KEY?.startsWith("ptla_") ?? false;
}

function apiBase() {
  return isAppKey() ? `${BASE}/api/application` : `${BASE}/api/client`;
}

function headers() {
  return {
    "Authorization": `Bearer ${KEY}`,
    "Accept": "application/json",
    "Content-Type": "application/json",
  };
}

async function apiRequest(
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>,
): Promise<unknown> {
  if (!BASE || !KEY) {
    throw new Error("Pterodactyl not configured (PTERODACTYL_URL / PTERODACTYL_API_KEY missing)");
  }

  const url = `${apiBase()}${path}`;
  const res = await fetch(url, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let json: unknown;
  try { json = JSON.parse(text); } catch { json = null; }

  if (!res.ok) {
    const msg = (json as { errors?: { detail?: string }[] })?.errors?.[0]?.detail ?? text;
    throw new Error(`Pterodactyl ${method} ${path} → ${res.status}: ${msg}`);
  }

  return json;
}

export type PteroStatus = "running" | "stopped" | "starting" | "stopping";

interface ResourcesResponse {
  attributes: {
    current_state: PteroStatus;
    resources: {
      cpu_absolute: number;
      memory_bytes: number;
      uptime: number;
    };
  };
}

/**
 * Get server power status.
 * App API: GET /api/application/servers/{uuid}/resources  (uuid = internal UUID)
 * Client API: GET /api/client/servers/{id}/resources       (id = short identifier)
 */
export async function getServerStatus(serverId: string): Promise<PteroStatus> {
  const path = isAppKey()
    ? `/servers/${serverId}/resources`
    : `/servers/${serverId}/resources`;

  const data = await apiRequest("GET", path) as ResourcesResponse;
  return data.attributes.current_state;
}

/**
 * Send a power signal to a server.
 * App API: POST /api/application/servers/{uuid}/power
 * Client API: POST /api/client/servers/{id}/power
 */
export async function sendPowerSignal(
  serverId: string,
  signal: "start" | "stop" | "restart" | "kill",
): Promise<void> {
  await apiRequest("POST", `/servers/${serverId}/power`, { signal });
}

/**
 * List all servers accessible with the current key.
 * App API: GET /api/application/servers
 * Client API: GET /api/client
 */
export async function listServers(): Promise<{ identifier: string; name: string; uuid: string }[]> {
  if (isAppKey()) {
    const data = await apiRequest("GET", "/servers") as {
      data: { attributes: { identifier: string; name: string; uuid: string } }[];
    };
    return (data?.data ?? []).map((s) => s.attributes);
  } else {
    const data = await apiRequest("GET", "/") as {
      data: { attributes: { identifier: string; name: string; uuid: string } }[];
    };
    return (data?.data ?? []).map((s) => s.attributes);
  }
}

/**
 * Write raw content to a file on the server.
 * Client API: POST /api/client/servers/{id}/files/write?file={path}
 * Body is raw text (Content-Type: text/plain).
 */
export async function writeFile(serverId: string, filePath: string, content: string): Promise<void> {
  if (!BASE || !KEY) {
    throw new Error("Pterodactyl not configured (PTERODACTYL_URL / PTERODACTYL_API_KEY missing)");
  }
  const url = `${BASE}/api/client/servers/${serverId}/files/write?file=${encodeURIComponent(filePath)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${KEY}`,
      "Content-Type": "text/plain",
    },
    body: content,
  });
  if (res.status === 204 || res.ok) return;
  const text = await res.text();
  throw new Error(`Pterodactyl writeFile ${filePath} → ${res.status}: ${text}`);
}

/**
 * Read file contents from the server.
 * Client API: GET /api/client/servers/{id}/files/contents?file={path}
 */
export async function readFile(serverId: string, filePath: string): Promise<string> {
  if (!BASE || !KEY) {
    throw new Error("Pterodactyl not configured");
  }
  const url = `${BASE}/api/client/servers/${serverId}/files/contents?file=${encodeURIComponent(filePath)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${KEY}`,
      "Accept": "text/plain",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pterodactyl readFile ${filePath} → ${res.status}: ${text}`);
  }
  return res.text();
}

/**
 * Inject or update a key=value pair inside a remote .env file.
 * Reads the existing file first, replaces the key if found, appends if not.
 */
export async function setEnvVar(serverId: string, key: string, value: string, filePath = "/home/container/.env"): Promise<void> {
  let existing = "";
  try {
    existing = await readFile(serverId, filePath);
  } catch {
    // File may not exist yet — start fresh
  }

  const lines = existing ? existing.split("\n") : [];
  const keyPrefix = `${key}=`;
  let found = false;

  const updated = lines.map((line) => {
    if (line.startsWith(keyPrefix) || line.startsWith(`${key} =`)) {
      found = true;
      return `${key}="${value}"`;
    }
    return line;
  });

  if (!found) {
    updated.push(`${key}="${value}"`);
  }

  // Remove trailing blank lines then add a final newline
  const content = updated.filter((l, i) => l.trim() !== "" || i < updated.length - 1).join("\n") + "\n";
  await writeFile(serverId, filePath, content);
}

/**
 * Send a console command to a running server.
 * Client API: POST /api/client/servers/{id}/command
 * The server must be running for this to work.
 */
export async function sendCommand(serverId: string, command: string): Promise<void> {
  await apiRequest("POST", `/servers/${serverId}/command`, { command });
}

/**
 * Auto-setup a server by cloning a GitHub repo and running npm install.
 * Only works when the server is already running (i.e. the egg allows it).
 * Sends shell commands to the console in sequence.
 */
export async function autoSetupRepo(serverId: string, repoUrl: string): Promise<void> {
  // Clone repo into current directory (container root)
  await sendCommand(serverId, `git clone ${repoUrl} . 2>&1 || echo "CLONE_FAILED"`);
  // Allow git clone to finish
  await new Promise((r) => setTimeout(r, 8000));
  // Install dependencies
  await sendCommand(serverId, "npm install --omit=dev 2>&1 || npm install 2>&1");
}

export const pterodactyl = {
  getServerStatus,
  sendPowerSignal,
  listServers,
  writeFile,
  readFile,
  setEnvVar,
  sendCommand,
  autoSetupRepo,
  isConfigured: () => Boolean(BASE && KEY),
  isAppKey,
};
