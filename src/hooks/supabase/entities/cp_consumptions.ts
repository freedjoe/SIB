import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- CP Consumptions ---
export function useCPConsumptions(options: QueryOptions = {}) {
  return useSupabaseData("cp_consumptions", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, mobilisation:mobilisation_id(*)",
    sort: options.sort || { column: "consumption_date", ascending: false },
  });
}

export function useCPConsumption(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_consumptions", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, mobilisation:mobilisation_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useCPConsumptionsByMobilisation(mobilisationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_consumptions", ["by_mobilisation", mobilisationId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, mobilisation:mobilisation_id(*)",
    filter: (query) => query.eq("mobilisation_id", mobilisationId),
    enabled: !!mobilisationId && options.enabled !== false,
    sort: options.sort || { column: "consumption_date", ascending: false },
  });
}

export function useCPConsumptionsByDateRange(startDate: string, endDate: string, options: QueryOptions = {}) {
  return useSupabaseData("cp_consumptions", ["by_date_range", startDate, endDate], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, mobilisation:mobilisation_id(*)",
    filter: (query) => query.gte("consumption_date", startDate).lte("consumption_date", endDate),
    enabled: !!(startDate && endDate) && options.enabled !== false,
    sort: options.sort || { column: "consumption_date", ascending: false },
  });
}

export function useCPConsumptionMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("cp_consumptions", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["cp_consumptions"] });

      // Update any individual CP consumption queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["cp_consumptions", data.id] });

        if (data.mobilisation_id) {
          queryClient.invalidateQueries({
            queryKey: ["cp_consumptions", "by_mobilisation", data.mobilisation_id],
          });

          // Also invalidate related mobilisation
          queryClient.invalidateQueries({
            queryKey: ["cp_mobilisations", data.mobilisation_id],
          });
        }

        if (data.consumption_date) {
          // Invalidate any date range queries that might include this date
          queryClient.invalidateQueries({
            queryKey: ["cp_consumptions", "by_date_range"],
          });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
