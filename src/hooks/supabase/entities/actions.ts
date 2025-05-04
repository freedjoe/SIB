// filepath: c:\Projects\SIB\src\hooks\supabase\entities\actions.ts
// ENTITY LEVEL 4: Actions (Child of Program)
import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Actions ---
export function useActions(options: QueryOptions = {}) {
  return useSupabaseData("actions", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, program:program_id(*)",
    sort: options.sort || { column: "code", ascending: true },
  });
}

export function useAction(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("actions", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, program:program_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useActionsByProgram(programId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("actions", ["by_program", programId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, program:program_id(*)",
    filter: (query) => query.eq("program_id", programId),
    enabled: !!programId && options.enabled !== false,
  });
}

export function useActionMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("actions", {
    ...options,
    invalidateTables: ["operations", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["actions"] });

      // Update any individual action queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["actions", data.id] });
        queryClient.invalidateQueries({ queryKey: ["actions", "by_program", data.program_id] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
