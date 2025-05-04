// filepath: c:\Projects\SIB\src\hooks\supabase\entities\ministries.ts
// ENTITY LEVEL 1: Ministries (Top level entity)
import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Ministries ---
export function useMinistries(options: QueryOptions = {}) {
  return useSupabaseData("ministries", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    sort: options.sort || { column: "code", ascending: true },
  });
}

export function useMinistry(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("ministries", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useMinistryMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("ministries", {
    ...options,
    invalidateTables: ["portfolios", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["ministries"] });

      // Update any individual ministry queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["ministries", data.id] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
