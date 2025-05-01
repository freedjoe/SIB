import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Extra Engagements ---
export function useExtraEngagements(options: QueryOptions = {}) {
  return useSupabaseData("extra_engagements", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    sort: options.sort || { column: "request_date", ascending: false },
  });
}

export function useExtraEngagement(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("extra_engagements", [id], {
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

export function useExtraEngagementsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("extra_engagements", ["by_operation", operationId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
    sort: options.sort || { column: "request_date", ascending: false },
  });
}

export function useExtraEngagementsByStatus(status: string, options: QueryOptions = {}) {
  return useSupabaseData("extra_engagements", ["by_status", status], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("status", status),
    enabled: !!status && options.enabled !== false,
    sort: options.sort || { column: "request_date", ascending: false },
  });
}

export function useExtraEngagementMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("extra_engagements", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["extra_engagements"] });

      // Update any individual extra engagement queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["extra_engagements", data.id] });

        if (data.operation_id) {
          queryClient.invalidateQueries({
            queryKey: ["extra_engagements", "by_operation", data.operation_id],
          });

          // Also invalidate related operation
          queryClient.invalidateQueries({ queryKey: ["operations", data.operation_id] });
        }

        if (data.status) {
          queryClient.invalidateQueries({
            queryKey: ["extra_engagements", "by_status", data.status],
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
