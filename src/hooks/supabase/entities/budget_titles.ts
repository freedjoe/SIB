import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Budget Titles ---
export function useBudgetTitles(options: QueryOptions = {}) {
  return useSupabaseData("budget_titles", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    sort: options.sort || { column: "code", ascending: true },
  });
}

export function useBudgetTitle(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("budget_titles", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useBudgetTitleByCode(code: string | null, options: QueryOptions = {}) {
  return useSupabaseData("budget_titles", ["by_code", code], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("code", code),
    enabled: !!code && options.enabled !== false,
  });
}

export function useBudgetTitleMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("budget_titles", {
    ...options,
    invalidateTables: ["operations", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["budget_titles"] });

      // Update any individual budget title queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["budget_titles", data.id] });
        if (data.code) {
          queryClient.invalidateQueries({ queryKey: ["budget_titles", "by_code", data.code] });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
