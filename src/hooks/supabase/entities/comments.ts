import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Comments ---
export function useComments(options: QueryOptions = {}) {
  return useSupabaseData("comments", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, user:user_id(*)",
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useComment(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("comments", [id], {
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

export function useCommentsByEntity(entityType: string, entityId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("comments", ["by_entity", entityType, entityId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, user:user_id(*)",
    filter: (query) => query.eq("entity_type", entityType).eq("entity_id", entityId),
    enabled: !!entityId && options.enabled !== false,
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useCommentsByParent(parentId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("comments", ["by_parent", parentId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, user:user_id(*)",
    filter: (query) => query.eq("parent_id", parentId),
    enabled: !!parentId && options.enabled !== false,
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useCommentMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("comments", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["comments"] });

      // Update any individual comment queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["comments", data.id] });

        // Invalidate related queries
        if (data.entity_type && data.entity_id) {
          queryClient.invalidateQueries({
            queryKey: ["comments", "by_entity", data.entity_type, data.entity_id],
          });
        }

        if (data.parent_id) {
          queryClient.invalidateQueries({ queryKey: ["comments", "by_parent", data.parent_id] });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
