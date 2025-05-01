import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

// Define the types based on your existing types
import type { PrevisionCP } from "@/types/prevision_cp";

// Helper type for filter functions
type FilterFunction = (query: PostgrestFilterBuilder<any>) => PostgrestFilterBuilder<any>;

/**
 * Hook to fetch previsions CP data
 */
export const usePrevisionsCP = (
  options: {
    filter?: FilterFunction;
    select?: string;
  } = {},
  queryOptions = {}
) => {
  return useQuery(
    ["previsions-cp", options],
    async () => {
      let query = supabase.from("previsions_cp").select(
        options.select ||
          `
          *,
          operation:operation_id (*),
          engagement:engagement_id (*)
        `
      );

      // Apply any filters
      if (options.filter) {
        query = options.filter(query);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Error fetching previsions CP: ${error.message}`);
      }

      return data as PrevisionCP[];
    },
    {
      ...queryOptions,
    }
  );
};

/**
 * Hook to fetch a single prevision CP by ID
 */
export const usePrevisionCP = (id: string, queryOptions = {}) => {
  return useQuery(
    ["prevision-cp", id],
    async () => {
      const { data, error } = await supabase
        .from("previsions_cp")
        .select(
          `
          *,
          operation:operation_id (*),
          engagement:engagement_id (*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Error fetching prevision CP: ${error.message}`);
      }

      return data as PrevisionCP;
    },
    {
      ...queryOptions,
      enabled: !!id,
    }
  );
};
