import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Engagements ---
export function useEngagements(options: QueryOptions = {}) {
  return useSupabaseData("engagements", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useEngagement(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("engagements", [id], {
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

export function useEngagementsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("engagements", ["by_operation", operationId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
  });
}

export function useEngagementMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("engagements", {
    ...options,
    invalidateTables: ["payments", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["engagements"] });

      // Update any individual engagement queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["engagements", data.id] });
        queryClient.invalidateQueries({ queryKey: ["engagements", "by_operation", data.operation_id] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}

// --- Revaluations ---
export function useRevaluations(options: QueryOptions = {}) {
  return useSupabaseData("revaluations", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, engagement:engagement_id(*)",
    sort: options.sort || { column: "revaluation_date", ascending: false },
  });
}

export function useRevaluation(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("revaluations", [id], {
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

export function useRevaluationsByEngagement(engagementId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("revaluations", ["by_engagement", engagementId], {
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

export function useRevaluationMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("revaluations", {
    ...options,
    invalidateTables: ["engagements", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["revaluations"] });

      // Update any individual revaluation queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["revaluations", data.id] });
        queryClient.invalidateQueries({ queryKey: ["revaluations", "by_engagement", data.engagement_id] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
