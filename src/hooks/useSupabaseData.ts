import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { TableRow, TableTypes } from "@/types/database.types";
import { localStorageCache } from "@/lib/utils";

// Type definitions for query and mutation options
type BaseQueryOptions = {
  enabled?: boolean;
  realtime?: boolean;
  staleTime?: number;
  select?: string;
  onError?: (error: Error) => void;
};

type FilterOption<T = any> = {
  filter?: (query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, T[]>;
};

type SortOption = {
  sort?: {
    column: string;
    ascending: boolean;
  };
};

type QueryOptions<T = any> = BaseQueryOptions & FilterOption<T> & SortOption;

type MutationOptions = {
  onSuccess?: (data?: any) => void;
  onError?: (error: Error) => void;
  invalidateTables?: string[];
};

// ============================================================================
// CORE DATA FETCHING AND REALTIME HOOKS
// ============================================================================

/**
 * Base hook for fetching data from Supabase
 */
export function useSupabaseQuery<T extends keyof TableTypes>(table: T, queryKey: string[], options: QueryOptions<TableTypes[T]> = {}) {
  const {
    select = "*",
    filter,
    enabled = true,
    staleTime = 1000 * 60 * 5, // 5 minutes by default
    onError,
  } = options;

  return useQuery({
    queryKey: [table, ...queryKey],
    queryFn: async () => {
      // Generate cache key for this specific query
      const cacheKey = localStorageCache.getCacheKey(String(table), queryKey);

      // Try to get data from cache first
      const cachedData = localStorageCache.getFromCache<TableTypes[T][]>(cacheKey);

      // If we have fresh cached data, use it
      if (cachedData && !localStorageCache.isStale(cachedData.timestamp, staleTime)) {
        console.log(`Using cached data for ${String(table)}:`, queryKey);
        return cachedData.data;
      }

      // If no cached data or it's stale, fetch from API
      try {
        let query = supabase.from(String(table)).select(select);

        if (filter) {
          // Apply filter function using type casting to avoid TS errors
          query = (filter as any)(query);
        }

        if (options.sort) {
          query = query.order(options.sort.column, { ascending: options.sort.ascending });
        }

        const { data, error } = await query;

        if (error) throw error;

        // Cache the fresh data
        if (data) {
          localStorageCache.saveToCache(cacheKey, data);
        }

        return data;
      } catch (error) {
        console.error(`Error fetching data from ${String(table)}:`, error);
        if (onError && error instanceof Error) {
          onError(error);
        } else {
          toast({
            title: "Error",
            description: `Failed to load data from ${String(table)}`,
            variant: "destructive",
          });
        }
        throw error;
      }
    },
    enabled,
    staleTime,
  });
}

/**
 * Hook for setting up Supabase realtime subscriptions
 */
export function useSupabaseRealtime(table: string, queryKey: string[] = []) {
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Skip if queryKey is empty (means realtime is disabled)
    if (!queryKey.length) return;

    // Create and subscribe to the channel
    const newChannel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          console.log(`Realtime update for ${table}:`, payload);
          queryClient.invalidateQueries({ queryKey: [table, ...queryKey] });
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${table}:`, status);
      });

    setChannel(newChannel);

    // Cleanup
    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
      }
    };
  }, [table, queryClient, JSON.stringify(queryKey)]);

  return channel;
}

/**
 * Combined hook for fetching data and optionally setting up realtime subscriptions
 */
export function useSupabaseData<T extends keyof TableTypes>(table: T, queryKey: string[] = [], options: QueryOptions<TableTypes[T]> = {}) {
  const { realtime = true, ...queryOptions } = options;
  const query = useSupabaseQuery<T>(table, queryKey, queryOptions);

  // Setup realtime subscription only if enabled
  useSupabaseRealtime(
    table,
    realtime ? queryKey : [] // Empty array disables the subscription
  );

  return query;
}

/**
 * Hook for mutations (insert, update, delete)
 */
export function useSupabaseMutation<T extends keyof TableTypes>(table: T, options: MutationOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, invalidateTables = [] } = options;

  return useMutation({
    mutationFn: async ({
      type,
      data,
      id,
      column = "id",
    }: {
      type: "INSERT" | "UPDATE" | "DELETE" | "UPSERT";
      data?: Partial<TableTypes[T]>;
      id?: string;
      column?: string;
    }) => {
      try {
        switch (type) {
          case "INSERT": {
            const { data: insertedData, error: insertError } = await supabase.from(table).insert(data).select().single();

            if (insertError) throw insertError;
            return insertedData as TableTypes[T];
          }

          case "UPSERT": {
            const { data: upsertedData, error: upsertError } = await supabase.from(table).upsert(data).select().single();

            if (upsertError) throw upsertError;
            return upsertedData as TableTypes[T];
          }

          case "UPDATE": {
            if (!id) throw new Error("ID is required for update");
            const { data: updatedData, error: updateError } = await supabase.from(table).update(data).eq(column, id).select().single();

            if (updateError) throw updateError;
            return updatedData as TableTypes[T];
          }

          case "DELETE": {
            if (!id) throw new Error("ID is required for delete");
            const { error: deleteError } = await supabase.from(table).delete().eq(column, id);

            if (deleteError) throw deleteError;
            return { id } as Partial<TableTypes[T]>;
          }

          default:
            throw new Error(`Unsupported mutation type: ${type}`);
        }
      } catch (error) {
        console.error(`Error in ${table} mutation:`, error);
        if (onError && error instanceof Error) {
          onError(error);
        } else {
          toast({
            title: "Error",
            description: `Operation on ${table} failed`,
            variant: "destructive",
          });
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate the table that was modified
      queryClient.invalidateQueries({ queryKey: [table] });

      // Invalidate any additional tables that might be affected
      invalidateTables.forEach((relatedTable) => {
        queryClient.invalidateQueries({ queryKey: [relatedTable] });
      });

      if (onSuccess) onSuccess(data);
    },
    onError: (error: Error) => {
      if (onError) onError(error);
    },
  });
}

/**
 * Hook for batch operations
 */
export function useSupabaseBatchMutation<T extends keyof TableTypes>(table: T, options: MutationOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError, invalidateTables = [] } = options;

  return useMutation({
    mutationFn: async (
      operations: Array<{
        type: "INSERT" | "UPDATE" | "DELETE" | "UPSERT";
        data?: Partial<TableTypes[T]>;
        id?: string;
        column?: string;
      }>
    ) => {
      const results: Array<Partial<TableTypes[T]>> = [];

      for (const op of operations) {
        try {
          const { type, data, id, column = "id" } = op;

          switch (type) {
            case "INSERT": {
              const { data: insertedData, error: insertError } = await supabase.from(table).insert(data).select().single();

              if (insertError) throw insertError;
              results.push(insertedData as TableTypes[T]);
              break;
            }

            case "UPSERT": {
              const { data: upsertedData, error: upsertError } = await supabase.from(table).upsert(data).select().single();

              if (upsertError) throw upsertError;
              results.push(upsertedData as TableTypes[T]);
              break;
            }

            case "UPDATE": {
              if (!id) throw new Error("ID is required for update");
              const { data: updatedData, error: updateError } = await supabase.from(table).update(data).eq(column, id).select().single();

              if (updateError) throw updateError;
              results.push(updatedData as TableTypes[T]);
              break;
            }

            case "DELETE": {
              if (!id) throw new Error("ID is required for delete");
              const { error: deleteError } = await supabase.from(table).delete().eq(column, id);

              if (deleteError) throw deleteError;
              results.push({ id } as Partial<TableTypes[T]>);
              break;
            }
          }
        } catch (error) {
          console.error(`Error in batch operation for ${table}:`, error);
          if (onError && error instanceof Error) {
            onError(error);
          }
          throw error;
        }
      }

      return results;
    },
    onSuccess: (data) => {
      // Invalidate the table that was modified
      queryClient.invalidateQueries({ queryKey: [table] });

      // Invalidate any additional tables that might be affected
      invalidateTables.forEach((relatedTable) => {
        queryClient.invalidateQueries({ queryKey: [relatedTable] });
      });

      if (onSuccess) onSuccess(data);
    },
    onError: (error: Error) => {
      if (onError) onError(error);
    },
  });
}

// ============================================================================
// AUTH HOOKS
// ============================================================================

/**
 * Hook for user login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate user-related queries to refetch with new auth context
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

/**
 * Hook for user signup
 */
export function useSignup() {
  return useMutation({
    mutationFn: async ({ email, password, userData = {} }: { email: string; password: string; userData?: Record<string, any> }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook for user logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      // Reset all queries after logout
      queryClient.clear();
    },
  });
}

/**
 * Hook for fetching current user and session
 */
export function useAuthUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook for getting current user session
 */
export function useSession() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });
}

/**
 * Hook to reset password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return true;
    },
  });
}

/**
 * Hook to update password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return true;
    },
  });
}

// ============================================================================
// STORAGE HOOKS
// ============================================================================

/**
 * Hook for uploading files to storage
 */
export function useStorageUpload(bucket: string) {
  return useMutation({
    mutationFn: async ({
      file,
      path,
      options = {},
    }: {
      file: File;
      path?: string;
      options?: {
        cacheControl?: string;
        upsert?: boolean;
      };
    }) => {
      const filePath = path ? `${path}/${file.name}` : file.name;

      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, options);

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook for downloading files from storage
 */
export function useStorageDownload(bucket: string) {
  return useMutation({
    mutationFn: async ({ path }: { path: string }) => {
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to get a public URL for a file
 */
export function useStoragePublicUrl(bucket: string, path: string | null) {
  return useQuery({
    queryKey: ["storage", bucket, path],
    queryFn: async () => {
      if (!path) return null;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data?.publicUrl || null;
    },
    enabled: !!path,
  });
}

/**
 * Hook for listing files in a bucket
 */
export function useStorageList(bucket: string, path?: string) {
  return useQuery({
    queryKey: ["storage", bucket, "list", path],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(bucket).list(path || "");
      if (error) throw error;
      return data || [];
    },
  });
}

/**
 * Hook for deleting files from storage
 */
export function useStorageDelete(bucket: string) {
  return useMutation({
    mutationFn: async ({ paths }: { paths: string[] }) => {
      const { data, error } = await supabase.storage.from(bucket).remove(paths);
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================================
// FUNCTIONS HOOKS
// ============================================================================

/**
 * Hook for invoking Supabase Edge Functions
 */
export function useFunction<T = any, U = any>(functionName: string) {
  return useMutation({
    mutationFn: async (payload: T) => {
      const { data, error } = await supabase.functions.invoke<U>(functionName, {
        body: payload,
      });

      if (error) throw error;
      return data;
    },
  });
}

// ============================================================================
// TABLE-SPECIFIC HOOKS
// ============================================================================

// --- Fiscal Years ---
export function useFiscalYears(options: QueryOptions = {}) {
  return useSupabaseData("fiscal_years", ["all"], {
    ...options,
    sort: options.sort || { column: "year", ascending: false },
  });
}

export function useFiscalYear(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("fiscal_years", [id], {
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useFiscalYearMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("fiscal_years", options);
}

// --- Ministries ---
export function useMinistries(options: QueryOptions = {}) {
  return useSupabaseData("ministries", ["all"], {
    ...options,
    sort: options.sort || { column: "name_fr", ascending: true },
  });
}

export function useMinistry(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("ministries", [id], {
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useMinistryMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("ministries", options);
}

// --- Budget Categories ---
export function useBudgetCategories(options: QueryOptions = {}) {
  return useSupabaseData("budget_categories", ["all"], options);
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

// --- Portfolios ---
export function usePortfolios(options: QueryOptions = {}) {
  return useSupabaseData("portfolios", ["all"], {
    ...options,
    select: options.select || "*, ministry:ministry_id(*)",
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function usePortfolio(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("portfolios", [id], {
    ...options,
    select: options.select || "*, ministry:ministry_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function usePortfolioMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("portfolios", {
    ...options,
    invalidateTables: ["programs", ...(options.invalidateTables || [])],
  });
}

// --- Programs ---
export function usePrograms(options: QueryOptions = {}) {
  return useSupabaseData("programs", ["all"], {
    ...options,
    select: options.select || "*, portfolio:portfolio_id(*)",
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function useProgram(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("programs", [id], {
    ...options,
    select: options.select || "*, portfolio:portfolio_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useProgramsByPortfolio(portfolioId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("programs", ["by_portfolio", portfolioId], {
    ...options,
    select: options.select || "*, portfolio:portfolio_id(*)",
    filter: (query) => query.eq("portfolio_id", portfolioId),
    enabled: !!portfolioId && options.enabled !== false,
  });
}

export function useProgramMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("programs", {
    ...options,
    invalidateTables: ["actions", ...(options.invalidateTables || [])],
  });
}

// --- Actions ---
export function useActions(options: QueryOptions = {}) {
  return useSupabaseData("actions", ["all"], {
    ...options,
    select: options.select || "*, program:program_id(*)",
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function useAction(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("actions", [id], {
    ...options,
    select: options.select || "*, program:program_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useActionsByProgram(programId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("actions", ["by_program", programId], {
    ...options,
    select: options.select || "*, program:program_id(*)",
    filter: (query) => query.eq("program_id", programId),
    enabled: !!programId && options.enabled !== false,
  });
}

export function useActionMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("actions", {
    ...options,
    invalidateTables: ["operations", ...(options.invalidateTables || [])],
  });
}

// --- Wilayas ---
export function useWilayas(options: QueryOptions = {}) {
  return useSupabaseData("wilayas", ["all"], {
    ...options,
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function useWilaya(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("wilayas", [id], {
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useWilayaMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("wilayas", options);
}

// --- Operations ---
export function useOperations(options: QueryOptions = {}) {
  return useSupabaseData("operations", ["all"], {
    ...options,
    select: options.select || "*, action:action_id(*), wilaya:wilaya_id(*), budget_category:budget_category_id(*)",
  });
}

export function useOperation(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("operations", [id], {
    ...options,
    select: options.select || "*, action:action_id(*), wilaya:wilaya_id(*), budget_category:budget_category_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useOperationsByAction(actionId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("operations", ["by_action", actionId], {
    ...options,
    select: options.select || "*, action:action_id(*), wilaya:wilaya_id(*), budget_category:budget_category_id(*)",
    filter: (query) => query.eq("action_id", actionId),
    enabled: !!actionId && options.enabled !== false,
  });
}

export function useOperationMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("operations", {
    ...options,
    invalidateTables: ["engagements", "payments", "cp_forecasts", "cp_mobilisations", ...(options.invalidateTables || [])],
  });
}

// --- Engagements ---
export function useEngagements(options: QueryOptions = {}) {
  return useSupabaseData("engagements", ["all"], {
    ...options,
    select: options.select || "*, operation:operation_id(*)",
  });
}

export function useEngagement(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("engagements", [id], {
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useEngagementsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("engagements", ["by_operation", operationId], {
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
  });
}

export function useEngagementMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("engagements", {
    ...options,
    invalidateTables: ["revaluations", "operations", ...(options.invalidateTables || [])],
  });
}

// --- Revaluations ---
export function useRevaluations(options: QueryOptions = {}) {
  return useSupabaseData("revaluations", ["all"], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*)",
  });
}

export function useRevaluation(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("revaluations", [id], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useRevaluationsByEngagement(engagementId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("revaluations", ["by_engagement", engagementId], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*)",
    filter: (query) => query.eq("engagement_id", engagementId),
    enabled: !!engagementId && options.enabled !== false,
  });
}

export function useRevaluationMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("revaluations", {
    ...options,
    invalidateTables: ["engagements", ...(options.invalidateTables || [])],
  });
}

// --- Credit Payments ---
export function useCreditPayments(options: QueryOptions = {}) {
  return useSupabaseData("credit_payments", ["all"], {
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
  });
}

export function useCreditPayment(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("credit_payments", [id], {
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useCreditPaymentsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("credit_payments", ["by_operation", operationId], {
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
  });
}

export function useCreditPaymentMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("credit_payments", {
    ...options,
  });
}

// --- Payments ---
export function usePayments(options: QueryOptions = {}) {
  return useSupabaseData("payments", ["all"], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    sort: options.sort || { column: "date", ascending: false },
  });
}

export function usePayment(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payments", [id], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function usePaymentsByEngagement(engagementId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payments", ["by_engagement", engagementId], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("engagement_id", engagementId),
    enabled: !!engagementId && options.enabled !== false,
  });
}

export function usePaymentsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payments", ["by_operation", operationId], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
  });
}

export function usePaymentMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("payments", {
    ...options,
    invalidateTables: ["engagements", "operations", ...(options.invalidateTables || [])],
  });
}

// --- Payment Requests ---
export function usePaymentRequests(options: QueryOptions = {}) {
  return useSupabaseData("payment_requests", ["all"], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    sort: options.sort || { column: "request_date", ascending: false },
  });
}

export function usePaymentRequest(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payment_requests", [id], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function usePaymentRequestsByEngagement(engagementId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payment_requests", ["by_engagement", engagementId], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("engagement_id", engagementId),
    enabled: !!engagementId && options.enabled !== false,
  });
}

export function usePaymentRequestsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("payment_requests", ["by_operation", operationId], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
  });
}

export function usePaymentRequestsByStatus(status: string, options: QueryOptions = {}) {
  return useSupabaseData("payment_requests", ["by_status", status], {
    ...options,
    select: options.select || "*, engagement:engagement_id(*), operation:operation_id(*)",
    filter: (query) => query.eq("status", status),
    enabled: !!status && options.enabled !== false,
  });
}

export function usePaymentRequestMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("payment_requests", {
    ...options,
    invalidateTables: ["payments", "engagements", "operations", ...(options.invalidateTables || [])],
  });
}

// --- CP Forecasts ---
export function useCPForecasts(options: QueryOptions = {}) {
  return useSupabaseData("cp_forecasts", ["all"], {
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
  });
}

export function useCPForecast(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_forecasts", [id], {
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useCPForecastsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_forecasts", ["by_operation", operationId], {
    ...options,
    select: options.select || "*, operation:operation_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
  });
}

export function useCPForecastMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("cp_forecasts", {
    ...options,
    invalidateTables: ["operations", ...(options.invalidateTables || [])],
  });
}

// --- CP Mobilisations ---
export function useCPMobilisations(options: QueryOptions = {}) {
  return useSupabaseData("cp_mobilisations", ["all"], {
    ...options,
    select: options.select || "*, operation:operation_id(*)",
  });
}

export function useCPMobilisation(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_mobilisations", [id], {
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useCPMobilisationsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_mobilisations", ["by_operation", operationId], {
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
  });
}

export function useCPMobilisationMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("cp_mobilisations", {
    ...options,
    invalidateTables: ["operations", "cp_consumptions", ...(options.invalidateTables || [])],
  });
}

// --- CP Consumptions ---
export function useCPConsumptions(options: QueryOptions = {}) {
  return useSupabaseData("cp_consumptions", ["all"], {
    ...options,
    select: options.select || "*, mobilisation:mobilisation_id(*)",
  });
}

export function useCPConsumption(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_consumptions", [id], {
    ...options,
    select: options.select || "*, mobilisation:mobilisation_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useCPConsumptionsByMobilisation(mobilisationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("cp_consumptions", ["by_mobilisation", mobilisationId], {
    ...options,
    select: options.select || "*, mobilisation:mobilisation_id(*)",
    filter: (query) => query.eq("mobilisation_id", mobilisationId),
    enabled: !!mobilisationId && options.enabled !== false,
  });
}

export function useCPConsumptionMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("cp_consumptions", {
    ...options,
    invalidateTables: ["cp_mobilisations", ...(options.invalidateTables || [])],
  });
}

// --- Special Funds ---
export function useSpecialFunds(options: QueryOptions = {}) {
  return useSupabaseData("special_funds", ["all"], options);
}

export function useSpecialFund(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("special_funds", [id], {
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useSpecialFundMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("special_funds", options);
}

// --- Roles ---
export function useRoles(options: QueryOptions = {}) {
  return useSupabaseData("roles", ["all"], options);
}

export function useRole(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("roles", [id], {
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useRoleMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("roles", {
    ...options,
    invalidateTables: ["users", ...(options.invalidateTables || [])],
  });
}

// --- Users ---
export function useUsers(options: QueryOptions = {}) {
  return useSupabaseData("users", ["all"], {
    ...options,
    select: options.select || "*, role:role_id(*)",
  });
}

export function useUser(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("users", [id], {
    ...options,
    select: options.select || "*, role:role_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useUserMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("users", {
    ...options,
    invalidateTables: ["user_profiles", ...(options.invalidateTables || [])],
  });
}

// --- User Profiles ---
export function useUserProfiles(options: QueryOptions = {}) {
  return useSupabaseData("user_profiles", ["all"], {
    ...options,
    select: options.select || "*, user:user_id(*), wilaya:wilaya_id(*)",
  });
}

export function useUserProfile(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("user_profiles", [id], {
    ...options,
    select: options.select || "*, user:user_id(*), wilaya:wilaya_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useUserProfileByUserId(userId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("user_profiles", ["by_user", userId], {
    ...options,
    select: options.select || "*, user:user_id(*), wilaya:wilaya_id(*)",
    filter: (query) => query.eq("user_id", userId),
    enabled: !!userId && options.enabled !== false,
  });
}

export function useUserProfileMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("user_profiles", options);
}

// --- Enterprises ---
export function useEnterprises(options: QueryOptions = {}) {
  return useSupabaseData("enterprises", ["all"], {
    ...options,
    sort: options.sort || { column: "name", ascending: true },
  });
}

export function useEnterprise(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("enterprises", [id], {
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useEnterpriseMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("enterprises", options);
}

// --- Report Types ---
export function useReportTypes(options: QueryOptions = {}) {
  return useSupabaseData("report_types", ["all"], options);
}

export function useReportType(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("report_types", [id], {
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useReportTypeMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("report_types", options);
}

// --- Statuses ---
export function useStatuses(options: QueryOptions = {}) {
  return useSupabaseData("statuses", ["all"], options);
}

export function useStatus(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("statuses", [id], {
    ...options,
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useStatusMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("statuses", options);
}

// --- Requests ---
export function useRequests(options: QueryOptions = {}) {
  return useSupabaseData("requests", ["all"], {
    ...options,
    select: options.select || "*, ministry:ministry_id(*), fiscal_year:fiscal_year_id(*)",
  });
}

export function useRequest(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("requests", [id], {
    ...options,
    select: options.select || "*, ministry:ministry_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useRequestsByMinistry(ministryId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("requests", ["by_ministry", ministryId], {
    ...options,
    select: options.select || "*, ministry:ministry_id(*), fiscal_year:fiscal_year_id(*)",
    filter: (query) => query.eq("ministry_id", ministryId),
    enabled: !!ministryId && options.enabled !== false,
  });
}

export function useRequestMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("requests", options);
}

// --- Deals ---
export function useDeals(options: QueryOptions = {}) {
  return useSupabaseData("deals", ["all"], {
    ...options,
    select: options.select || "*, operation:operation_id(*)",
  });
}

export function useDeal(id: string | null, options: QueryOptions = {}) {
  return useSupabaseData("deals", [id], {
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("id", id),
    enabled: !!id && options.enabled !== false,
  });
}

export function useDealsByOperation(operationId: string | null, options: QueryOptions = {}) {
  return useSupabaseData("deals", ["by_operation", operationId], {
    ...options,
    select: options.select || "*, operation:operation_id(*)",
    filter: (query) => query.eq("operation_id", operationId),
    enabled: !!operationId && options.enabled !== false,
  });
}

export function useDealMutation(options: MutationOptions = {}) {
  return useSupabaseMutation("deals", {
    ...options,
    invalidateTables: ["operations", ...(options.invalidateTables || [])],
  });
}

// --- Legacy hook aliases (for backward compatibility) ---
export const useCompanies = useEnterprises;
export const useCompany = useEnterprise;
export const useCompanyMutation = useEnterpriseMutation;

export const usePrevisionsCP = useCPForecasts;
export const usePrevisionCP = useCPForecast;
export const usePrevisionCPByOperation = useCPForecastsByOperation;
export const usePrevisionCPMutation = useCPForecastMutation;
