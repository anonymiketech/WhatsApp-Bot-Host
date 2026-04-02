import { logger } from "../lib/logger";

const BASE = process.env.PTERODACTYL_URL?.replace(/\/$/, "");
const KEY  = process.env.PTERODACTYL_API_KEY;

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

  const url = `${BASE}/api/client${path}`;
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
      disk_bytes: number;
      uptime: number;
    };
  };
}

export async function getServerStatus(serverId: string): Promise<PteroStatus> {
  const data = await apiRequest("GET", `/servers/${serverId}/resources`) as ResourcesResponse;
  return data.attributes.current_state;
}

export async function sendPowerSignal(
  serverId: string,
  signal: "start" | "stop" | "restart" | "kill",
): Promise<void> {
  await apiRequest("POST", `/servers/${serverId}/power`, { signal });
}

export async function listServers(): Promise<{ identifier: string; name: string; uuid: string }[]> {
  const data = await apiRequest("GET", "/") as {
    data: { attributes: { identifier: string; name: string; uuid: string } }[];
  };
  return (data?.data ?? []).map((s) => s.attributes);
}

export const pterodactyl = {
  getServerStatus,
  sendPowerSignal,
  listServers,
  isConfigured: () => Boolean(BASE && KEY),
};
