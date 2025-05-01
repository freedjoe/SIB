import { useSupabaseData } from "../core/useSupabaseData";
import { useSupabaseMutation, MutationOptions } from "../core/useSupabaseMutation";
import { QueryOptions } from "../core/useSupabaseQuery";

// --- Budget Categories ---
export function useBudgetCategories(options: QueryOptions = {}) {
  return useSupabaseData("budget_categories", ["all"], {
    ...options,
    sort: options.sort || { column: "code", ascending: true },
  });
}

export function useBudgetCategory(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("budget_categories", [id], {
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useBudgetCategoryMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("budget_categories", options);
}
