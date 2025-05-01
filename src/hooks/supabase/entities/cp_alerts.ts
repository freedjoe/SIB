import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- CP Alerts ---
export function useCPAlerts(options: QueryOptions = {}) {
  return useSupabaseData("cp_alerts", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    sort: options.sort || { column: "alert_date", ascending: false },
  });
}

export function useCPAlert(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_alerts", [id], {
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

export function useCPAlertsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_alerts", ["by_operation", operationId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
    sort: options.sort || { column: "alert_date", ascending: false },
  });
}

export function useCPAlertsByThresholdExceeded(exceeded: boolean, options: QueryOptions = {}) {
  return useSupabaseData("cp_alerts", ["by_threshold", exceeded], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("threshold_exceeded", exceeded),
    sort: options.sort || { column: "alert_date", ascending: false },
  });
}

export function useCPAlertsByAlertLevel(alertLevel: string, options: QueryOptions = {}) {
  return useSupabaseData("cp_alerts", ["by_alert_level", alertLevel], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("alert_level", alertLevel),
    enabled: !!alertLevel && options.enabled !== false,
    sort: options.sort || { column: "alert_date", ascending: false },
  });
}

export function useCPAlertMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("cp_alerts", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["cp_alerts"] });

      // Update any individual CP alert queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["cp_alerts", data.id] });

        if (data.operation_id) {
          queryClient.invalidateQueries({
            queryKey: ["cp_alerts", "by_operation", data.operation_id],
          });

          // Also invalidate related operation
          queryClient.invalidateQueries({ queryKey: ["operations", data.operation_id] });
        }

        if (data.threshold_exceeded !== undefined) {
          queryClient.invalidateQueries({
            queryKey: ["cp_alerts", "by_threshold", data.threshold_exceeded],
          });
        }

        if (data.alert_level) {
          queryClient.invalidateQueries({
            queryKey: ["cp_alerts", "by_alert_level", data.alert_level],
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
