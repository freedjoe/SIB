import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect, useMemo } from "react";
import { Database } from "@/types/supabase";

// Define the basic types
type Schema = Database["public"];
type Tables = Schema["Tables"];
type TableName = keyof Tables;

// Create a more flexible type that can handle any table name
type SupabaseQueryOptions<T extends string> = {
  table: T;
  queryKey: string[];
  select?: string;
  filter?: (query: any) => any;
  realtime?: boolean;
};

/**
 * Hook for fetching data from Supabase without realtime subscriptions
 */
export function useSupabaseQuery<T extends string>(options: SupabaseQueryOptions<T>) {
  const { table, queryKey, select = "*", filter } = options;

  return useQuery({
    queryKey,
    queryFn: async () => {
      let queryBuilder = supabase.from(table).select(select);
      if (filter) {
        queryBuilder = filter(queryBuilder);
      }
      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook for setting up Supabase realtime subscriptions
 */
export function useSupabaseRealtime(table: string, queryKey: string[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (queryKey.length === 0) return;

    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryClient, queryKey]);
}

/**
 * Combined hook for fetching data and optionally setting up realtime subscriptions
 */
export function useSupabaseData<T extends string>(options: SupabaseQueryOptions<T>) {
  const { table, queryKey, realtime = true } = options;

  const query = useSupabaseQuery(options);

  useSupabaseRealtime(
    table,
    realtime ? queryKey : [] // If realtime is false, pass empty array to disable
  );

  return query;
}

// Table-specific hooks with optional realtime subscriptions
export function useMinistriesData(options?: { realtime?: boolean }) {
  return useSupabaseData({
    table: "ministries",
    queryKey: ["ministries"],
    select: "*",
    realtime: options?.realtime ?? true,
  });
}

export function useOperationsData(options?: { realtime?: boolean }) {
  return useSupabaseData({
    table: "operations",
    queryKey: ["operations"],
    select: "*",
    realtime: options?.realtime ?? true,
  });
}

// Legacy method names for backwards compatibility
export function useMinistriesRealtime() {
  return useMinistriesData({ realtime: true });
}

export function useOperationsRealtime() {
  return useOperationsData({ realtime: true });
}

// Add the missing useMinistries hook that matches the naming pattern in PrevisionsCP.tsx
export interface MinistriesOptions {
  sort?: {
    column: string;
    ascending: boolean;
  };
  filter?: (query: any) => any;
  realtime?: boolean;
}

export function useMinistries(options?: MinistriesOptions, queryOptions?: any) {
  return useSupabaseData({
    table: "ministries",
    queryKey: ["ministries"],
    select: "*",
    realtime: options?.realtime ?? true,
    filter: (query) => {
      let queryBuilder = query;

      if (options?.filter) {
        queryBuilder = options.filter(queryBuilder);
      }

      if (options?.sort) {
        queryBuilder = queryBuilder.order(options.sort.column, { ascending: options.sort.ascending });
      }

      return queryBuilder;
    },
  });
}

// Add the missing useOperations hook that matches the naming pattern in PrevisionsCP.tsx
export interface OperationsOptions {
  sort?: {
    column: string;
    ascending: boolean;
  };
  filter?: (query: any) => any;
  realtime?: boolean;
}

export function useOperations(options?: OperationsOptions, queryOptions?: any) {
  return useSupabaseData({
    table: "operations",
    queryKey: ["operations"],
    select: `*, 
      action:action_id (
        name,
        program_id,
        program:program_id (name)
      ),
      wilaya:wilaya_id (name)
    `,
    realtime: options?.realtime ?? true,
    filter: (query) => {
      let queryBuilder = query;

      if (options?.filter) {
        queryBuilder = options.filter(queryBuilder);
      }

      if (options?.sort) {
        queryBuilder = queryBuilder.order(options.sort.column, { ascending: options.sort.ascending });
      }

      return queryBuilder;
    },
  });
}

// Add the missing usePrevisionsCP hook that's referenced in PrevisionsCP.tsx
export interface PrevisionsCPOptions {
  sort?: {
    column: string;
    ascending: boolean;
  };
  filter?: (query: any) => any;
  realtime?: boolean;
}

export function usePrevisionsCP(options?: PrevisionsCPOptions, queryOptions?: any) {
  return useSupabaseData({
    table: "prevision_cp",
    queryKey: ["prevision_cp"],
    select: `*,
      engagement:engagement_id (
        id,
        amount,
        engagement_date,
        status,
        operation:operation_id (
          id,
          name,
          ministry:ministry_id (
            id,
            name_fr,
            code
          )
        )
      ),
      operation:operation_id (
        id,
        name,
        ministry:ministry_id (
          id,
          name_fr,
          code
        )
      )
    `,
    realtime: options?.realtime ?? true,
    filter: (query) => {
      let queryBuilder = query;

      if (options?.filter) {
        queryBuilder = options.filter(queryBuilder);
      }

      if (options?.sort) {
        queryBuilder = queryBuilder.order(options.sort.column, { ascending: options.sort.ascending });
      } else {
        // Default sorting - newest first
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
      }

      return queryBuilder;
    },
  });
}

interface BudgetAllocationsOptions {
  sort?: {
    column: string;
    ascending: boolean;
  };
  realtime?: boolean;
}

export function useBudgetAllocations(options?: BudgetAllocationsOptions) {
  return useSupabaseData({
    table: "budget_allocations",
    queryKey: ["budget_allocations"],
    select: "*",
    realtime: options?.realtime ?? true,
    filter: (query) => {
      if (options?.sort) {
        return query.order(options.sort.column, { ascending: options.sort.ascending });
      }
      return query;
    },
  });
}

export interface EngagementsOptions {
  filter?: (query: any) => any;
  realtime?: boolean;
}

export function useEngagements(options?: EngagementsOptions) {
  return useSupabaseData({
    table: "engagements",
    queryKey: ["engagements"],
    select: `*, operation:operation_id (
      name,
      action_id,
      action:action_id (
        name,
        program_id,
        program:program_id (name)
      )
    )`,
    filter: options?.filter,
    realtime: options?.realtime ?? true,
  });
}

// Add the missing Companies hook
export interface CompaniesOptions {
  sort?: {
    column: string;
    ascending: boolean;
  };
  filter?: (query: any) => any;
  realtime?: boolean;
}

export function useCompanies(options?: CompaniesOptions, queryOptions?: any) {
  return useSupabaseData({
    table: "companies",
    queryKey: ["companies"],
    select: "*",
    realtime: options?.realtime ?? true,
    filter: (query) => {
      let queryBuilder = query;

      if (options?.filter) {
        queryBuilder = options.filter(queryBuilder);
      }

      if (options?.sort) {
        queryBuilder = queryBuilder.order(options.sort.column, { ascending: options.sort.ascending });
      }

      return queryBuilder;
    },
  });
}

// Generic mutation hook for Supabase tables
export function useSupabaseMutation<T extends string>(
  table: T,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, data, id }: { type: "INSERT" | "UPDATE" | "DELETE"; data?: Record<string, unknown>; id?: string }) => {
      switch (type) {
        case "INSERT": {
          const { data: insertedData, error: insertError } = await supabase.from(table).insert(data).select().single();
          if (insertError) throw insertError;
          return insertedData;
        }

        case "UPDATE": {
          if (!id) throw new Error("ID is required for update");
          const { data: updatedData, error: updateError } = await supabase.from(table).update(data).eq("id", id).select().single();
          if (updateError) throw updateError;
          return updatedData;
        }

        case "DELETE": {
          if (!id) throw new Error("ID is required for delete");
          const { error: deleteError } = await supabase.from(table).delete().eq("id", id);
          if (deleteError) throw deleteError;
          return id;
        }

        default:
          throw new Error("Invalid mutation type");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error(`Error in ${table} mutation:`, error);
      onError?.(error);
    },
  });
}

export function useMinistryMutation(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
  return useSupabaseMutation("ministries", options);
}

export function useOperationMutation(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
  return useSupabaseMutation("operations", options);
}

// Table-specific hooks for tables that might not be in the typed schema
export function usePortfoliosData(options?: { realtime?: boolean }) {
  return useSupabaseData({
    table: "portfolios",
    queryKey: ["portfolios"],
    select: "*",
    realtime: options?.realtime ?? true,
  });
}

export function usePortfoliosRealtime() {
  return usePortfoliosData({ realtime: true });
}

export function usePortfolioMutation(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
  return useSupabaseMutation("portfolios", options);
}

export function useProgramsData(options?: { realtime?: boolean }) {
  return useSupabaseData({
    table: "programs",
    queryKey: ["programs"],
    select: "*",
    realtime: options?.realtime ?? true,
  });
}

export const useProgramMutation = () => {
  return useSupabaseMutation("programs");
};
