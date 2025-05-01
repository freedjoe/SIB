import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Operations ---
export function useOperations(options: QueryOptions = {}) {
  return useSupabaseData("operations", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, action:action_id(*)",
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function useOperation(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("operations", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, action:action_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useOperationsByAction(actionId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("operations", ["by_action", actionId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, action:action_id(*)",
    filter: (query) => query.eq("action_id", actionId),
    enabled: !!actionId && options.enabled !== false,
  });
}

export function useOperationMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("operations", {
    ...options,
    invalidateTables: ["engagements", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["operations"] });

      // Update any individual operation queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["operations", data.id] });
        queryClient.invalidateQueries({ queryKey: ["operations", "by_action", data.action_id] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
