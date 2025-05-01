import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Fiscal Years ---
export function useFiscalYears(options: QueryOptions = {}) {
  return useSupabaseData("fiscal_years", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    realtime: true, // Enable realtime updates
    forceRefresh: true, // Force a fresh fetch when component mounts
    ...options,
    sort: options.sort || { column: "year", ascending: false },
  });
}

export function useFiscalYear(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("fiscal_years", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    realtime: true, // Enable realtime updates
    forceRefresh: true, // Force a fresh fetch when component mounts
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useFiscalYearMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("fiscal_years", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["fiscal_years"] });

      // Update any individual fiscal year queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["fiscal_years", data.id] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
