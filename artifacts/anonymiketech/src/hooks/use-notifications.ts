import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AppNotification {
  id: string;
  userId: string;
  type: "info" | "success" | "warning" | "error" | "update";
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

export function useNotifications() {
  return useQuery<NotificationsResponse>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
    refetchInterval: 30_000,
    retry: false,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}/read`, { method: "POST", credentials: "include" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await fetch("/api/notifications/read-all", { method: "POST", credentials: "include" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/notifications"] }),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}`, { method: "DELETE", credentials: "include" });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["/api/notifications"] });
      const previous = queryClient.getQueryData<NotificationsResponse>(["/api/notifications"]);
      if (previous) {
        const updated = previous.notifications.filter((n) => n.id !== id);
        queryClient.setQueryData<NotificationsResponse>(["/api/notifications"], {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.read).length,
        });
      }
      return { previous };
    },
    onError: (_err, _id, ctx: { previous?: NotificationsResponse } | undefined) => {
      if (ctx?.previous) queryClient.setQueryData(["/api/notifications"], ctx.previous);
    },
  });
}

export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await fetch("/api/notifications/delete-all", { method: "DELETE", credentials: "include" });
    },
    onSuccess: () =>
      queryClient.setQueryData<NotificationsResponse>(["/api/notifications"], {
        notifications: [],
        unreadCount: 0,
      }),
  });
}
