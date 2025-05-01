import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Budget Categories ---
export function useBudgetCategories(options: QueryOptions = {}) {
  return useSupabaseData("budget_categories", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    sort: options.sort || { column: "code", ascending: true },
  });
}

export function useBudgetCategory(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("budget_categories", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useBudgetCategoryByCode(code: string | null, options: QueryOptions = {}) {
  return useSupabaseData("budget_categories", ["by_code", code], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("code", code),
    enabled: !!code && options.enabled !== false,
  });
}

export function useBudgetCategoryMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("budget_categories", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["budget_categories"] });

      // Update any individual budget category queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["budget_categories", data.id] });
        if (data.code) {
          queryClient.invalidateQueries({ queryKey: ["budget_categories", "by_code", data.code] });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
