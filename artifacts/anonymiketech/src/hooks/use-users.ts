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

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<UserProfile, ErrorEnvelope, UpdateProfileRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/users/me"], data);
    },
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
        throw new Error((errorData as { error?: string }).error || "Failed to add coins");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/users/me"], data);
    },
  });
}
