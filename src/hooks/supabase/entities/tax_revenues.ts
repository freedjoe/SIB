import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Tax Revenues ---
export function useTaxRevenues(options: QueryOptions = {}) {
  return useSupabaseData("tax_revenues", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, fiscal_year:fiscal_year_id(*)",
    sort: options.sort || { column: "amount", ascending: false },
  });
}

export function useTaxRevenue(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("tax_revenues", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useTaxRevenuesByFiscalYear(fiscalYearId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("tax_revenues", ["by_fiscal_year", fiscalYearId], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("fiscal_year_id", fiscalYearId),
    enabled: !!fiscalYearId && options.enabled !== false,
    sort: options.sort || { column: "amount", ascending: false },
  });
}

export function useTaxRevenuesByBeneficiary(beneficiary: string | null, options: QueryOptions = {}) {
  return useSupabaseData("tax_revenues", ["by_beneficiary", beneficiary], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    select: options.select || "*, fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("beneficiary", beneficiary),
    enabled: !!beneficiary && options.enabled !== false,
    sort: options.sort || { column: "amount", ascending: false },
  });
}

export function useTaxRevenueMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("tax_revenues", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["tax_revenues"] });

      // Update any individual tax revenue queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["tax_revenues", data.id] });

        if (data.fiscal_year_id) {
          queryClient.invalidateQueries({
            queryKey: ["tax_revenues", "by_fiscal_year", data.fiscal_year_id],
          });

          // Also invalidate related fiscal year
          queryClient.invalidateQueries({ queryKey: ["fiscal_years", data.fiscal_year_id] });
        }

        if (data.beneficiary) {
          queryClient.invalidateQueries({
            queryKey: ["tax_revenues", "by_beneficiary", data.beneficiary],
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
