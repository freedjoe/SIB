import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Credit Payments ---
export function useCreditPayments(options: QueryOptions = {}) {
  return useSupabaseData("credit_payments", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useCreditPayment(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("credit_payments", [id], {
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

export function useCreditPaymentsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("credit_payments", ["by_operation", operationId], {
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

export function useCreditPaymentsByFiscalYear(fiscalYearId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("credit_payments", ["by_fiscal_year", fiscalYearId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("fiscal_year_id", fiscalYearId),
    enabled: !!fiscalYearId && options.enabled !== false,
    sort: options.sort || { column: "created_at", ascending: false },
  });
}

export function useCreditPaymentMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("credit_payments", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["credit_payments"] });

      // Update any individual credit payment queries if this was an update
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["credit_payments", data.id] });

        if (data.operation_id) {
          queryClient.invalidateQueries({
            queryKey: ["credit_payments", "by_operation", data.operation_id],
          });

          // Also invalidate related operation to update consumed amounts
          queryClient.invalidateQueries({ queryKey: ["operations", data.operation_id] });
        }

        if (data.fiscal_year_id) {
          queryClient.invalidateQueries({
            queryKey: ["credit_payments", "by_fiscal_year", data.fiscal_year_id],
          });
        }
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });
}
