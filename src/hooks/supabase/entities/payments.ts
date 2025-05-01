import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Payments ---
export function usePayments(options: QueryOptions = {}) {
  return useSupabaseData("payments", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, engagement:engagement_id(*)",
    sort: options.sort || { column: "payment_date", ascending: false },
  });
}

export function usePayment(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payments", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, engagement:engagement_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function usePaymentsByEngagement(engagementId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payments", ["by_engagement", engagementId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, engagement:engagement_id(*)",
    filter: (query) => query.eq("engagement_id", engagementId),
    enabled: !!engagementId && options.enabled !== false,
  });
}

export function usePaymentMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("payments", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["payments"] });

      // Update any individual payment queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["payments", data.id] });
        queryClient.invalidateQueries({ queryKey: ["payments", "by_engagement", data.engagement_id] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
