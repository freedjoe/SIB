import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Deals ---
export function useDeals(options: QueryOptions = {}) {
  return useSupabaseData("deals", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    sort: options.sort || { column: "date_signed", ascending: false },
  });
}

export function useDeal(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("deals", [id], {
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

export function useDealsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("deals", ["by_operation", operationId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
    sort: options.sort || { column: "date_signed", ascending: false },
  });
}

export function useDealsByEnterpriseName(enterpriseName: string | null, options: QueryOptions = {}) {
  return useSupabaseData("deals", ["by_enterprise", enterpriseName], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("entreprise_name", enterpriseName),
    enabled: !!enterpriseName && options.enabled !== false,
    sort: options.sort || { column: "amount", ascending: false },
  });
}

export function useDealsByDateRange(startDate: string, endDate: string, options: QueryOptions = {}) {
  return useSupabaseData("deals", ["by_date_range", startDate, endDate], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.gte("date_signed", startDate).lte("date_signed", endDate),
    enabled: !!(startDate && endDate) && options.enabled !== false,
    sort: options.sort || { column: "date_signed", ascending: false },
  });
}

export function useDealMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("deals", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["deals"] });

      // Update any individual deal queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["deals", data.id] });

        if (data.operation_id) {
          queryClient.invalidateQueries({
            queryKey: ["deals", "by_operation", data.operation_id],
          });

          // Also invalidate related operation to update physical/financial rates
          queryClient.invalidateQueries({ queryKey: ["operations", data.operation_id] });
        }

        if (data.entreprise_name) {
          queryClient.invalidateQueries({
            queryKey: ["deals", "by_enterprise", data.entreprise_name],
          });
        }

        if (data.date_signed) {
          // Invalidate any date range queries that might include this date
          queryClient.invalidateQueries({
            queryKey: ["deals", "by_date_range"],
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
