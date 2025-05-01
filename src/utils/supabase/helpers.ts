import { SupabaseClient } from "@supabase/supabase-js";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { TableTypes } from "@/types/database.types";

/**
 * Helper functions for common Supabase operations
 */

/**
 * Enhanced filter builder with type safety
 */
export function createFilter<T extends keyof TableTypes>(
  table: T,
  filterFn: (query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>
) {
  return filterFn;
}

/**
 * Paginate results from Supabase
 *
 * @param from Starting index
 * @param to Ending index
 */
export function paginateQuery(from: number, to: number) {
  return <T>(query: PostgrestFilterBuilder<any, any, any>): PostgrestFilterBuilder<any, any, T[]> => {
    return query.range(from, to) as PostgrestFilterBuilder<any, any, T[]>;
  };
}

/**
 * Search text in a specific column
 *
 * @param column Column name to search
 * @param searchTerm Search term
 * @param options.exact Match exact text
 * @param options.caseSensitive Case sensitive search
 */
export function searchColumn(column: string, searchTerm: string, options: { exact?: boolean; caseSensitive?: boolean } = {}) {
  return <T>(query: PostgrestFilterBuilder<any, any, any>): PostgrestFilterBuilder<any, any, T[]> => {
    if (!searchTerm) return query as PostgrestFilterBuilder<any, any, T[]>;

    if (options.exact) {
      return query.eq(column, searchTerm) as PostgrestFilterBuilder<any, any, T[]>;
    } else {
      const pattern = options.caseSensitive ? `%${searchTerm}%` : `%${searchTerm.toLowerCase()}%`;

      return query.ilike(column, pattern) as PostgrestFilterBuilder<any, any, T[]>;
    }
  };
}

/**
 * Filter by date range
 *
 * @param column Column containing dates
 * @param startDate Start date
 * @param endDate End date
 */
export function dateRangeFilter(column: string, startDate?: Date | null, endDate?: Date | null) {
  return <T>(query: PostgrestFilterBuilder<any, any, any>): PostgrestFilterBuilder<any, any, T[]> => {
    let filteredQuery = query;

    if (startDate) {
      filteredQuery = filteredQuery.gte(column, startDate.toISOString());
    }

    if (endDate) {
      filteredQuery = filteredQuery.lte(column, endDate.toISOString());
    }

    return filteredQuery as PostgrestFilterBuilder<any, any, T[]>;
  };
}

/**
 * Combine multiple filters into one
 *
 * @param filters Array of filter functions
 */
export function combineFilters<T>(...filters: Array<(query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>>) {
  return (query: PostgrestFilterBuilder<any, any, any>): PostgrestFilterBuilder<any, any, T[]> => {
    let result = query;
    for (const filter of filters) {
      result = filter(result);
    }
    return result as PostgrestFilterBuilder<any, any, T[]>;
  };
}
