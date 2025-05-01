import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { toast } from "@/hooks/use-toast";
import { TableTypes } from "@/types/database.types";
import { localStorageCache } from "@/lib/utils";

// Type definitions for query options
export type BaseQueryOptions = {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  select?: string;
  onError?: (error: Error) => void;
  realtime?: boolean;
  networkMode?: "online" | "always" | "offlineFirst";
  forceRefresh?: boolean; // New option to force refresh regardless of cache
};

export type FilterOption<T = any> = {
  filter?: (query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, T[]>;
};

export type SortOption = {
  sort?: {
    column: string;
    ascending: boolean;
  };
};

export type QueryOptions<T = any> = BaseQueryOptions & FilterOption<T> & SortOption;

/**
 * Base hook for fetching data from Supabase
 */
export function useSupabaseQuery<T extends keyof TableTypes>(table: T, queryKey: string[], options: QueryOptions<TableTypes[T]> = {}) {
  const {
    select = "*",
    filter,
    enabled = true,
    staleTime = 1000 * 60 * 5, // 5 minutes by default
    cacheTime,
    refetchOnMount,
    refetchOnWindowFocus,
    networkMode,
    forceRefresh = false, // Default to not forcing refresh
    onError,
  } = options;

  return useQuery({
    queryKey: [table, ...queryKey],
    queryFn: async ({ signal }) => {
      // Generate cache key for this specific query
      const cacheKey = localStorageCache.getCacheKey(String(table), queryKey);

      // Try to get data from cache first - unless forceRefresh is true
      if (!forceRefresh) {
        const cachedData = localStorageCache.getFromCache<TableTypes[T][]>(cacheKey);

        // If we have fresh cached data, use it
        if (cachedData && !localStorageCache.isStale(cachedData.timestamp, staleTime)) {
          console.log(`Using cached data for ${String(table)}:`, queryKey);
          return cachedData.data;
        }
      }

      // If no cached data or it's stale, fetch from API
      try {
        console.log(`Fetching fresh data for ${String(table)}:`, queryKey);
        let query = supabase.from(String(table)).select(select);

        if (filter) {
          // Apply filter function using type casting to avoid TS errors
          query = (filter as any)(query);
        }

        if (options.sort) {
          query = query.order(options.sort.column, { ascending: options.sort.ascending });
        }

        // Abort request if signal is aborted
        if (signal?.aborted) {
          throw new Error("Request was aborted");
        }

        const { data, error } = await query;

        if (error) throw error;

        // Cache the fresh data
        if (data) {
          localStorageCache.saveToCache(cacheKey, data);
          console.log(`Updated cache for ${String(table)}:`, queryKey);
        }

        return data;
      } catch (error) {
        console.error(`Error fetching data from ${String(table)}:`, error);
        if (onError && error instanceof Error) {
          onError(error);
        } else if (error instanceof Error && error.message !== "Request was aborted") {
          // Don't show toast for aborted requests
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
    cacheTime,
    refetchOnMount,
    refetchOnWindowFocus,
    networkMode,
  });
}
