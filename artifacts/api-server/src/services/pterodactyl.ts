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

export const pterodactyl = {
  getServerStatus,
  sendPowerSignal,
  listServers,
  isConfigured: () => Boolean(BASE && KEY),
  isAppKey,
};
