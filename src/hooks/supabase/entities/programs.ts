// filepath: c:\Projects\SIB\src\hooks\supabase\entities\programs.ts
// ENTITY LEVEL 3: Programs (Child of Portfolio)
import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Programs ---
export function usePrograms(options: QueryOptions = {}) {
  return useSupabaseData("programs", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, portfolio:portfolio_id(*)",
    sort: options.sort || { column: "code", ascending: true },
  });
}

export function useProgram(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("programs", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, portfolio:portfolio_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useProgramsByPortfolio(portfolioId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("programs", ["by_portfolio", portfolioId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, portfolio:portfolio_id(*)",
    filter: (query) => query.eq("portfolio_id", portfolioId),
    enabled: !!portfolioId && options.enabled !== false,
  });
}

export function useProgramMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("programs", {
    ...options,
    invalidateTables: ["actions", ...(options.invalidateTables || [])],
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["programs"] });

      // Update any individual program queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["programs", data.id] });
        queryClient.invalidateQueries({ queryKey: ["programs", "by_portfolio", data.portfolio_id] });
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
