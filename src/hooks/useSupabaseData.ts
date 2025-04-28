import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect, useMemo } from "react";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { Database } from "@/types/supabase";

type Schema = Database["public"];
type Tables = Schema["Tables"];
type TableName = keyof Tables;

type TableRow<T extends TableName> = Tables[T]["Row"] & Record<string, unknown>;

type SupabaseRealtimeOptions<T extends TableName> = {
  table: T;
  queryKey: string[];
  select?: string;
  filter?: (
    query: PostgrestFilterBuilder<Database["public"], TableRow<T>, TableRow<T>>
  ) => PostgrestFilterBuilder<Database["public"], TableRow<T>, TableRow<T>>;
};

export function useSupabaseRealtime<T extends TableName>(options: SupabaseRealtimeOptions<T>) {
  const { table, queryKey, select = "*", filter } = options;
  const queryClient = useQueryClient();
  const queryKeyString = useMemo(() => JSON.stringify(queryKey), [queryKey]);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      let queryBuilder = supabase.from(table).select(select) as PostgrestFilterBuilder<Database["public"], TableRow<T>, TableRow<T>>;
      if (filter) {
        queryBuilder = filter(queryBuilder);
      }
      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data as unknown as TableRow<T>[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`${String(table)}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: String(table),
        },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, queryClient, queryKey, queryKeyString]);

  return query;
}

// Rest of the hooks remain the same
export function useMinistriesRealtime() {
  return useSupabaseRealtime({
    table: "ministries",
    queryKey: ["ministries"],
    select: `*`,
  });
}

export function useOperationsRealtime() {
  return useSupabaseRealtime({
    table: "operations",
    queryKey: ["operations"],
    select: `*`,
  });
}

interface BudgetAllocationsOptions {
  sort?: {
    column: string;
    ascending: boolean;
  };
}

export function useBudgetAllocations(options?: BudgetAllocationsOptions) {
  return useSupabaseRealtime({
    table: "budget_allocations",
    queryKey: ["budget_allocations"],
    select: `*`,
    filter: (query) => {
      if (options?.sort) {
        return query.order(options.sort.column, { ascending: options.sort.ascending });
      }
      return query;
    },
  });
}

export interface EngagementsOptions {
  filter?: (
    query: PostgrestFilterBuilder<Database["public"], TableRow<"engagements">, TableRow<"engagements">>
  ) => PostgrestFilterBuilder<Database["public"], TableRow<"engagements">, TableRow<"engagements">>;
}

export function useEngagements(options?: EngagementsOptions) {
  return useSupabaseRealtime({
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
  });
}

// Generic mutation hook for Supabase tables
export function useSupabaseMutation<T extends TableName>(
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
    mutationFn: async ({ type, data, id }: { type: "INSERT" | "UPDATE" | "DELETE"; data?: Partial<TableRow<T>>; id?: string }) => {
      switch (type) {
        case "INSERT": {
          const { data: insertedData, error: insertError } = await supabase.from(table).insert(data).select().single();
          if (insertError) throw insertError;
          return insertedData as TableRow<T>;
        }

        case "UPDATE": {
          if (!id) throw new Error("ID is required for update");
          const { data: updatedData, error: updateError } = await supabase.from(table).update(data).eq("id", id).select().single();
          if (updateError) throw updateError;
          return updatedData as TableRow<T>;
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

export function usePortfoliosRealtime() {
  return useSupabaseRealtime({
    table: "portfolios",
    queryKey: ["portfolios"],
    select: "*",
  });
}

export function usePortfolioMutation(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
  return useSupabaseMutation("portfolios", options);
}

export const useProgramMutation = () => {
  return useSupabaseMutation<Database["public"]["Tables"]["programs"]["Insert"]>("programs");
};
