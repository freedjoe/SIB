import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Roles ---
export function useRoles(options: QueryOptions = {}) {
  return useSupabaseData("roles", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function useRole(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("roles", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useRoleByName(name: string | null, options: QueryOptions = {}) {
  return useSupabaseData("roles", ["by_name", name], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("name", name),
    enabled: !!name && options.enabled !== false,
  });
}

export function useRoleMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("roles", {
    ...options,
    invalidateTables: ["permissions", "users", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["roles"] });

      // Update any individual role queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["roles", data.id] });

        if (data.name) {
          queryClient.invalidateQueries({ queryKey: ["roles", "by_name", data.name] });
        }

        // Also invalidate permissions that might reference this role
        queryClient.invalidateQueries({ queryKey: ["permissions", "by_role", data.id] });

        // Also invalidate users that might have this role
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
