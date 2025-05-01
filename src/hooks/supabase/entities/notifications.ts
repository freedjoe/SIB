import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Notifications ---
export function useNotifications(options: QueryOptions = {}) {
  return useSupabaseData("notifications", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useNotification(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("notifications", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useNotificationsByUser(userId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("notifications", ["by_user", userId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("user_id", userId),
    enabled: !!userId && options.enabled !== false,
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useUnreadNotificationCount(userId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("notifications", ["unread_count", userId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("user_id", userId).eq("is_read", false),
    enabled: !!userId && options.enabled !== false,
  });
}

export function useNotificationMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("notifications", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      // Update any individual notification queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["notifications", data.id] });
        if (data.user_id) {
          queryClient.invalidateQueries({ queryKey: ["notifications", "by_user", data.user_id] });
          queryClient.invalidateQueries({ queryKey: ["notifications", "unread_count", data.user_id] });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
