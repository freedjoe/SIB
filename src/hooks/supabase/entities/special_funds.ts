import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";

// --- Special Funds ---
export function useSpecialFunds(options: QueryOptions = {}) {
  return useSupabaseData("special_funds", ["all"], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    sort: options.sort || { column: "balance_2023", ascending: false },
  });
}

export function useSpecialFund(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("special_funds", [id], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useSpecialFundByAccountNumber(accountNumber: string | null, options: QueryOptions = {}) {
  return useSupabaseData("special_funds", ["by_account", accountNumber], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("account_number", accountNumber),
    enabled: !!accountNumber && options.enabled !== false,
  });
}

export function useSpecialFundsByCategory(category: string | null, options: QueryOptions = {}) {
  return useSupabaseData("special_funds", ["by_category", category], {
    staleTime: Infinity, // Keep cached data indefinitely
    cacheTime: Infinity, // Keep the data cached forever
    refetchOnWindowFocus: false,
    realtime: true, // Enable realtime updates
    ...options,
    filter: (query) => query.eq("category", category),
    enabled: !!category && options.enabled !== false,
    sort: options.sort || { column: "balance_2023", ascending: false },
  });
}

export function useSpecialFundMutation(options: MutationOptions = {}) {
  const queryClient = useQueryClient();

  return useSupabaseMutation("special_funds", {
    ...options,
    onSuccess: (data) => {
      // Force immediate update of the cache
      queryClient.invalidateQueries({ queryKey: ["special_funds"] });

      // Update any individual special fund queries
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ["special_funds", data.id] });

        if (data.account_number) {
          queryClient.invalidateQueries({
            queryKey: ["special_funds", "by_account", data.account_number],
          });
        }

        if (data.category) {
          queryClient.invalidateQueries({
            queryKey: ["special_funds", "by_category", data.category],
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
