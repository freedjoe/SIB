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
    forceRefresh: true, // Force a fresh fetch when component mounts
    ...options,
    select: options.select || "*",
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function useOperation(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("operations", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    forceRefresh: true, // Force a fresh fetch when component mounts
    ...options,
    select: options.select || "*",
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
    forceRefresh: true, // Force a fresh fetch when component mounts
    ...options,
    select: options.select || "*, action:action_id(*), program:program_id(*), wilaya:wilaya_id(*), budget_title:budget_title_id(*)",
    filter: (query) => query.eq("action_id", actionId),
    enabled: !!actionId && options.enabled !== false,
  });
}

export function useOperationsByProgram(programId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("operations", ["by_program", programId], {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    realtime: true,
    forceRefresh: true,
    ...options,
    select: options.select || "*, program:program_id(*), action:action_id(*), wilaya:wilaya_id(*), budget_title:budget_title_id(*)",
    filter: (query) => query.eq("program_id", programId),
    enabled: !!programId && options.enabled !== false,
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

        // Also invalidate by program queries if program_id exists
        if (data.program_id) {
          queryClient.invalidateQueries({ queryKey: ["operations", "by_program", data.program_id] });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
