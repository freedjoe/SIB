import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- CP Mobilisations ---
export function useCPMobilisations(options: QueryOptions = {}) {
  return useSupabaseData("cp_mobilisations", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    sort: options.sort || { column: "mobilisation_date", ascending: false },
  });
}

export function useCPMobilisation(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_mobilisations", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useCPMobilisationsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_mobilisations", ["by_operation", operationId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
    sort: options.sort || { column: "mobilisation_date", ascending: false },
  });
}

export function useCPMobilisationsByDateRange(startDate: string, endDate: string, options: QueryOptions = {}) {
  return useSupabaseData("cp_mobilisations", ["by_date_range", startDate, endDate], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.gte("mobilisation_date", startDate).lte("mobilisation_date", endDate),
    enabled: !!(startDate && endDate) && options.enabled !== false,
    sort: options.sort || { column: "mobilisation_date", ascending: false },
  });
}

export function useCPMobilisationMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("cp_mobilisations", {
    ...options,
    invalidateTables: ["cp_consumptions", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["cp_mobilisations"] });

      // Update any individual CP mobilisation queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["cp_mobilisations", data.id] });

        if (data.operation_id) {
          queryClient.invalidateQueries({
            queryKey: ["cp_mobilisations", "by_operation", data.operation_id],
          });

          // Also invalidate related operation to update consumed amounts
          queryClient.invalidateQueries({ queryKey: ["operations", data.operation_id] });
        }

        if (data.mobilisation_date) {
          // Invalidate any date range queries that might include this date
          queryClient.invalidateQueries({
            queryKey: ["cp_mobilisations", "by_date_range"],
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
