import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- CP Forecasts ---
export function useCPForecasts(options: QueryOptions = {}) {
  return useSupabaseData("cp_forecasts", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useCPForecast(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_forecasts", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useCPForecastsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_forecasts", ["by_operation", operationId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useCPForecastsByFiscalYear(fiscalYearId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_forecasts", ["by_fiscal_year", fiscalYearId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("fiscal_year_id", fiscalYearId),
    enabled: !!fiscalYearId && options.enabled !== false,
    sort: options.sort || { column: "forecast_cp", ascending: false },
  });
}

export function useCPForecastMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("cp_forecasts", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["cp_forecasts"] });

      // Update any individual CP forecast queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["cp_forecasts", data.id] });

        if (data.operation_id) {
          queryClient.invalidateQueries({
            queryKey: ["cp_forecasts", "by_operation", data.operation_id],
          });

          // Also invalidate related operation
          queryClient.invalidateQueries({ queryKey: ["operations", data.operation_id] });
        }

        if (data.fiscal_year_id) {
          queryClient.invalidateQueries({
            queryKey: ["cp_forecasts", "by_fiscal_year", data.fiscal_year_id],
          });

          // Also invalidate fiscal year to update aggregates
          queryClient.invalidateQueries({ queryKey: ["fiscal_years", data.fiscal_year_id] });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
