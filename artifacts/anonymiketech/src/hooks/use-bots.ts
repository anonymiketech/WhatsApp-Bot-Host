import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Bot } from "@/types/bots";

interface BotsListResponse { bots: Bot[] }
interface BotResponse { bot: Bot }
interface SaveSessionRequest { name: string; sessionId: string }
interface BotActionRequest { botId: string }
interface ErrorEnvelope extends Error { message: string }

export function useGetMyBots() {
  return useQuery<BotsListResponse, ErrorEnvelope>({
    queryKey: ["/api/bots/my-bots"],
    queryFn: async () => {
      const res = await fetch("/api/bots/my-bots", { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch bots");
      }
      return res.json();
    },
  });
}

export function useSaveSession() {
  const queryClient = useQueryClient();
  
  return useMutation<BotResponse, ErrorEnvelope, SaveSessionRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/bots/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save session");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots/my-bots"] });
    },
  });
}

export function useStartBot() {
  const queryClient = useQueryClient();
  
  return useMutation<BotResponse, ErrorEnvelope, BotActionRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/bots/start-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start bot");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots/my-bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] }); // Coins consumed
    },
  });
}

export function useStopBot() {
  const queryClient = useQueryClient();
  
  return useMutation<BotResponse, ErrorEnvelope, BotActionRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/bots/stop-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to stop bot");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots/my-bots"] });
    },
  });
}

export function useRestartBot() {
  const queryClient = useQueryClient();

  return useMutation<BotResponse, ErrorEnvelope, BotActionRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/bots/restart-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to restart bot");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots/my-bots"] });
    },
  });
}

export function useRenewBot() {
  const queryClient = useQueryClient();

  return useMutation<BotResponse, ErrorEnvelope, BotActionRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/bots/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to renew bot");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots/my-bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
    },
  });
}
