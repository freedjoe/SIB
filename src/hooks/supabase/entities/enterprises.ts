import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Enterprises ---
export function useEnterprises(options: QueryOptions = {}) {
  return useSupabaseData("enterprises", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function useEnterprise(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("enterprises", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useEnterpriseByNif(nif: string | null, options: QueryOptions = {}) {
  return useSupabaseData("enterprises", ["by_nif", nif], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("nif", nif),
    enabled: !!nif && options.enabled !== false,
  });
}

export function useEnterpriseByRC(rc: string | null, options: QueryOptions = {}) {
  return useSupabaseData("enterprises", ["by_rc", rc], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("rc", rc),
    enabled: !!rc && options.enabled !== false,
  });
}

export function useEnterpriseSearch(searchTerm: string | null, options: QueryOptions = {}) {
  return useSupabaseData("enterprises", ["search", searchTerm], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: false, // Disable realtime for search queries
    ...options,
    filter: (query) => {
      if (!searchTerm) return query;
      return query.ilike("name", `%${searchTerm}%`);
    },
    enabled: !!searchTerm && options.enabled !== false,
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function useEnterpriseMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("enterprises", {
    ...options,
    invalidateTables: ["deals", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["enterprises"] });

      // Update any individual enterprise queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["enterprises", data.id] });

        if (data.nif) {
          queryClient.invalidateQueries({ queryKey: ["enterprises", "by_nif", data.nif] });
        }

        if (data.rc) {
          queryClient.invalidateQueries({ queryKey: ["enterprises", "by_rc", data.rc] });
        }

        // Invalidate any search queries that might include this enterprise
        queryClient.invalidateQueries({ queryKey: ["enterprises", "search"] });

        // Invalidate any deals that might involve this enterprise
        queryClient.invalidateQueries({ queryKey: ["deals"] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
