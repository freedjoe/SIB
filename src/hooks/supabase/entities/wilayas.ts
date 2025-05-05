import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Wilayas ---
export function useWilayas(options: QueryOptions = {}) {
  return useSupabaseData("wilayas", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    forceRefresh: true, // Force refresh on mount
    ...options,
    sort: options.sort || { column: "code", ascending: true },
  });
}

export function useWilaya(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("wilayas", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    forceRefresh: true, // Force refresh on mount
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useWilayaByCode(code: string | null, options: QueryOptions = {}) {
  return useSupabaseData("wilayas", ["by_code", code], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    forceRefresh: true, // Force refresh on mount
    ...options,
    filter: (query) => query.eq("code", code),
    enabled: !!code && options.enabled !== false,
  });
}

export function useWilayaMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("wilayas", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["wilayas"] });

      // Update any individual wilaya queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["wilayas", data.id] });
        if (data.code) {
          queryClient.invalidateQueries({ queryKey: ["wilayas", "by_code", data.code] });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
