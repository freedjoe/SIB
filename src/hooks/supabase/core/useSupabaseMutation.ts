import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { TableTypes } from "@/types/database.types";
import { toast } from "@/hooks/use-toast";

// Type definitions for mutation options
export type MutationOptions = {
  onSuccess?: (data?: any) => void;
  onError?: (error: Error) => void;
  invalidateTables?: string[];
};

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
