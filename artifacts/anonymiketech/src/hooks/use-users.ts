import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, AddCoinsRequest, ErrorEnvelope } from "@workspace/api-client-react";

export function useGetMe() {
  return useQuery<UserProfile, ErrorEnvelope>({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      const res = await fetch("/api/users/me", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch user profile");
      }
      return res.json();
    },
    retry: false,
  });
}

export function useAddCoins() {
  const queryClient = useQueryClient();
  
  return useMutation<UserProfile, ErrorEnvelope, AddCoinsRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/users/add-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to add coins");
      }
      return res.json();
    },
    onSuccess: (data) => {
      // Optimistically update the user profile cache with new coins
      queryClient.setQueryData(["/api/users/me"], data);
    },
  });
}
