import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Previsions CP ---
export const usePrevisionsCP = (options: QueryOptions = {}) => {
  return useSupabaseData("previsions_cp", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select:
      options.select ||
      `
      *,
      operation:operation_id (*),
      engagement:engagement_id (*)
    `,
    sort: options.sort || { column: "created_at", ascending: false },
  });
};

export const usePrevisionCP = (id: string | null, options: QueryOptions = {}) => {
  return useSupabaseData("previsions_cp", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select:
      options.select ||
      `
      *,
      operation:operation_id (*),
      engagement:engagement_id (*)
    `,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
};

export const usePrevisionsCPByOperation = (operationId: string | null, options: QueryOptions = {}) => {
  return useSupabaseData("previsions_cp", ["by_operation", operationId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select:
      options.select ||
      `
      *,
      operation:operation_id (*),
      engagement:engagement_id (*)
    `,
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
  });
};

export const usePrevisionCPMutation = (options: MutationOptions = {}) => {
  const queryClient = useQueryClient();

  return useSupabaseMutation("previsions_cp", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["previsions_cp"] });

      // Update any individual prevision CP queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["previsions_cp", data.id] });
        queryClient.invalidateQueries({ queryKey: ["previsions_cp", "by_operation", data.operation_id] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
};
