import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Requests ---
export function useRequests(options: QueryOptions = {}) {
  return useSupabaseData("requests", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, ministry:ministry_id(*), fiscal_year:fiscal_year_id(*)",
    sort: options.sort || { column: "date_submitted", ascending: false },
  });
}

export function useRequest(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("requests", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, ministry:ministry_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useRequestsByMinistry(ministryId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("requests", ["by_ministry", ministryId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, ministry:ministry_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("ministry_id", ministryId),
    enabled: !!ministryId && options.enabled !== false,
    sort: options.sort || { column: "date_submitted", ascending: false },
  });
}

export function useRequestsByFiscalYear(fiscalYearId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("requests", ["by_fiscal_year", fiscalYearId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, ministry:ministry_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("fiscal_year_id", fiscalYearId),
    enabled: !!fiscalYearId && options.enabled !== false,
    sort: options.sort || { column: "date_submitted", ascending: false },
  });
}

export function useRequestsByStatus(status: string, options: QueryOptions = {}) {
  return useSupabaseData("requests", ["by_status", status], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, ministry:ministry_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("status", status),
    enabled: !!status && options.enabled !== false,
    sort: options.sort || { column: "date_submitted", ascending: false },
  });
}

export function useRequestMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("requests", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["requests"] });

      // Update any individual request queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["requests", data.id] });

        // Invalidate related queries
        if (data.ministry_id) {
          queryClient.invalidateQueries({ queryKey: ["requests", "by_ministry", data.ministry_id] });
        }

        if (data.fiscal_year_id) {
          queryClient.invalidateQueries({ queryKey: ["requests", "by_fiscal_year", data.fiscal_year_id] });
        }

        if (data.status) {
          queryClient.invalidateQueries({ queryKey: ["requests", "by_status", data.status] });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
