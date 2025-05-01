import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Payment Requests ---
export function usePaymentRequests(options: QueryOptions = {}) {
  return useSupabaseData("payment_requests", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    sort: options.sort || { column: "request_date", ascending: false },
  });
}

export function usePaymentRequest(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payment_requests", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function usePaymentRequestsByEngagement(engagementId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payment_requests", ["by_engagement", engagementId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("engagement_id", engagementId),
    enabled: !!engagementId && options.enabled !== false,
    sort: options.sort || { column: "request_date", ascending: false },
  });
}

export function usePaymentRequestsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payment_requests", ["by_operation", operationId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
    sort: options.sort || { column: "request_date", ascending: false },
  });
}

export function usePaymentRequestsByStatus(status: string, options: QueryOptions = {}) {
  return useSupabaseData("payment_requests", ["by_status", status], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("status", status),
    enabled: !!status && options.enabled !== false,
    sort: options.sort || { column: "request_date", ascending: false },
  });
}

export function usePaymentRequestMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("payment_requests", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["payment_requests"] });

      // Update any individual payment request queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["payment_requests", data.id] });

        if (data.engagement_id) {
          queryClient.invalidateQueries({
            queryKey: ["payment_requests", "by_engagement", data.engagement_id],
          });

          // Also invalidate related engagement
          queryClient.invalidateQueries({ queryKey: ["engagements", data.engagement_id] });
        }

        if (data.operation_id) {
          queryClient.invalidateQueries({
            queryKey: ["payment_requests", "by_operation", data.operation_id],
          });

          // Also invalidate related operation
          queryClient.invalidateQueries({ queryKey: ["operations", data.operation_id] });
        }

        if (data.status) {
          queryClient.invalidateQueries({
            queryKey: ["payment_requests", "by_status", data.status],
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
