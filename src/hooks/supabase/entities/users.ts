import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Users ---
export function useUsers(options: QueryOptions = {}) {
  return useSupabaseData("users", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useUser(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("users", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useUserByEmail(email: string | null, options: QueryOptions = {}) {
  return useSupabaseData("users", ["by_email", email], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("email", email),
    enabled: !!email && options.enabled !== false,
  });
}

export function useUserMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("users", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Update any individual user queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["users", data.id] });
        if (data.email) {
          queryClient.invalidateQueries({ queryKey: ["users", "by_email", data.email] });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
