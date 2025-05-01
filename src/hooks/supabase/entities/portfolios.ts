import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Portfolios ---
export function usePortfolios(options: QueryOptions = {}) {
  return useSupabaseData("portfolios", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, ministry:ministry_id(*)",
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function usePortfolio(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("portfolios", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, ministry:ministry_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function usePortfoliosByMinistry(ministryId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("portfolios", ["by_ministry", ministryId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, ministry:ministry_id(*)",
    filter: (query) => query.eq("ministry_id", ministryId),
    enabled: !!ministryId && options.enabled !== false,
  });
}

export function usePortfolioMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("portfolios", {
    ...options,
    invalidateTables: ["programs", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });

      // Update any individual portfolio queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["portfolios", data.id] });
        queryClient.invalidateQueries({ queryKey: ["portfolios", "by_ministry", data.ministry_id] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
