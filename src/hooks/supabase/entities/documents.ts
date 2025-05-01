import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Documents ---
export function useDocuments(options: QueryOptions = {}) {
  return useSupabaseData("documents", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, user:user_id(*)",
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useDocument(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("documents", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, user:user_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useDocumentsByEntity(entity: string, entityId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("documents", ["by_entity", entity, entityId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, user:user_id(*)",
    filter: (query) => query.eq("entity", entity).eq("entity_id", entityId),
    enabled: !!entityId && options.enabled !== false,
  });
}

export function useDocumentMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("documents", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["documents"] });

      // Update any individual document queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["documents", data.id] });
        if (data.entity && data.entity_id) {
          queryClient.invalidateQueries({ queryKey: ["documents", "by_entity", data.entity, data.entity_id] });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
